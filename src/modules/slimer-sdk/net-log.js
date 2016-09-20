/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const {Cc, Ci, Cr, Cu, CC} = require("chrome");
const {mix} = require("sdk/core/heritage");
const unload = require("sdk/system/unload");

const observers = require("sdk/deprecated/observer-service");

const imgTools = Cc["@mozilla.org/image/tools;1"].getService(Ci.imgITools);
const ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
const { TYPE_ONE_SHOT, TYPE_REPEATING_SLACK } = Ci.nsITimer;
const Timer = CC('@mozilla.org/timer;1', 'nsITimer');

Cu.import('resource://slimerjs/slDebug.jsm');
Cu.import("resource://gre/modules/Services.jsm");

let browserMap = new WeakMap();

const NS_ERROR_UCONV_NOCONV = 0x80500001;

var unicodeConverter = null;

function convertToUnicode (text, charset) {
    if (null === unicodeConverter) {
        unicodeConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
                            .createInstance(Ci.nsIScriptableUnicodeConverter);
    }

    if (charset) {
        unicodeConverter.charset = charset;
    }

    return unicodeConverter.ConvertToUnicode(text);
}


/**
 * Register network callbacks on the given browser
 * @param XULElement browser
 * @param object options  it may contains some callbacks
 */
exports.registerBrowser = function(browser, options) {
    let data = {
        options: mix({
            // These two to get formatted request data
            onRequest: null,
            onResponse: null,

            // if you need to tamper data
            _onRequest: null,

            // Mime types to capture (regexp array)
            getCaptureTypes: null,


            // --- callbacks for the main document,
            // that makes net-log a SUPER NET LOGGER. ta-da!

            // The mask.
            // called when the load of new document is asked.
            // receives the uri (string) that is loading
            onLoadStarted: null,

            // The red underpants.
            // called when the URL is changed.
            // The document is not loaded yet.
            // the callback received the new URI (string)
            onURLChanged: null,

            // The red mantle.
            // called when the download of the content
            // of the main document is started.
            // the callback received the URI (string)
            onTransferStarted :null,

            // The blue tights.
            // called when the main content is loaded.
            // dependant resources are not loaded yet
            // and the document is not parsed yet.
            // the callback received the URI (string)
            // and a boolean: true if request is ok
            onContentLoaded: null,

            // The t-shirt with the SUPER logo (or not).
            // called when the document is ready.
            // Receives the URI, and "success" or "fail".
            // All resources are loaded at this time.
            // the document has just received the load event.
            onLoadFinished: null,

            // called when the load of frame is starting.
            // Receives the uri that is loading, and a boolean indicating if it is during
            // the load of the main document (true) or not
            onFrameLoadStarted: null,

            // called when a frame is loaded.
            // Receives the URI, "success" or "fail", the associated window object, and a
            // boolean indicating if it is during the load of the main document (true) or
            // not.
            onFrameLoadFinished: null

        }, options || {}),
        requestList: [],
        progressListener: null
    };

    if (browserMap.has(browser)) {
        let {progressListener} = browserMap.get(browser);
        browser.removeProgressListener(progressListener);
        progressListener.browser = null;
        browserMap.delete(browser);
    }

    data.progressListener = new ProgressListener(browser, data.options);
    browser.addProgressListener(data.progressListener, Ci.nsIWebProgress.NOTIFY_ALL);
    browserMap.set(browser, data);
};

exports.unregisterBrowser = function(browser) {
    try {
        if (browserMap.has(browser)) {
            let {progressListener} = browserMap.get(browser);
            progressListener.browser = null;
            browser.removeProgressListener(progressListener);
            browserMap.delete(browser);
        }
    } catch(e) {
        console.exception(e);
    }
};

const startTracer = function() {
    observers.add("http-on-modify-request", onRequestStart);
    unload.when(exports.stopTracer);
};
exports.startTracer = startTracer;

const stopTracer = function() {
    try {
        observers.remove("http-on-modify-request", onRequestStart);
    } catch(e) {
        console.exception(e);
    }

    //FIXME: remove progressListeners
    // note: WeakMap is not enumerable :-/
    browserMap = new WeakMap();
};
exports.stopTracer = stopTracer;

/**
 * @param nsIRequest/nsIChannel subject
 * @param string data
 */
const onRequestStart = function(subject, data) {
    let browser = getBrowserForRequest(subject);
    if (!browser || !browserMap.has(browser)) {
        return;
    }

    let resourceTimeout = browser.webpage.settings.resourceTimeout;
    let {options, requestList} = browserMap.get(browser);
    requestList.push(subject.name);
    let index = requestList.length;

    if (typeof(options._onRequest) === "function") {
        options._onRequest(subject);
    }

    let req = traceRequest(index, subject);

    if (DEBUG_NETWORK_PROGRESS) {
        slDebugLog("network: resource request #"+req.id+" started: "+req.method+" - "+req.url+" flags="+loadFlags(subject));
        // normal document (html or unsupported file): DOCUMENT_URI, INITIAL_DOCUMENT_URI
        // document resources (img, css, js...): nothing
        // iframe document: DOCUMENT_URI 
        // the url will be redirected: DOCUMENT_URI, INITIAL_DOCUMENT_URI
        // on new url after redirection: DOCUMENT_URI, REPLACE, INITIAL_DOCUMENT_URI
    }

    if (typeof(options.onRequest) === "function") {
        options.onRequest(req,
                          requestController(subject, index, options, req));
    }
    if (subject.status) {
        let [code, msg] = getErrorCode(subject.status);
        if (DEBUG_NETWORK_PROGRESS) {
            slDebugLog("network: resource request #"+req.id+" in error: #"+code+" - "+msg);
        }

        if (typeof(options.onError) === "function") {
            options.onError({id: req.id,
                            url: req.url,
                            errorCode:code,
                            errorString:msg});
        }
    }

    let listener = new TracingListener(index, options, subject, req, resourceTimeout);
    subject.QueryInterface(Ci.nsITraceableChannel);
    listener.originalListener = subject.setNewListener(listener);
};

