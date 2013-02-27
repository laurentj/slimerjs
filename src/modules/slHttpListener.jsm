/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";
var EXPORTED_SYMBOLS = ["slHttpListener"];

const Cu = Components.utils;
const Ci = Components.interfaces;
const Cc = Components.classes;

Cu.import("resource://gre/modules/Services.jsm");


/**
 * @param DOMXULElement element that contains <browser> elements for each webpage
 */
function slHttpListener (browsers){
    this.browsers = browsers;
    // let's listen messages about http requests
    Services.obs.addObserver(this, "http-on-modify-request", false);
    //Services.obs.addObserver(this, "http-on-examine-response", false);
    //Services.obs.addObserver(this, "http-on-examine-cached-response", false);
    //Services.obs.addObserver(this, "http-on-examine-merged-response", false);
}

slHttpListener.prototype = {

    // ------ nsIObserver interface
    observe : function(subject, topic, data) {
        let channel;
        try {
            channel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
        }
        catch(e) {
            //dump("slHttpListener: not http channel\n");
            // if subject is not an HTTP channel, ignore the message
            return;
        }

        let contextWindow = this._getContextWindow(channel);
        if (!contextWindow) {
            //dump("slHttpListener: not context window\n");
            return;
        }
        
        let browser = this._searchBrowser(contextWindow);
        if (!browser) {
            //dump("slHttpListener: not browser\n");
            return;
        }

        browser.requestCounter++;
        let newListener = new TracingListener(browser, browser.requestCounter); // nsIStreamListener
        channel.QueryInterface(Ci.nsITraceableChannel);
        newListener.originalListener = channel.setNewListener(newListener);

        if (browser.webPage.onResourceRequested) {
            browser.webPage.onResourceRequested({
                id:browser.requestCounter,
                method:channel.requestMethod,
                url:channel.URI.spec,
                time: new Date(),
                headers:[]
                });
        }
    },

    // ----- public interface

    tearDown : function() {
        this.browsers = null;
        Services.obs.removeObserver(this, "http-on-modify-request");
        //Services.obs.removeObserver(this, "http-on-examine-response");
        //Services.obs.removeObserver(this, "http-on-examine-cached-response");
        //Services.obs.removeObserver(this, "http-on-examine-merged-response");
    },

    // ----- private interface

    _searchBrowser : function(aWindow) {
        var browsers = this.browsers.children;
        for (let i=1; i < browsers.length; i++) {
            let b = browsers[i];
            if (b.browser.contentWindow == aWindow)
                return b;
        }
        return null;
    },

    /**
     * retrieve the window corresponding to the channel
     */
    _getContextWindow : function (aChannel) {
        try {
            let notificationCallbacks =
                    aChannel.notificationCallbacks ? aChannel.notificationCallbacks : aChannel.loadGroup.notificationCallbacks;

            if (!notificationCallbacks) {
                //dump("slHttpListener: no notificationcallback\n")
              return null;
            }
        
            let loadContext = notificationCallbacks.getInterface(Components.interfaces.nsILoadContext);
            // loadContext.isInBrowserElement == true si <browser>
            if (loadContext.isContent) 
                return loadContext.topWindow; // .associatedWindow , .topFrameElement
                //return loadContext.associatedWindow;
        }
        catch (e) {
        }
        //dump("slHttpListener: window not found\n");
        return null;
    },
    _isXHR : function(request) {
        try {
            let notificationCallbacks =
                aChannel.notificationCallbacks ? aChannel.notificationCallbacks : aChannel.loadGroup.notificationCallbacks;
            if (!notificationCallbacks)
                return null;
            return (notificationCallbacks.getInterface(Ci.nsIXMLHttpRequest) != null);
        }
        catch(e) {
            return null;
        }
    }
}




function TracingListener(browser, id) {
    this.originalListener = null;
    this.browser = browser;
    this.id = id
}

TracingListener.prototype =
{
    onDataAvailable: function(request, context, inputStream, offset, count) {
        this.originalListener.onDataAvailable(request, context, inputStream, offset, count);
    },

    onStartRequest: function(request, context) {
        let channel;
        try {
            channel = request.QueryInterface(Components.interfaces.nsIHttpChannel);
        }
        catch(e) {
            this.originalListener.onStartRequest(request, context);
            //dump("TracingListener: no http channel start\n")
            // if subject is not an HTTP channel, ignore the message
            return;
        }
        if (this.browser.webPage.onResourceReceived)
            this.browser.webPage.onResourceReceived({
                id:this.id,
                url:channel.URI.spec,
                time: new Date(),
                headers:[],
                bodySize:0,
                contentType: channel.contentType,
                redirectURL:'',
                stage:'start',
                status:channel.responseStatus,
                statusText:channel.responseStatusText
        });
        this.originalListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode) {
        let channel;
        try {
            channel = request.QueryInterface(Components.interfaces.nsIHttpChannel);
        }
        catch(e) {
            this.originalListener.onStopRequest(request, context, statusCode);
            //dump("TracingListener: not http channel stop\n")
            // if subject is not an HTTP channel, ignore the message
            return;
        }
        if (this.browser.webPage.onResourceReceived)
            this.browser.webPage.onResourceReceived({
                id:this.id,
                url:channel.URI.spec,
                time: new Date(),
                headers:[],
                bodySize:0,
                contentType: channel.contentType,
                redirectURL:'',
                stage:'end',
                status:channel.responseStatus,
                statusText:channel.responseStatusText
        });
        this.originalListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) ||
            aIID.equals(Ci.nsISupports)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    }
}