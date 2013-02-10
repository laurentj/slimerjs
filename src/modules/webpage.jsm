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

var EXPORTED_SYMBOLS = ["create"];
Components.utils.import('resource://slimerjs/slLauncher.jsm');
Components.utils.import('resource://slimerjs/slUtils.jsm');
Components.utils.import('resource://slimerjs/slConfiguration.jsm');
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import('resource://slimerjs/slPhantomJSKeyCode.jsm');
Components.utils.import('resource://slimerjs/slQTKeyCodeToDOMCode.jsm');


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
    
        // -------------------------------- Window manipulation
        /**
         * Open a web page in a browser
         * @param string url    the url of the page to open
         * @param function callback  a function called when the page is loaded. it
         *                           receives "success" or "fail" as parameter.
         */
        open: function(url, callback) {
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

        get frameUrl() {
            throw "Not Implemented"
        },
    
    
        get navigationLocked() {
            throw "Not Implemented"
        },
    
        set navigationLocked(val) {
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
    
        // -------------------------------- Javascript evaluation
    
        evaluate: function(func, arg) {
            if (navigator)
                return navigator.evaluate(func, arg);
            throw "WebPage not opened";
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
            libPath = Components.classes['@mozilla.org/file/local;1']
                            .createInstance(Components.interfaces.nsILocalFile);
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

            const de = Components.interfaces.nsIDocumentEncoder
            let encoder = Components.classes["@mozilla.org/layout/documentEncoder;1?type=text/html"]
                            .createInstance(Components.interfaces.nsIDocumentEncoder);
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
    
        get plainText() {
            if (!navigator)
                throw "WebPage not opened";

            const de = Components.interfaces.nsIDocumentEncoder
            let encoder = Components.classes["@mozilla.org/layout/documentEncoder;1?type=text/plain"]
                            .createInstance(Components.interfaces.nsIDocumentEncoder);
            let doc = navigator.browser.contentDocument;
            encoder.init(doc, "text/plain", de.OutputLFLineBreak | de.OutputBodyOnly);
            encoder.setNode(doc);
            return encoder.encodeToString();
        },
    
        sendEvent: function(eventType, variant1, variant2, button, modifier) {
            if (!navigator)
                throw "WebPage not opened";

            if (eventType == 'keydown' || eventType == 'keyup') {
                var key = variant1;
                if (typeof key != "number") {
                    if (key.length == 0)
                        return;
                    key = key.charCodeAt(0);
                }
                let DOMKeyCode = convertQTKeyCode(key);
                navigator.sendKeyEvent(eventType, DOMKeyCode.keyCode, DOMKeyCode.charCode, DOMKeyCode.modifier);
                return;
            }
            else if (eventType == 'keypress') {
                let key = variant1;
                if (typeof key == "number") {
                    let DOMKeyCode = convertQTKeyCode(key);
                    navigator.sendKeyEvent("keydown", DOMKeyCode.keyCode, DOMKeyCode.charCode, 0);
                    navigator.sendKeyEvent("keypress", DOMKeyCode.keyCode, DOMKeyCode.charCode, 0);
                    navigator.sendKeyEvent("keyup", DOMKeyCode.keyCode, DOMKeyCode.charCode, 0);
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

        event : {
            modifiers : {
                shift:  0x02000000,
                ctrl:   0x04000000,
                alt:    0x08000000,
                meta:   0x10000000,
                keypad: 0x20000000
            },
            key : phantomJSKeyCodeList.key // unicode values
        }
    };

    return webpage;
}

/*
function WebPage() {
    this.prototype = create();
}
*/