const onFileRequestStart = function(subject, browser) {
    let {options, requestList} = browserMap.get(browser);
    requestList.push(subject.name);
    let index = requestList.length;

    /*if (typeof(options._onRequest) === "function") {
        options._onRequest(subject);
    }*/

    if (typeof(options.onRequest) === "function") {
        let request = {
            id: index,
            method: 'GET',
            url: subject.URI.spec,
            time: new Date(),
            headers: []
        }
        options.onRequest(request,
                          requestController(subject, index, options, request));
    }
};

const onFileRequestResponse = function(subject, browser) {

    // Get request ID
    let index;
    let {options, requestList} = browserMap.get(browser);
    requestList.forEach(function(val, i) {
        if (subject.name == val) {
            index = i + 1;
        }
    });

    let response = {
        id: index,
        url: subject.URI.spec,
        time: new Date(),
        headers: [],
        bodySize: 0,
        contentType: null,
        contentCharset: null,
        redirectURL: null,
        stage: "start",
        status: null,
        statusText: null,

        // Extensions
        referrer: "",
        isFileDownloading : !! (subject.loadFlags & Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI),
        body: ""
    };
    if (typeof(options.onResponse) == "function") {
        options.onResponse(mix({}, response));
    }
};

const onFileRequestResponseDone = function(subject, browser) {

    // Get request ID
    let index;
    let {options, requestList} = browserMap.get(browser);
    requestList.forEach(function(val, i) {
        if (subject.name == val) {
            index = i + 1;
        }
    });

    let response = {
        id: index,
        url: subject.URI.spec,
        time: new Date(),
        headers: [],
        bodySize: subject.contentLength,
        contentType: null, //subject.contentType, phantomjs doesn't provide it
        contentCharset: subject.contentCharset,
        redirectURL: null,
        stage: "end",
        status: null,
        statusText: null,

        // Extensions
        referrer: "",
        isFileDownloading : !! (subject.loadFlags & Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI),
        body: ""
    };

    if (typeof(options.onResponse) == "function") {
        options.onResponse(mix({}, response));
    }
};

