/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const {Cc, Ci} = require("chrome");
const {mix} = require("sdk/core/heritage");
const unload = require("sdk/system/unload");

const observers = require("sdk/deprecated/observer-service");

const imgTools = Cc["@mozilla.org/image/tools;1"].getService(Ci.imgITools);
const ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);

let browserMap = new WeakMap();


exports.registerBrowser = function(browser, options) {
    let data = {
        options: mix({
            // These two to get formatted request data
            onRequest: null,
            onResponse: null,

            // These two if you need to tamper data
            _onRequest: null,
            _onResponse: null,

            // Mime types to capture (regexp array)
            captureTypes: []
        }, options || {}),
        requestList: []
    };

    browserMap.set(browser, data);
};

exports.unregisterBrowser = function(browser) {
    try {
        if (browserMap.has(browser)) {
            browserMap.delete(browser);
        }
    } catch(e) {
        console.exception(e);
    }
};

const startTracer = function() {
    observers.add("http-on-modify-request", onRequestStart);
    observers.add("http-on-examine-response", onRequestResponse);
    observers.add("http-on-examine-cached-response", onRequestResponse);

    unload.when(exports.stopTracer);
};
exports.startTracer = startTracer;

const stopTracer = function() {
    try {
        observers.remove("http-on-modify-request", onRequestStart);
        observers.remove("http-on-examine-response", onRequestResponse);
        observers.remove("http-on-examine-cached-response", onRequestResponse);
    } catch(e) {
        console.exception(e);
    }

    browserMap = new WeakMap();
};
exports.stopTracer = stopTracer;

const onRequestStart = function(subject, data) {
    let browser = getBrowserForRequest(subject);
    if (!browser || !browserMap.has(browser)) {
        return;
    }
    let {options, requestList} = browserMap.get(browser);
    requestList.push(subject.name);
    let index = requestList.length - 1;

    if (typeof(options._onRequest) === "function") {
        options._onRequest(subject);
    }

    if (typeof(options.onRequest) === "function") {
        options.onRequest(traceRequest(index, subject));
    }
};

const onRequestResponse = function(subject, data) {
    let browser = getBrowserForRequest(subject);
    if (!browser || !browserMap.has(browser)) {
        return;
    }

    // Get request ID
    let index;
    let {options, requestList} = browserMap.get(browser);
    requestList = requestList.map(function(val, i) {
        if (subject.name == val) {
            index = i;
            return val;
        }
        return val;
    });

    if (typeof(options._onResponse) === "function") {
        options._onResponse(subject);
    }

    let listener = new TracingListener(subject, index, browserMap.get(browser).options);
    subject.QueryInterface(Ci.nsITraceableChannel);
    listener.originalListener = subject.setNewListener(listener);
};


const TracingListener = function(subject, index, options) {
    this.options = options;
    this.response = traceResponse(index, subject);
    this.data = [];
    this.dataLength = 0;
};
TracingListener.prototype = {
    onStartRequest: function(request, context) {
        this.originalListener.onStartRequest(request, context);
        if (typeof(request.URI) === "undefined" || !this._inWindow(request)) {
            return;
        }

        this.response.stage = "start";
        this.response.time = new Date();

        if (typeof(this.options.onResponse) == "function") {
            this.options.onResponse(mix({}, this.response));
        }
    },
    onDataAvailable: function(request, context, inputStream, offset, count) {
        try {
            request = request.QueryInterface(Ci.nsIChannel);
            if (typeof(request.URI) !== "undefined" && this._inWindow(request)) {
                this.dataLength += count;
                let win = getWindowForRequest(request);
                if (this._defragURL(win.location) == request.URI.spec ||
                    /^image\//.test(request.contentType) ||
                    this._shouldCapture(request))
                {
                    let [data, newIS] = this._captureData(inputStream, count);
                    this.data.push(data);
                    inputStream = newIS;
                }
            }
        } catch(e) {
            console.exception(e);
        } finally {
            this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
        }
    },
    onStopRequest: function(request, context, statusCode) {
        this.originalListener.onStopRequest(request, context, statusCode);

        if (typeof(request.URI) === "undefined" || !this._inWindow(request)) {
            this.data = [];
            return;
        }

        // browser could have been removed during request
        let browser = getBrowserForRequest(request);
        if (!browserMap.has(browser)) {
            return;
        }

        if (typeof(this.options.onResponse) != "function") {
            return;
        }

        // Finish response
        this.response.stage = "end";
        this.response.time = new Date();
        this.response.body = this.data.join("");
        this.response.bodySize = this.dataLength;

        if (this.response.redirectURL) {
            this.response.body = "";
            this.response.bodySize = 0;
        }

        if (this.response.body) {
            if (/^image\//.test(this.response.contentType)) {
                this.response.imageInfo = imageInfo(this.response, this.response.body);
            }
            if (!this._shouldCapture(request) &&
                this._defragURL(browser.contentWindow.location) != request.URI.spec)
            {
                this.response.body = "";
            }
        }
        this.data = [];

        this.options.onResponse(mix({}, this.response));
    },

    _inWindow: function(request) {
        let win = getWindowForRequest(request);
        return win !== null && typeof(win) !== "undefined" && typeof(win.document) !== "undefined";
    },

    _shouldCapture: function(request) {
        if (!Array.isArray(this.options.captureTypes)) {
            return false;
        }

        return this.options.captureTypes.some(function(value) {
            try {
                return value.test(request.contentType);
            } catch(e) {}
            return false;
        });
    },

    _captureData: function(inputStream, count) {
        let binaryInputStream = Cc["@mozilla.org/binaryinputstream;1"]
                .createInstance(Ci.nsIBinaryInputStream);
        let storageStream = Cc["@mozilla.org/storagestream;1"]
                .createInstance(Ci.nsIStorageStream);
        let binaryOutputStream = Cc["@mozilla.org/binaryoutputstream;1"]
                .createInstance(Ci.nsIBinaryOutputStream);

        binaryInputStream.setInputStream(inputStream);
        storageStream.init(8192, count, null);
        binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));

        let data = binaryInputStream.readBytes(count);
        binaryOutputStream.writeBytes(data, count);

        return [data, storageStream.newInputStream(0)];
    },

    _defragURL: function(location) {
        return location.href.substr(0, location.href.length - location.hash.length);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Cr.NS_NOINTERFACE;
    }
};


