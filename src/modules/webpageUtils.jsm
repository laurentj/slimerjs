/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";
var EXPORTED_SYMBOLS = ["webpageUtils"];

const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;
const fm = Cc['@mozilla.org/focus-manager;1'].getService(Ci.nsIFocusManager);
const de = Ci.nsIDocumentEncoder;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import('resource://slimerjs/httpUtils.jsm');

var webpageUtils = {

    /**
     * evaluate a script directly into the content window
     * @see onLoadFinished, onFrameLoadFinished, to inject phantomjs callback
     * @see webpage.setContent(), webpage.setFrameContent(), webpage.includeJs()
     */
    evalInWindow : function (win, source, url, callback) {
        // we don't use the sandbox, because with it, scripts
        // of the loaded page cannot access to variables/functions
        // created by the injected script. And this behavior
        // is necessary to be compatible with phantomjs.
        let doc = win.document;
        let script = doc.createElement('script');
        script.setAttribute('type', 'text/javascript');
        if (url) {
            script.setAttribute('src', url);
            if (callback) {
                let listener = function(event){
                    script.removeEventListener('load', listener, true);
                    callback();
                }
                script.addEventListener('load', listener, true);
            }
        }
        else {
            script.textContent = source;
        }
        doc.documentElement.appendChild(script);
    },

    /**
     * says if the given outer window id is the ID of the window
     * of the webpage or the window of an iframe of the webpage
     */
    isOurWindow: function (browser, outerWindowId) {
        let domWindowUtils = browser.contentWindow
                    .QueryInterface(Ci.nsIInterfaceRequestor)
                    .getInterface(Ci.nsIDOMWindowUtils);
        if (domWindowUtils.outerWindowID == outerWindowId) {
            return true;
        }
        // probably the window is an iframe of the webpage. check if this is
        // the case
        let iframe = domWindowUtils.getOuterWindowWithId(outerWindowId);
        if (iframe) {
            let dwu = iframe.top.QueryInterface(Ci.nsIInterfaceRequestor)
                            .getInterface(Ci.nsIDOMWindowUtils);
            if (dwu.outerWindowID == domWindowUtils.outerWindowID) {
                return true;
            }
        }
        return false;
    },

    isChromeWindow: function (win) {
        try  {
            win.QueryInterface(Ci.nsIDOMChromeWindow)
            return true;
        }catch(e) {
            return false;
        }
    },

    /**
     * a function to return the focusedWindow.
     * The focus given to a window can take time asynchronously
     * so we're waiting that the focus is done.
     */
    getFocusedWindow: function () {
        let win = fm.focusedWindow;
        let stop = false;
        let timer = Cc['@mozilla.org/timer;1'].createInstance(Ci.nsITimer);
        timer.initWithCallback({
           notify: function () {
                stop = true;
           }
         }, 300, Ci.nsITimer.TYPE_ONE_SHOT);

        let thread = Services.tm.currentThread;
        while (!stop && (!win || webpageUtils.isChromeWindow(win))) {
            thread.processNextEvent(true);
            win = fm.focusedWindow;
        }
        timer.cancel();
        if (stop)
            return null;
        return win;
    },

    /**
     * ugly hack to wait after click processing.
     * Gecko loads the URI of a <a> element, in an asynchronous manner.
     * This is very annoying when this is a "javascript:" uri, because
     * after executing sendEvent, the developer expect that the javascript
     * is executed (this is the behavior in PhantomJS). Unfortunately, this
     * is not the case. So let's wait a bit before continuing the execution.
     */
    sleepIfJavascriptURI : function(domWindowUtils, x, y) {
        var target = domWindowUtils.elementFromPoint(x, y, true, false);
        if (!target || target.localName.toLowerCase() != 'a') {
            return;
        }
        if (!target.getAttribute('href').startsWith('javascript:')) {
            return;
        }
        let ready = false;
        let timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
        timer.initWithCallback(function(){ready = true;}, 500, timer.TYPE_ONE_SHOT);
        let thread = Services.tm.currentThread;
        while (!ready)
            thread.processNextEvent(true);
    },

    /**
     * load the page corresponding to the given uri, into the browser.
     * @param DOMXULElement browser
     * @param string uri
     * @param object httpConf
     * @see webpage.open
     */
    browserLoadURI: function (browser, uri, httpConf) {

        let hasDataToPost = ('data' in httpConf && httpConf.data)

        // prepare headers
        let contentType = '';
        let hasContentLength = false;
        let headersStream = null;
        if ('headers' in httpConf) {
            let headers = '';
            for(let i in httpConf.headers) {
                let headerName = headerUtils.normalizeFieldName(i);
                let headerValue = headerUtils.normalizeFieldValue(httpConf.headers[i].toString());
                if (hasDataToPost) {
                    // if there are data to post, we will indicate the
                    // content type in the data stream
                    if (headerName.toLowerCase() == 'content-type') {
                        contentType = headerValue;
                        continue;
                    }
                    else if (headerName.toLowerCase() == 'content-length') {
                        hasContentLength = true;
                    }
                }
                headers += headerName + ': '+headerValue+"\r\n";
            }
            if (headers) {
                headersStream = Cc["@mozilla.org/io/string-input-stream;1"].
                                createInstance(Ci.nsIStringInputStream);
                headersStream.data = headers;
            }
        }

        // prepare data to post
        // nsDocShell use implicitely a POST method
        // when data are provided for an URI loading.
        // (no way to indicate explictely an other method unfortunately)
        let postStream = null;
        if (hasDataToPost) {
            let dataStream = Cc["@mozilla.org/io/string-input-stream;1"].
                            createInstance(Ci.nsIStringInputStream);
            dataStream.data = httpConf.data;

            postStream = Cc["@mozilla.org/network/mime-input-stream;1"].
                            createInstance(Ci.nsIMIMEInputStream);
            if (contentType)
                postStream.addHeader("Content-Type", contentType);
            else
                postStream.addHeader("Content-Type", "application/x-www-form-urlencoded");
            if (!hasContentLength)
                postStream.addContentLength = true;
            postStream.setData(dataStream);
        }

        // let's reproduce behavior we have in browser.loadURIWithFlags
        browser.userTypedClear++;

        try {
          browser.webNavigation.loadURI(uri,
                                     0,
                                     null,
                                     postStream,
                                     headersStream);
        } finally {
            // if content is not loaded because of navigation locked,
            // we have an exception;
            if (browser.userTypedClear)
                browser.userTypedClear--;
        }
    },

    /**
     * returns the content of the document
     * @param nsIDOMWindow window
     * @param nsIDocShell docShell
     * @param boolean onlyPlainText only the text content
     */
    getWindowContent: function (window, docShell, onlyPlainText) {
        if (!docShell) {
            docShell = window.QueryInterface(Ci.nsIInterfaceRequestor)
                         .getInterface(Ci.nsIWebNavigation)
                         .QueryInterface(Ci.nsIDocShell)
        }
        let channel = docShell.currentDocumentChannel;
        let doc = window.document;
        if (channel.contentType != "text/html" && onlyPlainText) {
            // for text document, the DOMDocument content
            // a <pre> element with the text in it
            if (channel.contentType.indexOf("text/") === 0)
                return doc.body.getElementsByTagName('pre')[0].textContent;
            // FIXME retrieve content for other resource type
            return null
        }
        else {
            // this is an HTML document, use the document encoder
            // to retrieve the text version of the DOM
            let encoder;
            if (onlyPlainText) {
                encoder = Cc["@mozilla.org/layout/documentEncoder;1?type=text/plain"]
                            .createInstance(Ci.nsIDocumentEncoder);
                encoder.init(doc, "text/plain", de.OutputLFLineBreak | de.OutputBodyOnly | de.OutputRaw);
            }
            else {
                encoder = Cc["@mozilla.org/layout/documentEncoder;1?type=text/html"]
                            .createInstance(Ci.nsIDocumentEncoder);
                encoder.init(doc, "text/html", de.OutputLFLineBreak | de.OutputRaw);
            }
            encoder.setNode(doc);
            return encoder.encodeToString();
        }
    },

    getScreenshotCanvas : function(window, ratio, webpage) {

        if (!ratio || (ratio && (ratio <= 0 || ratio > 1))) {
            ratio = 1;
        }

        // mimic PhantomJS image rendering: retrieve content size and set is as viewport
        let currentViewport = webpage.viewportSize;
        let b = window.document.body;
        let de = window.document.documentElement;
        let contentWidth = Math.max(b.clientWidth, b.scrollWidth, b.offsetWidth,
                                de.clientWidth, de.scrollWidth, de.offsetWidth);
        let contentHeight = Math.max(b.clientHeight, b.scrollHeight, b.offsetHeight,
                                de.clientHeight, de.scrollHeight, de.offsetHeight);

        if (contentWidth < currentViewport.width && contentHeight < currentViewport.height) {
            contentWidth = currentViewport.width;
            contentHeight = currentViewport.height;
        }

        let domWindowUtils = window.QueryInterface(Ci.nsIInterfaceRequestor)
                                        .getInterface(Ci.nsIDOMWindowUtils);
        domWindowUtils.setCSSViewport(contentWidth, contentHeight);
        domWindowUtils.redraw(1);

        // now get the rectangle to retrieve
        let clip = webpage.clipRect;
        let top = clip.top || 0;
        let left = clip.left || 0;
        let width = clip.width || contentWidth;
        let height = clip.height || contentHeight;

        // create the canvas
        let canvas = window.document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
        canvas.mozOpaque = true;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);

        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(255,255,255,0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(ratio, ratio);
        ctx.drawWindow(window, left, top, width, height, "rgba(255,255,255,0)");
        ctx.restore();

        domWindowUtils.setCSSViewport(currentViewport.width, currentViewport.height);
        domWindowUtils.redraw(1);

        return canvas;
    }


}
