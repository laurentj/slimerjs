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

var EXPORTED_SYMBOLS = ["slimer", "phantom"];
Components.utils.import('resource://slimerjs/slConfiguration.jsm');
Components.utils.import("resource://gre/modules/Services.jsm");

var httpCookies = [];

function Slimer(version) {
    this._version = version;
}

Slimer.prototype = {

    // ------------------------  cookies

    /**
     * set a list of cookies
     * @param cookie[] val
     */
    set cookies (val) {
        httpCookies = val;
    },

    /**
     * retrieve the list of cookies
     * @return cookie[]
     */
    get cookies () {
        return httpCookies;
    },

    /**
     * if set to true, cookies will be send in requests
     */
    cookiesEnabled : true,

    /**
     * add a cookie in the cookie jar
     * @param cookie cookie
     */
    addCookie : function(cookie) {
        throw "Not Implemented";
    },

    /**
     * erase all cookies
     */
    clearCookies : function() {
        httpCookies = [];
    },

    /**
     * delete a cookie
     */
    deleteCookie : function(cookieName) {
        throw "Not Implemented";
    },

    /**
     * return the version of SlimerJS
     */
    get version() {
        return this._version;
    },

    /**
     * quit the application.
     *
     * The given exit code is not supported because there is no way
     * in Mozilla to return this code after the shutdown of the application.
     *
     * @param integer code the exit code for the shell console. 0 means ok (default value)
     * @phantomcompatibilityissue
     * @internal to resolve the issue, we should provide our own patched xulrunner
     */
    exit : function(code) {
        let c = code || 0;
        Services.startup.quit(Components.interfaces.nsIAppStartup.eForceQuit);
    },

    /**
     * the path where injected script could be find
     * @var string
     */
    libraryPath : '',

    /**
     * injects an external script into the SlimerJS sandbox runtime
     */
    injectJs : function (filename) {
        throw "Not Implemented";
    },

    /**
     * set the handler for errors
     */
    set onError (val) {
        throw "Not Implemented";
    },
    /**
     * get the handler for errors
     */
    get onError () {
        throw "Not Implemented";
    },

    __exposedProps__ : {
        cookies: 'rw',
        cookiesEnabled: 'rw',
        libraryPath : 'rw',
        version : 'r',
        addCookie : 'r',
        clearCookies : 'r',
        deleteCookie : 'r',
        exit : 'r',
        injectJs : 'r',
        onError : 'rw'
    }
}

var slimer = new Slimer(slConfiguration.version);
var phantom = new Slimer("1.7.0");

/**
 * cookie object for http requests
 */
function cookie(name, value, domain, path) {
    this.name = name;
    this.value = value;
    this.domain = domain || 'localhost';
    this.path = path || '/';

    this.httponly = true;

    this.secure =  false;
    this.expires = null;
}