/*
Request & Response objects
*/
const traceRequest = function(id, request) {
    request.QueryInterface(Ci.nsIHttpChannel);
    let headers = [];
    request.visitRequestHeaders(function(name, value) {
        value.split("\n").forEach(function(v) {
            headers.push({"name": name, "value": v});
        });
    });

    return {
        id: id,
        method: request.requestMethod,
        url: request.URI.spec,
        time: new Date(),
        headers: headers
    };
};

const traceResponse = function(id, request) {
    request.QueryInterface(Ci.nsIHttpChannel);
    let headers = [];
    request.visitResponseHeaders(function(name, value) {
        value.split("\n").forEach(function(v) {
            headers.push({"name": name, "value": v});
        });
    });

    // Getting redirect if any
    let redirect = null
    if (parseInt(request.responseStatus / 100) == 3) {
        headers.forEach(function(value) {
            if (value.name.toLowerCase() == "location") {
                redirect = ioService.newURI(value.value, null, request.URI).spec;
            }
        });
    }

    return {
        id: id,
        url: request.URI.spec,
        time: null,
        headers: headers,
        bodySize: 0,
        contentType: request.contentType,
        contentCharset: request.contentCharset,
        redirectURL: redirect,
        stage: null,
        status: request.responseStatus,
        statusText: unescape(encodeURIComponent(request.responseStatusText)),

        // Extensions
        referrer: request.referrer != null && request.referrer.spec || "",
        body: ""
    };
};


/*
Utils
*/

const imageInfo = function(response, data) {
    try {
        let bOS = Cc["@mozilla.org/binaryoutputstream;1"]
                    .createInstance(Ci.nsIBinaryOutputStream);

        let storage = Cc["@mozilla.org/storagestream;1"]
                    .createInstance(Ci.nsIStorageStream);

        storage.init(4096, data.length, null);

        bOS.setOutputStream(storage.getOutputStream(0));
        bOS.writeBytes(data, data.length);
        bOS.close();

        let input = storage.newInputStream(0);

        let bIS = Cc["@mozilla.org/network/buffered-input-stream;1"]
                    .createInstance(Ci.nsIBufferedInputStream);
        bIS.init(input, 1024);

        let outParam = {value: null};
        imgTools.decodeImageData(bIS, response.contentType, outParam);

        return {
            width: outParam.value.width,
            height: outParam.value.height,
            animated: outParam.value.animated
        };
    } catch(e) {
        console.debug("Failed to load image information - ", response.url);
        return {
            width: 0,
            height: 0,
            animated: false
        };
    }
};

const getRequestLoadContext = function(aRequest) {
    if (aRequest && aRequest.notificationCallbacks) {
        try {
            return aRequest.notificationCallbacks.getInterface(Ci.nsILoadContext);
        } catch (ex) { }
    }

    if (aRequest && aRequest.loadGroup
        && aRequest.loadGroup.notificationCallbacks) {
        try {
            return aRequest.loadGroup.notificationCallbacks.getInterface(Ci.nsILoadContext);
        } catch (ex) { }
    }

    return null;
};

const getWindowForRequest = function(aRequest) {
    let loadContext = getRequestLoadContext(aRequest);
    if (loadContext) {
        return loadContext.associatedWindow;
    }
    return null;
};
exports.getWindowForRequest = getWindowForRequest;

const getBrowserForRequest = function(request) {
    if (request instanceof Ci.nsIRequest) {
        try {
            request.QueryInterface(Ci.nsIHttpChannel);
            let window = getWindowForRequest(request);
            if (window) {
                let browser = window.QueryInterface(Ci.nsIInterfaceRequestor)
                   .getInterface(Ci.nsIWebNavigation)
                   .QueryInterface(Ci.nsIDocShell)
                   .chromeEventHandler;

                return browser;
            }
        } catch(e) {}
    }
    return null;
};
exports.getBrowserForRequest = getBrowserForRequest;
