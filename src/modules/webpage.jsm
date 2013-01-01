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
Components.utils.import('resource://slimerjs/slConfiguration.jsm');
Components.utils.import("resource://gre/modules/Services.jsm");


function create() {
    // private properties for the webpage object
    var navigator = null;

    var webpage = {
        clipRect :null,
        libraryPath : null,
        paperSize : null,
        settings : null,
        zoomFactor : null,
    
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
        
        open: function(url, callback) {
            slConfiguration.openBrowser(function(nav){
                navigator = nav;
                navigator.onpageloaded = function () {
                    navigator.onpageloaded = null;
                    if (callback)
                        callback();
                }
                navigator.browser.loadURI(url);
            });
        },
    
        close: function() {
            slConfiguration.closeBrowser(navigator);
            navigator=null;
        },
    
        get onClosing() {
            throw "Not Implemented"
        },
    
        set onClosing(callback) {
            throw "Not Implemented"
        },
    
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
            throw "Not Implemented"
        },
    
    
        get viewportSize() {
            throw "Not Implemented"
        },
    
        set viewportSize(val) {
            throw "Not Implemented"
        },
    
        // -------------------------------- Javascript evaluation
    
        evaluate: function(func, arg) {
            throw "Not Implemented"
        },
        evaluateAsync: function(func) {
            throw "Not Implemented"
        },
        includeJs: function(url, callback) {
            throw "Not Implemented"
        },
        injectJs: function(filename) {
            throw "Not Implemented"
        },
    
        get onError() {
            throw "Not Implemented"
        },
    
        set onError(callback) {
            throw "Not Implemented"
        },
    
        // --------------------------------- content manipulation
    
        get content () {
            throw "Not Implemented"
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
            throw "Not Implemented"
        },
    
        sendEvent: function(eventType, keyOrMouseX, mouseY, button) {
            throw "Not Implemented"
        },
        setContent: function(content, url) {
            throw "Not Implemented"
        },
        uploadFile: function(selector, filename) {
            throw "Not Implemented"
        },
    
        // ------------------------------- Screenshot and pdf export
    
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
    
        get onInitialized() {
            throw "Not Implemented"
        },
    
        set onInitialized(callback) {
            throw "Not Implemented"
        },
    
        get onLoadFinished() {
            throw "Not Implemented"
        },
    
        set onLoadFinished(callback) {
            throw "Not Implemented"
        },
    
        get onLoadStarted() {
            throw "Not Implemented"
        },
    
        set onLoadStarted(callback) {
            throw "Not Implemented"
        },
    
        get onNavigationRequested() {
            throw "Not Implemented"
        },
    
        set onNavigationRequested(callback) {
            throw "Not Implemented"
        },
    
        get onPageCreated() {
            throw "Not Implemented"
        },
    
        set onPageCreated(callback) {
            throw "Not Implemented"
        },
    
        get onResourceRequested() {
            throw "Not Implemented"
        },
    
        set onResourceRequested(callback) {
            throw "Not Implemented"
        },
    
        get onResourceReceived() {
            throw "Not Implemented"
        },
    
        set onResourceReceived(callback) {
            throw "Not Implemented"
        },
    
        get onUrlChanged() {
            throw "Not Implemented"
        },
    
        set onUrlChanged(callback) {
            throw "Not Implemented"
        }
    }

    return webpage;
}

/*
function WebPage() {
    this.prototype = create();
}
*/