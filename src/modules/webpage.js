/*
* This file is part of the SlimerJS project from Innophi.
* https://github.com/laurentj/slimerjs
*
* Copyright (c) 2012 Laurent Jouanneau
*
* Permission is hereby granted, free of charge, to any person obtaining a
* copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included
* in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
* OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
* THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS IN THE SOFTWARE.
*/

const { Cc, Ci, Cu } = require('chrome');
Cu.import('resource://slimerjs/slLauncher.jsm');
Cu.import('resource://slimerjs/slUtils.jsm');
Cu.import('resource://slimerjs/slConfiguration.jsm');
Cu.import("resource://gre/modules/Services.jsm");
Cu.import('resource://slimerjs/slPhantomJSKeyCode.jsm');
Cu.import('resource://slimerjs/slQTKeyCodeToDOMCode.jsm');


function create() {
    // private properties for the webpage object
    var navigator = null;

    var libPath = slConfiguration.scriptFile.parent.clone();

    var webpage = {

        settings : null,

        // ------------------------ cookies and headers
        get cookies() {
            throw "Not Implemented"
        },

        set cookies(val) {
            throw "Not Implemented"
        },

        get customHeaders() {
            throw "Not Implemented"
        },

        set customHeaders(val) {
            throw "Not Implemented"
        },

        addCookie: function(cookie) {
            throw "Not Implemented"
        },

        clearCookies: function() {
            throw "Not Implemented"
        },

        deleteCookie: function(cookieName) {
            throw "Not Implemented"
        },

        // -------------------------------- History

        get canGoBack () {
            throw "Not Implemented"
        },

        get canGoForward () {
            throw "Not Implemented"
        },

        go : function(index) {
            throw "Not Implemented"
        },

        goBack : function() {
            throw "Not Implemented"
        },

        goForward : function() {
            throw "Not Implemented"
        },

        get navigationLocked() {
            throw "Not Implemented"
        },

        set navigationLocked(val) {
            throw "Not Implemented"
        },

        reload : function() {
            throw "Not Implemented"
        },

        stop : function() {
            throw "Not Implemented"
        },

        // -------------------------------- Window manipulation

        /**
         * Open a web page in a browser
         * @param string url    the url of the page to open
         * @param function callback  a function called when the page is loaded. it
         *                           receives "success" or "fail" as parameter.
         */
        open: function(url, callback) {
            if (navigator) {
                // don't recreate a browser if already opened.
                navigator.onpageloaded = function (success) {
                    navigator.onpageloaded = null;
                    if (callback)
                        callback(success);
                }
                navigator.browser.loadURI(url);
                return;
            }
            slLauncher.openBrowser(function(nav){
                navigator = nav;
                navigator.webPage = webpage;
                navigator.onpageloaded = function (success) {
                    navigator.onpageloaded = null;
                    if (callback)
                        callback(success);
                }
                navigator.browser.loadURI(url);
            }, navigator);
        },

        openUrl: function(url, httpConf, settings) {
            throw "Not Implemented"
        },

        /**
         * close the browser
         */
        close: function() {
            if (navigator) {
                if (this.onClosing)
                    this.onClosing(this);
                slLauncher.closeBrowser(navigator);
            }
            navigator=null;
        },

        /**
         * function called when the browser is being closed, during a call of WebPage.close()
         * or during a call of window.close() inside the web page (not implemented yet)
         */
        onClosing: null,

        childFramesCount: function () {
            throw "Not Implemented"
        },

        childFramesName : function () {
            throw "Not Implemented"
        },

        currentFrameName : function () {
            throw "Not Implemented"
        },

        get frameUrl() {
            throw "Not Implemented"
        },

        get focusedFrameName () {
            throw "Not Implemented"
        },

        get frameCount () {
            throw "Not Implemented"
        },

        get framesName () {
            throw "Not Implemented"
        },

        get ownsPages () {
            throw "Not Implemented"
        },

        getPage: function (windowName) {
            throw "Not Implemented"
        },

        get pages () {
            throw "Not Implemented"
        },

        get pagesWindowName () {
            throw "Not Implemented"
        },

        release : function() {
            throw "Not Implemented"
        },

        get scrollPosition() {
            throw "Not Implemented"
        },

        set scrollPosition(val) {
            throw "Not Implemented"
        },

        switchToFocusedFrame: function() {
            throw "Not Implemented"
        },

        switchToFrame: function(frame) {
            throw "Not Implemented"
        },

        switchToChildFrame: function(frame) {
            throw "Not Implemented"
        },

        switchToMainFrame: function() {
            throw "Not Implemented"
        },

        switchToParentFrame: function() {
            throw "Not Implemented"
        },

        get url() {
            if (navigator)
                return navigator.browser.currentURI.spec;
            return "";
        },

        get viewportSize() {
            throw "Not Implemented"
        },

        set viewportSize(val) {
            throw "Not Implemented"
        },


        get windowName () {
            throw "Not Implemented"
        },

        // -------------------------------- Javascript evaluation

        evaluate: function(func, arg) {
            if (navigator)
                return navigator.evaluate(func, arg);
            throw "WebPage not opened";
        },

        evaluateJavascript: function(src) {
            throw "Not Implemented"
        },

        evaluateAsync: function(func) {
            if (navigator)
                return navigator.evaluateAsync(func);
            throw "WebPage not opened";
        },
        includeJs: function(url, callback) {
            if (navigator)
                return navigator.includeJS(url, callback);
            throw "WebPage not opened";
        },

        get libraryPath () {
            return libPath.path;
        },
        set libraryPath (path) {
            libPath = Cc['@mozilla.org/file/local;1']
                            .createInstance(Ci.nsILocalFile);
            libPath.initWithPath(path);
        },

        injectJs: function(filename) {
            // filename resolved against the libraryPath property
            let f = getMozFile(filename, libPath);
            let source = readSyncStringFromFile(f);
            if (navigator) {
                navigator.injectJS(source);
            }
        },
        get onError() {
            throw "Not Implemented"
        },
        set onError(callback) {
            throw "Not Implemented"
        },

        // --------------------------------- content manipulation

        get content () {
            if (!navigator)
                throw "WebPage not opened";

            const de = Ci.nsIDocumentEncoder
            let encoder = Cc["@mozilla.org/layout/documentEncoder;1?type=text/html"]
                            .createInstance(Ci.nsIDocumentEncoder);
            let doc = navigator.browser.contentDocument;
            encoder.init(doc, "text/html", de.OutputLFLineBreak | de.OutputRaw);
            encoder.setNode(doc);
            return encoder.encodeToString();
        },

        set content(val) {
            throw "Not Implemented"
        },

        get frameContent() {
            throw "Not Implemented"
        },

        set frameContent(val) {
            throw "Not Implemented"
        },

        get framePlainText() {
            throw "Not Implemented"
        },

        get frameTitle() {
            throw "Not Implemented"
        },

        get offlineStoragePath() {
            throw "Not Implemented"
        },

        set offlineStoragePath(val) {
            throw "Not Implemented"
        },

        get offlineStorageQuota() {
            throw "Not Implemented"
        },

        set offlineStorageQuota(val) {
            throw "Not Implemented"
        },


        get plainText() {
            if (!navigator)
                throw "WebPage not opened";

            const de = Ci.nsIDocumentEncoder
            let encoder = Cc["@mozilla.org/layout/documentEncoder;1?type=text/plain"]
                            .createInstance(Ci.nsIDocumentEncoder);
            let doc = navigator.browser.contentDocument;
            encoder.init(doc, "text/plain", de.OutputLFLineBreak | de.OutputBodyOnly);
            encoder.setNode(doc);
            return encoder.encodeToString();
        },

        sendEvent: function(eventType, arg1, arg2, button, modifier) {
            if (!navigator)
                throw new Error("WebPage not opened");
// TODO: process modifier
            if (eventType == 'keydown' || eventType == 'keyup') {
                var keyCode = arg1;
                if ((typeof keyCode) != "number") {
                    if (keyCode.length == 0)
                        return;
                    keyCode = keyCode.charCodeAt(0);
                }

                let DOMKeyCode = convertQTKeyCode(keyCode);
                navigator.sendKeyEvent(eventType, DOMKeyCode.keyCode, DOMKeyCode.charCode, DOMKeyCode.modifier);
                return;
            }
            else if (eventType == 'keypress') {
                let key = arg1;
                if (typeof key == "number") {
                    let DOMKeyCode = convertQTKeyCode(key);
                    //navigator.sendKeyEvent("keydown", DOMKeyCode.keyCode, DOMKeyCode.charCode, 0);
                    navigator.sendKeyEvent("keypress", DOMKeyCode.keyCode, DOMKeyCode.charCode, 0);
                    //navigator.sendKeyEvent("keyup", DOMKeyCode.keyCode, DOMKeyCode.charCode, 0);
                }
                else if (key.length == 1) {
                    let charCode = key.charCodeAt(0);
                    let DOMKeyCode = convertQTKeyCode(charCode);
                    navigator.sendKeyEvent("keypress", DOMKeyCode.keyCode, charCode, 0);
                }
                else {
                    for(let i=0; i < key.length;i++) {
                        let charCode = key.charCodeAt(i);
                        let DOMKeyCode = convertQTKeyCode(charCode);
                        navigator.sendKeyEvent("keydown", DOMKeyCode.keyCode, DOMKeyCode.charCode, 0);
                        navigator.sendKeyEvent("keypress", DOMKeyCode.keyCode, charCode, 0);
                        navigator.sendKeyEvent("keyup", DOMKeyCode.keyCode, DOMKeyCode.charCode, 0);
                    }
                }
                return;
            }
            throw "Not implemented";
            // mouse events: mousedown, mouseup mousemove, doubleclick click
            // button: left, right, middle
        },

        event : {
            modifiers : {
                shift:  0x02000000,
                ctrl:   0x04000000,
                alt:    0x08000000,
                meta:   0x10000000,
                keypad: 0x20000000
            },
            key : phantomJSKeyCodeList.key // unicode values
        },

        get title() {
            throw "Not Implemented"
        },

        setContent: function(content, url) {
            throw "Not Implemented"
        },

        uploadFile: function(selector, filename) {
            throw "Not Implemented"
        },

        // ------------------------------- Screenshot and pdf export

        clipRect :null,
        paperSize : null,
        zoomFactor : null,

        render: function(filename) {
            throw "Not Implemented"
        },
        renderBase64: function(format) {
            throw "Not Implemented"
        },

        //--------------------------------------------------- window popup callback
        get onAlert() {
            throw "Not Implemented"
        },

        set onAlert(callback) {
            throw "Not Implemented"
        },

        get onCallback() {
            throw "Not Implemented"
        },

        set onCallback(callback) {
            throw "Not Implemented"
        },

        get onConfirm() {
            throw "Not Implemented"
        },

        set onConfirm(callback) {
            throw "Not Implemented"
        },

        get onConsoleMessage() {
            throw "Not Implemented"
        },

        set onConsoleMessage(callback) {
            throw "Not Implemented"
        },

        get onFilePicker() {
            throw "Not Implemented"
        },

        set onFilePicker(callback) {
            throw "Not Implemented"
        },

        get onPrompt() {
            throw "Not Implemented"
        },

        set onPrompt(callback) {
            throw "Not Implemented"
        },


        // ------------------------------ browsing callbacks

        // This callback is invoked after the web page is created but before a URL is loaded. The callback may be used to change global objects (document...)
        onInitialized: null,

        //This callback is invoked when the page finishes the loading. It may accept a single argument indicating the page's status: 'success' if no network errors occurred, otherwise 'fail'.
        onLoadFinished: null,

        //This callback is invoked when the page starts the loading. There is no argument passed to the callback.
        onLoadStarted: null,

        get onNavigationRequested() {
            throw "Not Implemented"
        },

        set onNavigationRequested(callback) {
            throw "Not Implemented"
        },

        // This callback is invoked when a new child window (but not deeper descendant windows) is created by the page, e.g. using window.open
        get onPageCreated() {
            throw "Not Implemented"
        },

        set onPageCreated(callback) {
            throw "Not Implemented"
        },

        onResourceRequested : null,

        onResourceReceived : null,

        //This callback is invoked when the URL changes, e.g. as it navigates away from the current URL.
        onUrlChanged : null,

        // -------------------------------- private methods to send some events
        closing:function (page) {
            throw "Not Implemented"
        },

        initialized: function() {
            throw "Not Implemented"
        },

        javaScriptAlertSent: function(message) {
            throw "Not Implemented"
        },

        javaScriptConsoleMessageSent: function(message) {
            throw "Not Implemented"
        },

        loadFinished: function(status) {
            throw "Not Implemented"
        },

        loadStarted: function() {
            throw "Not Implemented"
        },

        navigationRequested: function(url, navigationType, navigationLocked, isMainFrame) {
            throw "Not Implemented"
        },

        rawPageCreated: function(page) {
            throw "Not Implemented"
        },

        resourceReceived: function(request) {
            throw "Not Implemented"
        },

        resourceRequested: function(resource) {
            throw "Not Implemented"
        },

        urlChanged: function(url) {
            throw "Not Implemented"
        }
    };

    return webpage;
}
exports.create = create;

/*
function WebPage() {
    this.prototype = create();
}
*/