/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var EXPORTED_SYMBOLS = ["phantom"];
Components.utils.import('resource://slimerjs/slConfiguration.jsm');
Components.utils.import('resource://slimerjs/slUtils.jsm');
Components.utils.import('resource://slimerjs/slLauncher.jsm');
Components.utils.import("resource://gre/modules/Services.jsm");

var httpCookies = [];

var libPath = slConfiguration.scriptFile.parent.clone();

var errorHandler;

var defaultSettings = null;

var phantom = {

    get args (){
        return slConfiguration.args.slice(1);
    },

    get scriptName (){
        return slConfiguration.args[0];
    },

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
        throw new Error("phantom.addCookie not implemented");
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
        throw new Error("phantom.deleteCookie not implemented");
    },

    /**
     * return the version of PhantomJS on which this implementation is compatible
     */
    get version() {
        return { major: 1, minor: 9, patch: 0, __exposedProps__ : {major:'r', minor:'r', patch:'r'}};
    },

    get defaultPageSettings () {
        return slConfiguration.getDefaultWebpageConfig();
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
    get libraryPath () {
        return libPath.path;
    },
    set libraryPath (path) {
        libPath = Components.classes['@mozilla.org/file/local;1']
                        .createInstance(Components.interfaces.nsILocalFile);
        libPath.initWithPath(path);
    },

    /**
     * injects an external script into the SlimerJS sandbox runtime
     */
    injectJs: function(filename) {
        // resolve the filename against the current working directory
        let f = getMozFile(filename, Services.dirsvc.get("CurWorkD", Components.interfaces.nsIFile));
        if (!f.exists()) {
            // filename resolved against the libraryPath property
            f = getMozFile(filename, libPath);
            if (!f.exists()) {
                dump("Can't open '"+filename+"'\n");
                return false;
            }
        }

        let source = readSyncStringFromFile(f);
        slLauncher.injectJs(source, Services.io.newFileURI(f).spec);
        return true;
    },

    /**
     * set the handler for errors
     */
    set onError (val) {
        slLauncher.errorHandler = val;
    },
    /**
     * get the handler for errors
     */
    get onError () {
        return slLauncher.errorHandler;
    },

    get defaultErrorHandler () {
        return slLauncher.defaultErrorHandler;
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
        onError : 'rw',
        defaultErrorHandler : 'r',
        defaultPageSettings : 'r'
    }
}

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

