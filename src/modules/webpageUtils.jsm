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
        }catch(e) {
            // if content is not loaded because of navigation locked,
            // we have an exception;
        } finally {
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
    getWindowContent: function (window, docShell, onlyPlainText, allTextContent) {
        if (!docShell) {
            docShell = window.QueryInterface(Ci.nsIInterfaceRequestor)
                         .getInterface(Ci.nsIWebNavigation)
                         .QueryInterface(Ci.nsIDocShell);
        }
        let channel = docShell.currentDocumentChannel;
        let doc = window.document;
        if (channel.contentType != "text/html" && onlyPlainText) {
            // for text document, the DOMDocument content
            // a <pre> element with the text in it
            if (channel.contentType.indexOf("text/") === 0 ||
                channel.contentType.indexOf("application/json") === 0)
                return doc.body.getElementsByTagName('pre')[0].textContent;
            // FIXME retrieve content for other resource type
            return null;
        }
        else {
            // this is an HTML document, use the document encoder
            // to retrieve the text version of the DOM
            let encoder;
            if (onlyPlainText) {
                encoder = Cc["@mozilla.org/layout/documentEncoder;1?type=text/plain"]
                            .createInstance(Ci.nsIDocumentEncoder);
                let flags =de.OutputLFLineBreak | de.OutputPersistNBSP | de.OutputBodyOnly;
                if (!allTextContent) {
                    flags |= de.SkipInvisibleContent | de.OutputNoScriptContent;
                }
                encoder.init(doc, "text/plain", flags);
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

    /**
     * set a new content to the given window
     * @param nsIDocShell docShell
     * @param string htmlContent
     * @param nsIURI uri
     */
    setWindowContent: function (docShell, htmlContent, uri) {
        
        // prepare input stream and channel
        var stringStream = Cc["@mozilla.org/io/string-input-stream;1"]
                            .createInstance(Ci.nsIStringInputStream);
        stringStream.setData(htmlContent, htmlContent.length);

        var streamChannel = Cc["@mozilla.org/network/input-stream-channel;1"]
                            .createInstance(Ci.nsIInputStreamChannel);
        streamChannel.setURI(uri);
        streamChannel.contentStream = stringStream;

        var channel = streamChannel.QueryInterface(Ci.nsIChannel);
        channel.contentCharset = "UTF-8"

        var loadFlags = channel.LOAD_DOCUMENT_URI |
                        channel.LOAD_CALL_CONTENT_SNIFFERS |
                        channel.LOAD_INITIAL_DOCUMENT_URI |
                        Ci.nsIRequest.LOAD_BYPASS_CACHE |
                        Ci.nsIRequest.VALIDATE_NEVER |
                        Ci.nsIRequest.LOAD_FRESH_CONNECTION

        channel.loadFlags = loadFlags;

        // load the given content through a URI loader
        var URILoader = Cc["@mozilla.org/uriloader;1"]
                        .getService(Ci.nsIURILoader);
        var ir = docShell.QueryInterface(Ci.nsIInterfaceRequestor)
        URILoader.openURI(channel, 0, ir);
    },

    getPrintOptions : function(webpage, options) {
        let currentViewport = webpage.viewportSize;

        let printOptions = {
            ratio: webpage.zoomFactor,
            format: 'pdf',
            height: currentViewport.height,
            width: currentViewport.width,
            onlyViewport: false,
            resolution: 300, // dpi
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
            unwriteableMarginTop: 0,
            unwriteableMarginRight: 0,
            unwriteableMarginBottom: 0,
            unwriteableMarginLeft: 0
        };

        if (typeof(options) == 'object') {
          for (var attr in options) { printOptions[attr] = options[attr]; }
        }

        return printOptions;
    },

    getScreenshotOptions : function(webpage, options, alternateFormat) {
        let finalOptions = {
            format: 'png',
            quality: 80,
            ratio: webpage.zoomFactor,
            onlyViewport: false,
            contentType : 'image/png'
        };

        if (typeof(options) == 'object') {
            if ('format' in options)
                finalOptions.format = options.format;
            else if (alternateFormat) {
                finalOptions.format = alternateFormat
            }

            if ('ratio' in options)
                finalOptions.ratio = options.ratio;
            if ('quality' in options) {
                if (options.quality > 1 ) {
                    finalOptions.quality = parseInt(options.quality) / 100;
                }
                else {
                    // for deprecated behavior, when value was between 0 and 1
                    finalOptions.quality = parseFloat(options.quality);
                }
            }
            if ('onlyViewport' in options) {
                finalOptions.onlyViewport = options.onlyViewport;
            }
        }
        else if (typeof(options) == 'string') {
            finalOptions.format = options;
        }
        else if (alternateFormat) {
            finalOptions.format = alternateFormat
        }
        let format = (finalOptions.format || "png").toString().toLowerCase();
        if (format == "png") {
            finalOptions.contentType = "image/png";
        } else if (format == "jpeg" || format == 'jpg') {
            finalOptions.contentType = "image/jpeg";
        } else if (format != 'pdf') {
            throw new Error("Render format \"" + format + "\" is not supported");
        }

        return finalOptions;
    },

    getScreenshotCanvas : function(window, ratio, onlyViewport, webpage) {
        let MAX_WIDTH = 10000;
        let MAX_HEIGHT = 10000;
        
        if (!ratio || (ratio && ratio <= 0)) {
            ratio = 1;
        }

        let domWindowUtils;
        let b = window.document.body;
        let de = window.document.documentElement;

        // size of the image "we see" at current zoom level
        let currentViewport = webpage.viewportSize;
        // size of the futur image
        let canvasHeight, canvasWidth;

        // coordinate of the scroll (at zoom level)
        let scrollX = window.scrollX;
        let scrollY = window.scrollY;

        //dump("scrollX="+scrollX+" scrollY="+scrollY+"\n")
        // given clip size is at zoom level
        let givenClip;

        if (onlyViewport) {
            givenClip = {
                        top:scrollY,
                        left:scrollX,
                        width:currentViewport.width,
                        height:currentViewport.height
                        }
        }
        else
            givenClip = webpage.clipRect;

        // this clip size is at zoom = 1
        let clip = {top: 0, left: 0, width: 0, height: 0};

        // content size is the size at ratio=1
        let contentWidth = Math.max(b.clientWidth, b.scrollWidth, b.offsetWidth,
                                de.clientWidth, de.scrollWidth, de.offsetWidth);
        let contentHeight = Math.max(b.clientHeight, b.scrollHeight, b.offsetHeight,
                                de.clientHeight, de.scrollHeight, de.offsetHeight);

        if ((givenClip.top == 0 && givenClip.left == 0 && givenClip.width == 0 && givenClip.height == 0)) {
            clip.top = scrollY / ratio;
            clip.left = scrollX / ratio;

            clip.width = currentViewport.width / ratio;
            clip.height = currentViewport.height / ratio;

            // mimic PhantomJS image rendering: retrieve content size and use it
            // it as clip size. if result size is lower than viewport, take viewport
            // size
            if ((contentWidth-clip.left) > clip.width) {
                clip.width = contentWidth - clip.left;
                canvasWidth = (contentWidth * ratio) - scrollX;
            }
            else
                canvasWidth = clip.width * ratio;

            if ((contentHeight-clip.top) > clip.height) {
                clip.height = contentHeight - clip.top;
                canvasHeight = (contentHeight * ratio) - scrollY;
            }
            else
                canvasHeight = clip.height * ratio;
        }
        else {
            // givenClip is define, we take its values for clip.
            // givenClip values include zoom level
            clip.top = givenClip.top / ratio;
            clip.left = givenClip.left / ratio;

            if (givenClip.width == 0) {
                clip.width = contentWidth;
                canvasWidth = contentWidth * ratio;
            }
            else {
                clip.width = givenClip.width / ratio ;
                canvasWidth = givenClip.width;
            }

            if (givenClip.height == 0) {
                clip.height = contentHeight;
                canvasHeight = contentHeight * ratio;
            }
            else {
                clip.height = givenClip.height / ratio ;
                canvasHeight = givenClip.height;
            }
        }
        
        clip.width = Math.min(clip.width, MAX_WIDTH);
        clip.height = Math.min(clip.height, MAX_HEIGHT);
        canvasWidth = Math.min(canvasWidth, MAX_WIDTH);
        canvasHeight = Math.min(canvasHeight, MAX_HEIGHT);
        
        //dump("size clip: "+ clip.width +" x "+ clip.height+" @ "+clip.left+","+clip.top+"\n");
        //dump("size canvas: "+ canvasWidth +" x "+ canvasHeight+"\n");
        //dump("Ratio:"+ratio+"\n");

        // create the canvas
        let canvas = window.document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        let ctx = canvas.getContext("2d");
        ctx.scale(ratio, ratio);
        ctx.drawWindow(window, clip.left, clip.top, clip.width, clip.height, "rgba(0,0,0,0)");
        ctx.restore();

        return canvas;
    },

    /**
     * print the given content window into a PDF.
     * The code has been inspired by http://mxr.mozilla.org/mozilla-central/source/mobile/android/chrome/content/browser.js#932
     */
    renderPageAsPDF : function(contentWindow, file, options) {
        let printSettings = Cc["@mozilla.org/gfx/printsettings-service;1"]
                                .getService(Ci.nsIPrintSettingsService)
                                .newPrintSettings;

        printSettings.printSilent             = true;
        printSettings.showPrintProgress       = false;
        printSettings.printBGImages           = true;
        printSettings.printBGColors           = true;
        printSettings.printToFile             = true;
        printSettings.toFileName              = file;
        printSettings.printFrameType          = Ci.nsIPrintSettings.kFramesAsIs;
        printSettings.outputFormat            = Ci.nsIPrintSettings.kOutputFormatPDF;
        printSettings.footerStrCenter         = "";
        printSettings.footerStrLeft           = "";
        printSettings.footerStrRight          = "";
        printSettings.headerStrCenter         = "";
        printSettings.headerStrLeft           = "";
        printSettings.headerStrRight          = "";
        printSettings.marginTop               = options.marginTop;
        printSettings.marginRight             = options.marginRight;
        printSettings.marginBottom            = options.marginBottom;
        printSettings.marginLeft              = options.marginLeft;
        printSettings.unwriteableMarginTop    = options.unwriteableMarginTop;
        printSettings.unwriteableMarginRight  = options.unwriteableMarginRight;
        printSettings.unwriteableMarginBottom = options.unwriteableMarginBottom;
        printSettings.unwriteableMarginLeft   = options.unwriteableMarginLeft;
        printSettings.resolution              = options.resolution;
        printSettings.paperName               = 'Custom'
        printSettings.paperSizeType           = 1;
        printSettings.paperWidth              = options.width;
        printSettings.paperHeight             = options.height;
        printSettings.paperSizeUnit           = Ci.nsIPrintSettings.kPaperSizeMillimeters;
        printSettings.scaling                 = options.ratio;

        let ms = Cc["@mozilla.org/mime;1"].getService(Ci.nsIMIMEService);
        let mimeInfo = ms.getFromTypeAndExtension("application/pdf", "pdf");

        let webBrowserPrint = contentWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                                           .getInterface(Ci.nsIWebBrowserPrint);
        let printEnding = false;
        let wpListener = {
            QueryInterface: function(aIID){
                if (aIID.equals(Ci.nsIWebProgressListener) ||
                    aIID.equals(Ci.nsISupportsWeakReference) ||
                    aIID.equals(Ci.nsISupports))
                    return this;
               throw(Cr.NS_NOINTERFACE);
            },
            onLocationChange : function(progress, request, location, flags) {
            },
            onStateChange: function(progress, request, flags, status) {
                if ((flags & Ci.nsIWebProgressListener.STATE_STOP)
                    && (flags & Ci.nsIWebProgressListener.STATE_IS_NETWORK)) {
                    printEnding = true;
                }
            },
            onStatusChange : function(aWebProgress, aRequest, aStatus, aMessage){},
            onSecurityChange : function(aWebProgress, aRequest, aState) { },
            onProgressChange : function (aWebProgress, aRequest,
                    aCurSelfProgress, aMaxSelfProgress,
                    aCurTotalProgress, aMaxTotalProgress)
            {}
        }
        webBrowserPrint.print(printSettings, wpListener);

        let thread = Services.tm.currentThread;
        while (!printEnding)
            thread.processNextEvent(true);

        return true;
    }
}