const TracingListener = function(index, options, request, requestJs, timeout) {
    this.index = index;
    this.options = options;
    this.response = null;
    this.errorAlreadyNotified = false;
    this.data = [];
    this.dataLength = 0;
    this.originalRequest = request;
    this.requestJs = requestJs;
    this.timeout = timeout;
    this.timer = null;
    this.timerCallback = null;

    // we don't use the Necko timeout feature because setting the pref
    // network.http.response.timeout sets the timeout for all webpage,
    // and we want the timeout only for the corresponding webpage object.
    if (this.timeout) {
        this.timerCallback = () => {
            request.cancel(Cr.NS_ERROR_NET_TIMEOUT);
            this.timer = null;
        };
        this.timer = Timer();
        this.timer.initWithCallback({
            notify: this.timerCallback
        }, this.timeout, TYPE_ONE_SHOT);
    }
};
TracingListener.prototype = {
    onStartRequest: function(request, context) {

        try {
            request.QueryInterface(Ci.nsIHttpChannel);
            this.originalListener.onStartRequest(request, context);
        } catch(e) {
            //dump("netlog onStartRequest error: "+e+"\n")
        }

        if (typeof(request.URI) === "undefined") {
            return;
        }

        if (!this._inWindow(request) && ! request.loadFlags & Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI) {
            // for request that is not in the window and that is not
            // a download, ignore it
            return;
        }

        if (this.originalRequest.status == Cr.NS_BINDING_REDIRECTED) {
            // when there is a redirection, the original chanel has this status
            // but we receive as "request" argument the new channel. We should ignore
            // this new channel because it has its own TracingListener
            this.response = traceResponse(this.index, this.originalRequest);
            this.response.contentType = null;
            if (typeof(this.options.onResponse) == "function") {
                this.options.onResponse(mix({}, this.response));
                this._triggerEndResponse(null, null);
            }
            this.originalRequest = null;
            return;
        }

        this.response = traceResponse(this.index, request);

        if (DEBUG_NETWORK_PROGRESS) {
            slDebugLog("network: resource #"+this.response.id+" response 'start': "+this.response.url+" flags="+loadFlags(request));
            //normal document: DOCUMENT_URI, INITIAL_DOCUMENT_URI, TARGETED
            //downloaded document: DOCUMENT_URI, RETARGETED_DOCUMENT_URI, INITIAL_DOCUMENT_URI, TARGETED
            //document resources (img, css, js...): nothing
            //iframe document loading: DOCUMENT_URI, TARGETED
            //on resource after redirection: DOCUMENT_URI, REPLACE, INITIAL_DOCUMENT_URI, TARGETED
        }

        if (request.status) {
            let [code, msg] = getErrorCode(request.status);
            if (DEBUG_NETWORK_PROGRESS) {
                slDebugLog("network: resource #"+this.response.id+" response in error: #"+code+" - "+msg);
            }
            if (typeof(this.options.onError) === "function") {
                if (code == 4) {
                    // let's mimic Phantomjs for timeout
                    code = 5;
                    msg = "Operation canceled";
                }
                this.options.onError({id: this.response.id,
                                     url: this.response.url,
                                     errorCode:code,
                                     errorString:msg,
                                     status: this.response.status,
                                     statusText: this.response.statusText,
                                     });
            }
            this.errorAlreadyNotified = true;
        }
        else {
            if (typeof(this.options.onResponse) == "function") {
                this.options.onResponse(mix({}, this.response));
            }

            let errorCode = 0, errorStr;
            if (this.response.status >= 500 ) {
                errorCode = 301;
                errorStr ='Error downloading '+this.response.url+' - server replied: '+this.response.statusText;
            }
            else if (this.response.status >= 400 ) {
                errorStr ='Error downloading '+this.response.url+' - server replied: '+this.response.statusText;
                switch(this.response.status) {
                    case 401:
                        errorCode = 204;
                        errorStr ='Unauthorized content';
                        break;
                    case 403:
                        errorCode = 201;
                        errorStr ='the access to the remote content was denied';
                        break;
                    case 404:
                        errorCode = 203;
                        errorStr ='the remote content was not found at the server';
                        break;
                    case 418: errorCode = 302; break;
                    default:
                        errorCode = 299;
                        break;
                }
            }

            if (errorCode) {
                if (DEBUG_NETWORK_PROGRESS) {
                    slDebugLog("network: resource #"+this.response.id+" response in error (2): #"+errorCode+" - "+errorStr);
                }

                if (typeof(this.options.onError) === "function") {
                    this.options.onError({id: this.response.id,
                                         url: this.response.url,
                                         errorCode:errorCode,
                                         errorString:errorStr});
                }
                this.errorAlreadyNotified = true;
            }
        }
    },
    onDataAvailable: function(request, context, inputStream, offset, count) {

        try {
            //request = request.QueryInterface(Ci.nsIChannel);
            if (this.originalRequest &&
                typeof(request.URI) !== "undefined" &&
                this._inWindow(request)) {

                this.dataLength += count;
                let win = getWindowForRequest(request);
                if (this._defragURL(win.location) == request.URI.spec ||
                    /^image\//.test(request.contentType) || // get data for image to retrieve image information
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
            try {
                // loading may be aborted. let's catch the error...
                this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
            } catch(e) {
            }
        }
        if (this.timeout) {
            if (this.timer) {
                this.timer.cancel();
            }
            this.timer = Timer();
            this.timer.initWithCallback({
                notify: this.timerCallback
            }, this.timeout, TYPE_ONE_SHOT);
        }
    },
    onStopRequest: function(request, context, statusCode) {

        if (this.timer) {
            this.timer.cancel();
            this.timer = null;
            this.timerCallback = null;
        }

        this.originalListener.onStopRequest(request, context, statusCode);
        request = request.QueryInterface(Ci.nsIHttpChannel);
        let isFromWindow = this._inWindow(request);
        let isFileDownloaded = !isFromWindow && (request.loadFlags & Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI);
        if (typeof(request.URI) === "undefined" ||
            !this.originalRequest ||
            (!isFromWindow  && ! isFileDownloaded)
            ) {
            this.data = [];
            return;
        }

        // browser could have been removed during request
        // or for file downloading, there are no browser
        let browser = getBrowserForRequest(request);
        if ((!browser || !browserMap.has(browser)) && !isFileDownloaded && DEBUG_NETWORK_PROGRESS) {
            slDebugLog("network: resource #"+this.response.id+" response -> NO BROWSER IN MAP");
            return;
        }

        if (DEBUG_NETWORK_PROGRESS) {
            slDebugLog("network: resource #"+this.response.id+" response end status: "+this.response.url);
        }
        if (request.status) {
            let [code, msg] = getErrorCode(request.status);
            if (DEBUG_NETWORK_PROGRESS) {
                slDebugLog("network: resource #"+this.response.id+" response in error (3): "+code+" - "+msg);
            }
            if (code == 4) {
                this.options.onTimeout({id: this.response.id,
                                        method: this.requestJs.method,
                                        url: this.response.url,
                                        time: this.requestJs.date,
                                        headers: this.requestJs.headers,
                                        errorCode:408,
                                        errorString:"Network timeout on resource."
                                    });
            }
            else if (!this.errorAlreadyNotified && typeof(this.options.onError) === "function") {
                this.options.onError({id: this.response.id,
                                     url: this.response.url,
                                     errorCode:code,
                                     errorString:msg});
            }
            this.errorAlreadyNotified = false;
        }

        this._triggerEndResponse(browser, request);
        this.originalRequest = null;
    },

    _inWindow: function(request) {
        let win = getWindowForRequest(request);
        return win !== null && typeof(win) !== "undefined" && typeof(win.document) !== "undefined";
    },

    _shouldCapture: function(request) {
        if (!this.options.getCaptureTypes) {
            return false;
        }
        let captureTypes = this.options.getCaptureTypes();
        if (!Array.isArray(captureTypes)) {
            return false;
        }
        return captureTypes.some(function(value) {
            try {
                let r = value.test(request.contentType);
                return r;
            } catch(e) {
            }
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

    _triggerEndResponse : function(browser, request) {
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

        if (this.response.body && this.originalRequest) {
            if (/^image\//.test(this.response.contentType)) {
                this.response.imageInfo = imageInfo(this.response, this.response.body);
            }
            if (!this._shouldCapture(request) &&
                !(browser && this._defragURL(browser.contentWindow.location) == request.URI.spec)) {
                this.response.body = "";
            }
        }

        if (this.response.body && this.response.contentCharset) {
            try {
                this.response.body = convertToUnicode(this.response.body, this.response.contentCharset);
            } catch (e) {
                if (DEBUG_NETWORK_PROGRESS) {
                    var errorMessage = String(('object' === typeof e) ? e.message : e);

                    if (e.message.indexOf('0x80500001') !== -1) {
                        errorMessage = errorMessage.replace('0x80500001', '0x80500001 (NS_ERROR_UCONV_NOCONV)');
                    }

                    slDebugLog(errorMessage);
                }
            }
        }

        this.data = [];
        this.options.onResponse(mix({}, this.response));
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Cr.NS_NOINTERFACE;
    }
};


/**
 * @param nsIRequest/nsIChannel request
 * @param integer index  the number of the request
 * @param object options
 * @param object requestPhantom  the request object exposed to the script
 */
const requestController = function(request, index, options, requestPhantom) {
    return {
        abort: function() {
            request.cancel(Cr.NS_BINDING_ABORTED);
            if (typeof(options.onError) == "function") {
                options.onError(
                    {
                        id: index,
                        url: request.URI.spec,
                        errorCode: 95,
                        errorString: "Resource loading aborted"
                    });
            }
        },
        changeUrl : function(url) {
            if (DEBUG_NETWORK_PROGRESS) {
                slDebugLog("network: resource request #"+requestPhantom.id+": url changed to  "+url+" flags="+loadFlags(request));
            }
            let uri = ioService.newURI(url, null, null);
            request.redirectTo(uri);
        },

        setHeader : function (key, value, merge) {
            merge = (merge?true:false);
            if (value == null) { // null value means to delete the header
                value = '';
                merge = false;
            }
            request.setRequestHeader(key, value, merge);
        }
    }
}

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

    let res = {
        id: id,
        method: request.requestMethod,
        url: request.URI.spec,
        time: new Date(),
        headers: headers
    };

    let stream = request.QueryInterface(Ci.nsIUploadChannel).uploadStream;
    if (stream && (request.requestMethod == 'POST' || request.requestMethod == 'PUT')) {
        try {
            // QueryInterface throw an exception if stream is not a seekable stream
            stream.QueryInterface(Ci.nsISeekableStream);

            let scriptableStream = Cc["@mozilla.org/scriptableinputstream;1"].getService(Ci.nsIScriptableInputStream);
            scriptableStream.init(stream);
            let postData = scriptableStream.read(scriptableStream.available());
            // note: we don't close scriptableStream else it closes stream

            // let's rewind the stream to start
            stream.seek(stream.NS_SEEK_SET, 0);

            // some headers were in the stream, let's remove them
            if (postData.indexOf("\r\n\r\n")>-1) {
                postData = postData.split("\r\n\r\n",2)[1];
            }

            // like in phantomjs, postData should be undefined if not post method
            res.postData = postData; 
        }
        catch(e) {
           // no seekable stream or other errors
           // let's consider that there are no post data
        }
    }
    return res;
};

const traceResponse = function(id, request) {
    request.QueryInterface(Ci.nsIHttpChannel);
    let response = {
            id: id,
            url: request.URI.spec,
            time: new Date(),
            headers: [],
            bodySize: 0,
            contentType: null,
            contentCharset: null,
            redirectURL: null,
            stage: "start",
            status: null,
            statusText: null,
            // Extensions
            referrer: "",
            isFileDownloading: false,
            body: "",
            httpVersion: {
                major: 1,
                minor: 0
            }
    };

    // Try to get the HTTP protocol version, may fail due to nsIHttpChannelInternal being internal
    try {
        let httpVersionMaj = {};
        let httpVersionMin = {};

        let channel = request.QueryInterface(Ci.nsIHttpChannelInternal);
        channel.getResponseVersion(httpVersionMaj, httpVersionMin);

        response.httpVersion.major = httpVersionMaj.value;
        response.httpVersion.minor = httpVersionMin.value;
    } catch(e) {
        // Ignore errors
    }

    try {
        response.status = request.responseStatus;
        response.statusText = unescape(encodeURIComponent(request.responseStatusText));
        response.contentType = request.contentType;
        response.contentCharset = request.contentCharset;
    } catch(e) {
        // status code is not available.
        // probably an 101, 102, 118, 408 http response
        return response;
    }

    if (response.status) {
        request.visitResponseHeaders(function(name, value) {
            value.split("\n").forEach(function(v) {
                response.headers.push({"name": name, "value": v});
            });
        });
    }

    // Getting redirect if any
    if (parseInt(response.status / 100, 10) == 3) {
        response.headers.forEach(function(value) {
            if (value.name.toLowerCase() == "location") {
                response.redirectURL = ioService.newURI(value.value, null, request.URI).spec;
            }
        });
    }

    // Extensions
    response.referrer = request.referrer != null && request.referrer.spec || "";
    response.isFileDownloading = !! (request.loadFlags & Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI);
    return response;
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
        //console.debug("Failed to load image information - "+ response.url);
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
            request.QueryInterface(Ci.nsIChannel);
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


const ProgressListener = function(browser, options) {
    this.browser = browser;
    this.options = options;
    this.mainPageURI = null;
    this.redirecting = false;
};
ProgressListener.prototype = {
    QueryInterface: function(aIID){
        if (aIID.equals(Ci.nsIWebProgressListener) ||
            aIID.equals(Ci.nsISupportsWeakReference) ||
            aIID.equals(Ci.nsISupports))
            return this;
       throw(Cr.NS_NOINTERFACE);
    },

    getLoadContext: function (aChannel) {
        if (!aChannel)
            return null;

        let notificationCallbacks =
                aChannel.notificationCallbacks ? aChannel.notificationCallbacks : aChannel.loadGroup.notificationCallbacks;

        if (!notificationCallbacks) {
            return null;
        }
        try {
            if(notificationCallbacks.getInterface(Ci.nsIXMLHttpRequest)) {
                // ignore requests from XMLHttpRequest
                return null;
            }
        }
        catch(e) { }
        try {
            return notificationCallbacks.getInterface(Ci.nsILoadContext);
        }
        catch (e) {}
        return null;
    },

    isFromMainWindow: function (loadContext) {
        if (loadContext  && loadContext.isContent
            && this.browser.contentWindow == loadContext.associatedWindow)
            return true;
        return false;
    },

    isLoadRequested: function(flags) {
        return (
            flags & Ci.nsIWebProgressListener.STATE_START &&
            flags & Ci.nsIWebProgressListener.STATE_IS_NETWORK &&
            flags & Ci.nsIWebProgressListener.STATE_IS_WINDOW
        )
    },

    isStart: function(flags) {
        return (
            flags & Ci.nsIWebProgressListener.STATE_TRANSFERRING &&
            flags & Ci.nsIWebProgressListener.STATE_IS_REQUEST &&
            flags & Ci.nsIWebProgressListener.STATE_IS_DOCUMENT
        );
    },

    isRedirectionStart: function(flags) {
        return (
            flags & Ci.nsIWebProgressListener.STATE_START &&
            flags & Ci.nsIWebProgressListener.STATE_IS_REQUEST &&
            this.redirecting
        );
    },

    isTransferDone: function(flags) {
        return (
            flags & Ci.nsIWebProgressListener.STATE_STOP &&
            flags & Ci.nsIWebProgressListener.STATE_IS_REQUEST
        );
    },

    isLoaded: function(flags) {
        return (
            flags & Ci.nsIWebProgressListener.STATE_STOP &&
            flags & Ci.nsIWebProgressListener.STATE_IS_NETWORK &&
            flags & Ci.nsIWebProgressListener.STATE_IS_WINDOW
        );
    },

    onLocationChange : function(progress, request, location, flags) {

        if (flags & Ci.nsIWebProgressListener.LOCATION_CHANGE_ERROR_PAGE) {
            //slDebugLog("network: LOCATION_CHANGE_ERROR_PAGE "+location.spec+" flags:"+debugFlags(flags));
            return;
        }
        if (typeof(this.options.onURLChanged) === "function"
            && this.isFromMainWindow(this.getLoadContext(request))) {
            this.options.onURLChanged(location.spec);
        }
    },

    onStateChange: function(progress, request, flags, status) {

        if (!(request instanceof Ci.nsIChannel || "URI" in request)) {
            // ignore requests that are not a channel
            //if (DEBUG_NETWORK_PROGRESS) {
            //    slDebugLog("network: request not a http channel. status: "+getMozErrorName(status)+" flags:"+debugFlags(flags));
            //}
            return
        }
        let uri = request.URI.spec;

        let loadContext = this.getLoadContext(request);

        if (!this.isFromMainWindow(loadContext)) {
            // we receive a new status for a page that is loading in a frame
            if (DEBUG_NETWORK_PROGRESS) {
                slDebugLog("network: frame request "+uri+ " flags:"+debugFlags(flags));
            }

            if (this.isLoadRequested(flags)) {
                if (typeof(this.options.onFrameLoadStarted) === "function") {
                    this.options.onFrameLoadStarted(uri, (this.mainPageURI != null));
                }
            }
            else if (this.isLoaded(flags)) {
                if (typeof(this.options.onFrameLoadFinished) === "function") {
                    let win = (loadContext?loadContext.associatedWindow:null);
                    let success = "success";
                    if (uri != 'about:blank' && request.status) {
                        success = 'fail';
                    }
                    this.options.onFrameLoadFinished(uri, success, win, (this.mainPageURI != null));
                }
            }
            return;
        }

        try {
            if (this.mainPageURI == null) {
                if (this.isLoadRequested(flags)) {
                    if (DEBUG_NETWORK_PROGRESS) {
                        slDebugLog("network: main request starting - "+uri+ " flags:"+debugFlags(flags));
                    }
                    this.mainPageURI = request.URI;
                    if (typeof(this.options.onLoadStarted) === "function") {
                        this.options.onLoadStarted(uri);
                    }
                    if (request.URI.scheme == 'file') {
                        // for file:// protocol, we don't have http-on-* events
                        // let's call options.onRequest...
                        onFileRequestStart(request, this.browser);
                    }
                }
                else if (this.isRedirectionStart(flags)) {
                    this.redirecting = false;
                    this.mainPageURI = request.URI;
                    if (DEBUG_NETWORK_PROGRESS) {
                        slDebugLog("network: redirection starting - "+uri+ " flags:"+debugFlags(flags));
                    }
                }
                else if (DEBUG_NETWORK_PROGRESS) {
                    slDebugLog("network: request ignored. main page uri not started yet - "+uri+ " flags:"+debugFlags(flags));
                }
                return;
            }

            // ignore all request that are not the main request
            if (!this.mainPageURI.equalsExceptRef(request.URI)) {
                if (DEBUG_NETWORK_PROGRESS) {
                    slDebugLog("network: request ignored: "+uri+ " flags:"+debugFlags(flags));
                }
                return;
            }

            if (DEBUG_NETWORK_PROGRESS) {
                slDebugLog("network: main request "+uri+ " flags:"+debugFlags(flags));
            }

            if (this.isStart(flags)) {
                if (DEBUG_NETWORK_PROGRESS) {
                    slDebugLog("network: main request: transfer started");
                }
                if (request.URI.scheme == 'file') {
                    // for file:// protocol, we don't have http-on-* events
                    // let's call options.onResponse...
                    onFileRequestResponse(request, this.browser);
                }
                if (typeof(this.options.onTransferStarted) === "function") {
                    this.options.onTransferStarted(uri);
                }
                return;
            }

            if (this.isTransferDone(flags)) {
                if (DEBUG_NETWORK_PROGRESS) {
                    slDebugLog("network: main request: transfer done");
                }

                if (request.URI.scheme == 'file') {
                    // for file:// protocol, we don't have http-on-* events
                    // let's call options.onResponse...
                    onFileRequestResponseDone(request, this.browser);
                }
                if (typeof(this.options.onContentLoaded) === "function") {
                    this.options.onContentLoaded(uri, (request.status?false:true));
                }
                return;
            }

            if (this.isLoaded(flags)) {
                if (DEBUG_NETWORK_PROGRESS) {
                    slDebugLog("network: main request: is loaded");
                }

                this.mainPageURI = null;
                if (typeof(this.options.onLoadFinished) === "function") {
                    let success = "success";
                    try {
                        request.QueryInterface(Ci.nsIHttpChannel);
                        if (request.responseStatus == 204 || request.responseStatus == 205) {
                            success = 'fail';
                        }
                    }catch(e) {}
                    if (uri != 'about:blank' && request.status) {
                        success = 'fail';
                    }
                    // call onLoadFinished asynchronously, so there are chances that
                    // it is called when the docshell is ready and the page is displayed
                    let opt = this.options;
                    Services.tm.currentThread.dispatch({ run: function(){
                        opt.onLoadFinished(uri, success);
                    }}, Ci.nsIEventTarget.DISPATCH_NORMAL);
                }
                return;
            }

            if (flags & Ci.nsIWebProgressListener.STATE_REDIRECTING) {
                this.redirecting = true;
                this.mainPageURI = null;
                request.QueryInterface(Ci.nsIHttpChannel);
                if (DEBUG_NETWORK_PROGRESS) {
                    slDebugLog("network: main request redirect from "+request.name);
                }
                return;
            }
            if (DEBUG_NETWORK_PROGRESS) {
                slDebugLog("network: main request: ignored state");
            }
        } catch(e) {
            if (DEBUG_NETWORK_PROGRESS) {
                slDebugLog("network: on state change error:"+e);
            }
            console.exception(e);
        }
    },
    onStatusChange : function(aWebProgress, aRequest, aStatus, aMessage){
        if (!DEBUG_NETWORK_PROGRESS)
            return;
        if (!(aRequest instanceof Ci.nsIChannel || "URI" in aRequest)) {
            // ignore requests that are not a channel/http channel
            //slDebugLog("network: onStatusChange, request not a http channel. status: "+getMozErrorName(aStatus));
            return
        }
        slDebugLog("network: status change for "+aRequest.URI.spec+ " ("+aStatus+"): "+aMessage);
    },
    onSecurityChange : function(aWebProgress, aRequest, aState) {
        if (!DEBUG_NETWORK_PROGRESS)
            return;
        if (!(aRequest instanceof Ci.nsIChannel || "URI" in aRequest)) {
            // ignore requests that are not a channel/http channel
            //slDebugLog("network: onSecurityChange, request not a http channel. status: "+debugSecurityFlags(aState));
            return
        }
        slDebugLog("network: security change for "+aRequest.URI.spec+ " : "+debugSecurityFlags(aState));
    },
    debug : function(aWebProgress, aRequest) {},
    onProgressChange : function (aWebProgress, aRequest,
            aCurSelfProgress, aMaxSelfProgress,
            aCurTotalProgress, aMaxTotalProgress) {
        if (!DEBUG_NETWORK_PROGRESS)
            return;
        if (!(aRequest instanceof Ci.nsIChannel || "URI" in aRequest)) {
            // ignore requests that are not a channel/http channel
            return
        }
        slDebugLog("network: progress total:"+aCurTotalProgress+"/"+aMaxTotalProgress+"; uri: "+aCurSelfProgress+"/"+aCurTotalProgress+" for "+aRequest.URI.spec);
    }
};


function getMozErrorName(status) {
    let statusStr = status;
    for (let err in Cr) {
        if (typeof Cr[err]  ==  'number' && Cr[err] == status) {
            statusStr = err;
            break;
        }
    }
    return statusStr;
}

function getErrorCode(status) {
    let errorCode = 99;
    let errorString = 'an unknown network-related error was detected'; //for network error, base is: 0x804b0000
    let statusStr = status;

    for (let err in Cr) {
        if (typeof Cr[err]  ==  'number' && Cr[err] == status) {
            statusStr = err;
            break;
        }
    }
    errorString += " ("+statusStr+")";

    // see http://mxr.mozilla.org/mozilla-release/source/xpcom/base/ErrorList.h#118  for Gecko codes
    switch (status) {
        case Cr.NS_ERROR_MALFORMED_URI:        errorCode= 399 ;  errorString="The URI is malformed"; break;
        case Cr.NS_ERROR_CONNECTION_REFUSED:   errorCode= 1;   errorString="the remote server refused the connection"; break;
        case Cr.NS_ERROR_NET_TIMEOUT:          errorCode= 4;   errorString="the connection to the remote server timed out"; break;
        case Cr.NS_ERROR_OFFLINE:              errorCode= 97;  errorString="The requested action could not be completed in the offline state"; break;
        case Cr.NS_ERROR_NO_CONTENT:           errorCode= 298; errorString="Channel opened successfully but no data will be returned"; break;
        case Cr.NS_ERROR_NET_PARTIAL_TRANSFER: errorCode= 298 ; errorString="A transfer was only partially done when it completed"; break;
        case Cr.NS_ERROR_ALREADY_CONNECTED:
        case Cr.NS_ERROR_NOT_CONNECTED:
        case Cr.NS_ERROR_ALREADY_OPENED:
        case Cr.NS_ERROR_DNS_LOOKUP_QUEUE_FULL:
        case Cr.NS_ERROR_UNKNOWN_SOCKET_TYPE:
        case Cr.NS_ERROR_INSUFFICIENT_DOMAIN_LEVELS:
        case Cr.NS_ERROR_SOCKET_ADDRESS_NOT_SUPPORTED:
        case Cr.NS_ERROR_SOCKET_ADDRESS_IN_USE:
        //case Cr.NS_ERROR_INTERCEPTION_FAILED:
        case Cr.NS_ERROR_SOCKET_CREATE_FAILED: errorCode=8 ;   errorString="The connection was broken due to disconnection from the network or failure to start the network"; break;
        case Cr.NS_ERROR_UNKNOWN_PROTOCOL:     errorCode= 301; errorString="The URI scheme corresponds to an unknown protocol handler"; break;
        case Cr.NS_ERROR_PORT_ACCESS_NOT_ALLOWED: errorCode= 96; errorString="Establishing a connection to an unsafe or otherwise banned port was prohibited"; break;
        case Cr.NS_ERROR_NOT_RESUMABLE:
        case Cr.NS_ERROR_NET_INTERRUPT:
        case Cr.NS_ERROR_NET_RESET:            errorCode= 2;   errorString="the remote server closed the connection prematurely"; break;
        case Cr.NS_ERROR_INVALID_CONTENT_ENCODING: errorCode= 399; errorString="The content encoding of the source document is incorrect"; break;
        case Cr.NS_ERROR_UNKNOWN_HOST:         errorCode= 3;   errorString="The lookup of the hostname failed"; break;
        case Cr.NS_ERROR_REDIRECT_LOOP:        errorCode= 297; errorString="The request failed as a result of a detected redirection loop"; break;
        case Cr.NS_ERROR_CORRUPTED_CONTENT:    errorCode= 296; errorString="Corrupted content was received from server"; break;
        case Cr.NS_ERROR_PROXY_CONNECTION_REFUSED: errorCode=101; errorString="The connection to the proxy server was refused"; break;
        case Cr.NS_ERROR_UNKNOWN_PROXY_HOST:   errorCode= 103; errorString="The lookup of the proxy hostname failed"; break;
        case Cr.NS_ERROR_REMOTE_XUL:
        case Cr.NS_ERROR_UNSAFE_CONTENT_TYPE: errorCode= 9; errorString="the background request is not currently allowed due to platform policy"; break;
        case Cr.NS_ERROR_HOST_IS_IP_ADDRESS: errorCode= 399; errorString="The host string is an IP address"; break;
        case Cr.NS_ERROR_FIRST_HEADER_FIELD_COMPONENT_EMPTY: errorCode= 399; errorString="Syntax error in headers"; break;
        case Cr.NS_ERROR_IN_PROGRESS:
            errorString += " - in progress";
            break;
        case Cr.NS_ERROR_ENTITY_CHANGED:
            errorString += " - entity changed";
            break;
        case Cr.NS_ERROR_CACHE_KEY_NOT_FOUND:
        case Cr.NS_ERROR_CACHE_DATA_IS_STREAM:
        case Cr.NS_ERROR_CACHE_DATA_IS_NOT_STREAM:
        case Cr.NS_ERROR_CACHE_WAIT_FOR_VALIDATION:
        case Cr.NS_ERROR_CACHE_ENTRY_DOOMED:
        case Cr.NS_ERROR_CACHE_READ_ACCESS_DENIED:
        case Cr.NS_ERROR_CACHE_WRITE_ACCESS_DENIED:
        case Cr.NS_ERROR_CACHE_IN_USE:
        case Cr.NS_ERROR_DOCUMENT_NOT_CACHED:
            errorCode= 295; errorString="Error with the cache"; break;
        case Cr.NS_BINDING_FAILED:
            errorString="The request failed for some unknown reason"; break
        case Cr.NS_BINDING_ABORTED:
            errorString="The request has been aborted"; break
        case Cr.NS_BINDING_REDIRECTED:
            errorString="The request has been aborted by a redirection"; break
        case Cr.NS_BINDING_RETARGETED:
            errorString="The request has been retargeted"; break
        case Cr.NS_ERROR_LOAD_SHOWED_ERRORPAGE:
            errorString = "The request resulted in an error page being displayed"; break;
    }
    return [errorCode, errorString];
}




function debugFlags(flags) {
    let s = '';

    if (flags & Ci.nsIWebProgressListener.STATE_START)
        s += "START,";

    if (flags & Ci.nsIWebProgressListener.STATE_REDIRECTING)
        s += "REDIRECTING,";

    if (flags & Ci.nsIWebProgressListener.STATE_TRANSFERRING)
        s += "TRANSFERRING,";

    if (flags & Ci.nsIWebProgressListener.STATE_NEGOTIATING)
        s += "NEGOTIATING,";

    if (flags & Ci.nsIWebProgressListener.STATE_STOP)
        s += "STOP,";

    if (flags & Ci.nsIWebProgressListener.STATE_IS_REQUEST)
        s += "IS_REQ,";

    if (flags & Ci.nsIWebProgressListener.STATE_IS_DOCUMENT)
        s += "IS_DOC,";

    if (flags & Ci.nsIWebProgressListener.STATE_IS_NETWORK)
        s += "IS_NET,";

    if (flags & Ci.nsIWebProgressListener.STATE_IS_WINDOW)
        s += "IS_WIN,";

    if (flags & Ci.nsIWebProgressListener.STATE_RESTORING)
        s += "RESTORING,";
    return s;
}

function debugSecurityFlags(flags) {
    let s = '';

    if (flags & Ci.nsIWebProgressListener.STATE_IS_INSECURE)
        s += "IS_INSECURE,";

    if (flags & Ci.nsIWebProgressListener.STATE_IS_BROKEN)
        s += "IS_BROKEN,";

    if (flags & Ci.nsIWebProgressListener.STATE_IS_SECURE)
        s += "IS_SECURE,";

    if (flags & Ci.nsIWebProgressListener.STATE_SECURE_HIGH)
        s += "SECURE_HIGH,";

    if (flags & Ci.nsIWebProgressListener.STATE_SECURE_MED)
        s += "SECURE_MED,";

    if (flags & Ci.nsIWebProgressListener.STATE_SECURE_LOW)
        s += "SECURE_LOW,";
    return s;
}


function loadFlags(request) {

    let s = '';
    let f = request.loadFlags;

    if ((f & Ci.nsIChannel.LOAD_DOCUMENT_URI) == Ci.nsIChannel.LOAD_DOCUMENT_URI)
        s += "DOCUMENT_URI, ";

    if ((f & Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI) == Ci.nsIChannel.LOAD_RETARGETED_DOCUMENT_URI)
        s += "RETARGETED_DOCUMENT_URI, ";

    if ((f & Ci.nsIChannel.LOAD_REPLACE) == Ci.nsIChannel.LOAD_REPLACE)
        s += "REPLACE, ";

    if ((f & Ci.nsIChannel.LOAD_INITIAL_DOCUMENT_URI) == Ci.nsIChannel.LOAD_INITIAL_DOCUMENT_URI)
        s += "INITIAL_DOCUMENT_URI, ";

    if ((f & Ci.nsIChannel.LOAD_TARGETED) == Ci.nsIChannel.LOAD_TARGETED)
        s += "TARGETED, ";

    return s;
}
