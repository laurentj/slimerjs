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
Cu.import('resource://slimerjs/slUtils.jsm');

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
            return browser.currentURI.spec;
        }
        // probably the window is an iframe of the webpage. check if this is
        // the case
        let iframe = Services.wm.getOuterWindowWithId(outerWindowId);
        if (iframe) {
            let dwu = iframe.top.QueryInterface(Ci.nsIInterfaceRequestor)
                            .getInterface(Ci.nsIDOMWindowUtils);
            if (dwu.outerWindowID == domWindowUtils.outerWindowID) {
                let frameLoaderOwner = null;
                try {
                    frameLoaderOwner = iframe.QueryInterface(Components.interfaces.nsIFrameLoaderOwner);
                } catch(e) {}
                if (!frameLoaderOwner || !frameLoaderOwner.frameLoader) {
                    return browser.currentURI.spec+"#from-an-unknown-iframe";
                }
                return frameLoaderOwner.frameLoader.docShell.QueryInterface(Components.interfaces.nsIWebNavigation).currentURI.spec;
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
        var attribute = target.getAttribute('href');
        if (!attribute) {
            return;
        }
        if (!attribute.startsWith('javascript:')) {
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

        if (!/^[a-z]+\:/i.test(uri) ) {
            let f = slUtils.getAbsMozFile(uri, slUtils.workingDirectory);
            uri = Services.io.newFileURI(f).spec;
        }
        try {
          browser.webNavigation.loadURI(uri,
                                     0,
                                     null,
                                     postStream,
                                     headersStream);
        }catch(e) {
            // we have an exception when:
            // - the navigation locked, 0x805e0006 (<unknown>)
            // - the uri is malformed 0x80004005 (NS_ERROR_FAILURE)
            // - the protocol is unknown 0x804b0012 (NS_ERROR_UNKNOWN_PROTOCOL)
            
            let match = /nsresult: "0x([a-f0-9]+) \(([^\)]+)\)/.exec(e.toString());
            if (match) {
                if (match[1] != "805e0006") {
                    let err = new Error(match[2])
                    throw err;
                }
            }
            else {
                let err = new Error("UNKNOWN");
                throw err;
            }
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
        } else if (format == "bmp") {
            finalOptions.contentType = "image/bmp";
        } else if (format == "ico") {
            finalOptions.contentType = "image/vnd.microsoft.icon";
            finalOptions.quality = '-moz-parse-options:format=bmp;bpp=32';
        } else if (format != 'pdf') {
            throw new Error("Render format \"" + format + "\" is not supported");
        }

        return finalOptions;
    },

    getScreenshotCanvas : function(window, ratio, onlyViewport, webpage) {

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
        else {
            givenClip = webpage.clipRect;
        }

        // this clip size is at zoom = 1
        let clip = {top: 0, left: 0, width: 0, height: 0};

        // content size is the size at ratio=1
        let contentWidth = 0;
        let contentHeight = 0;

        if (b) {
            contentWidth = Math.max(b.clientWidth, b.scrollWidth, b.offsetWidth,
                                    de.clientWidth, de.scrollWidth, de.offsetWidth);
            contentHeight =Math.max(b.clientHeight, b.scrollHeight, b.offsetHeight,
                                    de.clientHeight, de.scrollHeight, de.offsetHeight);
        }
        else { // b is undefined for non html document like svg
            contentWidth = Math.max(de.clientWidth, de.scrollWidth, de.offsetWidth);
            contentHeight = Math.max(de.clientHeight, de.scrollHeight, de.offsetHeight);
        }

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

    getPrintOptions : function(webpage, contentWindow, file, options) {
        let currentViewport = webpage.viewportSize;
        let paperSize = webpage.paperSize;
        if (typeof paperSize == 'undefined' || paperSize === null) {
            paperSize = {
                width: currentViewport.width + 'px',
                height: currentViewport.height + 'px',
                margin: '0px'
            };
        }

      if (!('width' in paperSize && 'height' in paperSize) &&
            !('format' in paperSize)) {
            return null;
        }

        let domWindowUtils = contentWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                                        .getInterface(Ci.nsIDOMWindowUtils);
        let currentScreenDPI = domWindowUtils.displayDPI || 96;

        let stringToInches = function(s) {
            let units = {
                'mm': 25.4,
                'cm': 2.54,
                'in': 1,
                'px': currentScreenDPI
            };
            let convert = function(u) {
                let n = parseFloat(s.substr(0, s.length - u.length));
                return n / units[u];
            };
            for (let u in units) if (s.endsWith(u)) return convert(u);
            // default to pixels, TODO: could check for wrong units, how?
            return parseFloat(s) / currentScreenDPI;
        };

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
        printSettings.title                   = webpage.title;
        printSettings.headerStrCenter         = "";
        printSettings.headerStrLeft           = "";
        printSettings.headerStrRight          = "";
        printSettings.footerStrCenter         = "";
        printSettings.footerStrLeft           = "";
        printSettings.footerStrRight          = "";
        printSettings.marginTop               = 0;
        printSettings.marginRight             = 0;
        printSettings.marginBottom            = 0;
        printSettings.marginLeft              = 0;
//        printSettings.edgeTop                 = 0;
//        printSettings.edgeLeft                = 0;
//        printSettings.edgeBottom              = 0;
//        printSettings.edgeRight               = 0;
        printSettings.unwriteableMarginTop    = 0;
        printSettings.unwriteableMarginRight  = 0;
        printSettings.unwriteableMarginBottom = 0;
        printSettings.unwriteableMarginLeft   = 0;
        printSettings.resolution              = 300;
        printSettings.paperSizeUnit           = Ci.nsIPrintSettings.kPaperSizeInches;
        printSettings.scaling                 = options.ratio;

        if ('width' in paperSize && 'height' in paperSize) {
            if ('paperSizeType' in printSettings) { // FX<=45
                printSettings.paperSizeType =  Ci.nsIPrintSettings.kPaperSizeDefined;
            }
            printSettings.paperName = 'Custom';
            printSettings.paperWidth = stringToInches(paperSize.width);
            printSettings.paperHeight = stringToInches(paperSize.height);
            printSettings.shrinkToFit = false;
        } else {
            // for now, we trust the printer config to have the format we want
            if ('paperSizeType' in printSettings) { // FX<=45
                printSettings.paperSizeType  = Ci.nsIPrintSettings.kPaperSizeNativeData;
            }
            printSettings.paperName = paperSize.format;
            if (paperSize.format in this.paperFormat) {
                // it seems that paper width and height are not set automatically...
                printSettings.paperWidth = this.paperFormat[paperSize.format][0];
                printSettings.paperHeight = this.paperFormat[paperSize.format][1];
            }
            if ("orientation" in paperSize) {
                if (paperSize.orientation == "landscape") {
                    printSettings.orientation = Ci.nsIPrintSettings.kLandscapeOrientation;
                } else {
                    printSettings.orientation = Ci.nsIPrintSettings.kPortraitOrientation;
                }
            }
        }

        if ("border" in paperSize && !("margin" in paperSize)) {
            // backwards compatibility with old PhantomJS versions
            paperSize.margin = paperSize.border;
        }
        if ("margin" in paperSize) {
            if (typeof paperSize.margin == "object") {
                let getMargin = function(border) {
                    if (border in paperSize.margin) {
                        return stringToInches(paperSize.margin[border]);
                    } else {
                        return 0;
                    }
                }
                printSettings.marginTop = getMargin("top");
                printSettings.marginRight = getMargin("right");
                printSettings.marginBottom = getMargin("bottom");
                printSettings.marginLeft = getMargin("left");
            }
            else {
                let margin = stringToInches(paperSize.margin);
                printSettings.marginTop = margin;
                printSettings.marginRight = margin;
                printSettings.marginBottom = margin;
                printSettings.marginLeft = margin;
            }
        }
        if ("unwriteableMargin" in paperSize) {
            if (typeof paperSize.unwriteableMargin == "object") {
                let getUnwriteableMargin = function(border) {
                    if (border in paperSize.unwriteableMargin) {
                        return stringToInches(paperSize.unwriteableMargin[border]);
                    } else {
                        return 0;
                    }
                }
                printSettings.unwriteableMarginTop = getUnwriteableMargin("top");
                printSettings.unwriteableMarginRight = getUnwriteableMargin("right");
                printSettings.unwriteableMarginBottom = getUnwriteableMargin("bittom");
                printSettings.unwriteableMarginLeft = getUnwriteableMargin("left");
            }
            else {
                let unwriteableMargin = stringToInches(paperSize.unwriteableMargin);
                printSettings.unwriteableMarginTop = unwriteableMargin;
                printSettings.unwriteableMarginRight = unwriteableMargin;
                printSettings.unwriteableMarginBottom = unwriteableMargin;
                printSettings.unwriteableMarginLeft = unwriteableMargin;
            }
        }
        if ("edge" in paperSize) {
            if (typeof paperSize.edge == "object") {
                let getEdge = function(border) {
                    if (border in paperSize.edge) {
                        return stringToInches(paperSize.edge[border]);
                    } else {
                        return 0;
                    }
                }
                printSettings.edgeTop = getEdge("top");
                printSettings.edgeRight = getEdge("right");
                printSettings.edgeBottom = getEdge("bottom");
                printSettings.edgeLeft = getEdge("left");
            }
            else {
                let edge = stringToInches(paperSize.edge);
                printSettings.edgeTop = edge;
                printSettings.edgeRight = edge;
                printSettings.edgeBottom = edge;
                printSettings.edgeLeft = edge;
            }
        }
        if ("headerStr" in paperSize) {
            if (typeof paperSize.headerStr == "object") {
                let getHeaderStr = function(position) {
                    if (position in paperSize.headerStr) {
                        return paperSize.headerStr[position];
                    } else {
                        return "";
                    }
                }
                printSettings.headerStrLeft = getHeaderStr("left");
                printSettings.headerStrCenter = getHeaderStr("center");
                printSettings.headerStrRight = getHeaderStr("right");
            }
            else {
                printSettings.headerStrLeft = "";
                printSettings.headerStrCenter = paperSize.headerStr;
                printSettings.headerStrRight = "";
            }
        }
        if ("footerStr" in paperSize) {
            if (typeof paperSize.footerStr == "object") {
                let getFooterStr = function(position) {
                    if (position in paperSize.footerStr) {
                        return paperSize.footerStr[position];
                    } else {
                        return "";
                    }
                }
                printSettings.footerStrLeft = getFooterStr("left");
                printSettings.footerStrCenter = getFooterStr("center");
                printSettings.footerStrRight = getFooterStr("right");
            }
            else {
                printSettings.footerStrLeft = "";
                printSettings.footerStrCenter = paperSize.footerStr;
                printSettings.footerStrRight = "";
            }
        }

        if ("printBGImages" in paperSize) {
            printSettings.printBGImages = paperSize.printBGImages;
        }
        if ("printBGColors" in paperSize) {
            printSettings.printBGColors = paperSize.printBGColors;
        }
        if ("title" in paperSize) {
            printSettings.title = paperSize.title;
        }
        if ("shrinkToFit" in paperSize) {
            printSettings.shrinkToFit = paperSize.shrinkToFit;
        }
        /*dump("Print settings: \n");
        for (let xx in printSettings) {
            if (typeof printSettings[xx] != 'object' && typeof printSettings[xx] != 'function') {
                dump(xx+":"+printSettings[xx]+"\n");
            }
        }*/
        return printSettings;
    },
    
    /**
     * print the given content window into a PDF.
     * The code has been inspired by
     *  http://mxr.mozilla.org/mozilla-central/source/mobile/android/chrome/content/browser.js#1284
     */
    renderPageAsPDF : function(contentWindow, printSettings) {

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
            onStatusChange : function(aWebProgress, aRequest, aStatus, aMessage){
            },
            onSecurityChange : function(aWebProgress, aRequest, aState) { },
            onProgressChange : function (aWebProgress, aRequest,
                    aCurSelfProgress, aMaxSelfProgress,
                    aCurTotalProgress, aMaxTotalProgress)
            {}
        }
        webBrowserPrint.print(printSettings, wpListener);

        let thread = Services.tm.currentThread;
        while (!printEnding) {
            thread.processNextEvent(true);
        }

        return true;
    },
    paperFormat : {
              // [ width, height]   in inch
        "A0" : [33.1 , 46.8],
        "A1" : [23.4 , 33.1],
        "A2" : [16.5 , 23.4],
        "A3" : [11.7 , 16.5],
        "A4" : [8.27 , 11.7],
        "A5" : [5.83 , 8.27],
        "A6" : [4.13 , 5.83],
        "A7" : [2.91 , 4.13],
        "A8" : [2.05 , 2.91],
        "A9" : [1.46 , 2.05],
        "A10" : [1.02 , 1.46],
        "B0": [39.4 , 55.7],
        "B1": [27.8 , 39.4],
        "B2": [19.7 , 27.8],
        "B3": [13.9 , 19.7],
        "B4": [9.84 , 13.9],
        "B5": [6.93 , 9.84],
        "B6": [4.92 , 6.93],
        "B7": [3.46 , 4.92],
        "B8": [2.44 , 3.46],
        "B9": [1.73 , 2.44],
        "B10": [1.22 , 1.73],
        "LETTER" : [ 8.5, 11],
        "LEGAL" : [ 8.5, 14],
        "EXECUTIVE" : [ 7.25, 10.5],
        "C5E" : [ 6.38, 9.02],
        "DLE" : [ 4.3, 8.7],
        "FOLIO" : [ 8.27, 13],
        "LEDGER" : [ 17, 11],
        "TABLOID" : [ 11, 17]
    }
}
