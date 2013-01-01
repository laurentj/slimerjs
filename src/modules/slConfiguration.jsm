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

var EXPORTED_SYMBOLS = ["slConfiguration"];
Components.utils.import("resource://gre/modules/AddonManager.jsm");

var slConfiguration = {

    args : [],

    /**
     * @var nsIFile
     */
    scriptFile: null,

    /**
     * the version of SlimerJS. Field during startup
     * @see commandline.js
     */
    version : '0.0.3',

    setEnvNames : function(envvars) {
        this.envs = envvars.filter(function(element, index, array) {
            return /^[a-z0-9_]+$/i.test(element);
        });
    },

    envs : [],

    /**
     * the XUL elements containing all opened browsers
     * @var DOMElement
     */
    browserElements : null,

    /**
     * create a new browser element. call the given callback when it is ready,
     * with the browser element as parameter.
     */
    openBrowser : function(callback) {
        let browser = this.browserElements.ownerDocument.createElement("webpage");
        function onReady(event) {
            browser.removeEventListener("BrowserReady", onReady, false);
            callback(browser);
        }
        browser.addEventListener("BrowserReady", onReady, false);
        this.browserElements.appendChild(browser);
        this.browserElements.selectedPanel = browser;
    },

    closeBrowser: function (navigator) {
        //navigator.resetBrowser();
        navigator.parentNode.removeChild(navigator);
        this.browserElements.selectedPanel = this.browserElements.lastChild;
    }
}

/*
AddonManager.getAddonByID("slimerjs@innophi", function(addon) {
    slConfiguration.version = addon.version;
});*/