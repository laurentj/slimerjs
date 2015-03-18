/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var EXPORTED_SYMBOLS = ["phantom"];
Components.utils.import('resource://slimerjs/slConfiguration.jsm');
Components.utils.import('resource://slimerjs/slUtils.jsm');
Components.utils.import('resource://slimerjs/slLauncher.jsm');
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import('resource://slimerjs/slCookiesManager.jsm');



var libPath = (slConfiguration.scriptFile ? slConfiguration.scriptFile.parent.clone(): null);

var errorHandler;

var defaultSettings = null;

var phantom = {

    get args (){
        return slConfiguration.args.slice(1);
    },

    get scriptName (){
        return slConfiguration.args[0];
    },

    get page () {
        throw new Error("phantom.page not implemented. Irrelevant for Slimerjs");
    },

    // ------------------------  cookies

    /**
     * set a list of cookies for any domain
     * @param cookie[] val
     */
    set cookies (val) {
        slCookiesManager.setCookies(val);
    },

    /**
     * retrieve the list of cookies
     * @return cookie[]
     */
    get cookies () {
        return slCookiesManager.getCookies();
    },

    /**
     * if set to true, cookies will be send in requests
     */
    get cookiesEnabled () {
        return slCookiesManager.isCookiesEnabled();
    },

    set cookiesEnabled(val) {
        slCookiesManager.enableCookies(val);
    },

    /**
     * add a cookie in the cookie jar
     * @param cookie cookie
     * @return boolean true if the cookie has been set
     */
    addCookie : function(cookie) {
        return slCookiesManager.addCookie(cookie);
    },

    /**
     * erase all cookies
     */
    clearCookies : function() {
        slCookiesManager.clearCookies();
    },

    /**
     * delete all cookies that have the given name
     * @param string cookieName  the cookie name
     * @return boolean true if deletion is ok
     */
    deleteCookie : function(cookieName) {
        return slCookiesManager.deleteCookie(cookieName);
    },

    /**
     * return the version of PhantomJS on which this implementation is compatible
     */
    get version() {
        return { major: 1, minor: 9, patch: 2, __exposedProps__ : {major:'r', minor:'r', patch:'r'}};
    },

    get defaultPageSettings () {
        return slConfiguration.getDefaultWebpageConfig();
    },

    /**
     * quit the application.
     *
     * @param integer code the exit code for the shell console. 0 means ok (default value)
     * @phantomcompatibilityissue
     * @internal to resolve the issue, we should provide our own patched xulrunner
     */
    exit : function(code) {
        let c = +code || 0;
        if (slLauncher.slimerExiting) {
            return
        }
        slUtils.writeExitStatus(c);
        slLauncher.slimerExiting = true;
        Services.startup.quit(Components.interfaces.nsIAppStartup.eForceQuit);
    },

    /**
     * the path where injected script could be find
     * @var string
     */
    get libraryPath () {
        if (!libPath) {
            return "";
        }
        return libPath.path;
    },
    set libraryPath (path) {
        libPath = slUtils.getMozFile(path);
    },

    /**
     * injects an external script into the SlimerJS sandbox runtime
     */
    injectJs: function(filename) {
        if (slConfiguration.mainScriptURI.scheme != 'file') {
            let uri = slConfiguration.mainScriptURI;
            let fileUrl = uri.scheme+'://'+uri.host+'/'+slConfiguration.scriptModulePath+filename;
            let source = slUtils.readChromeFile(fileUrl);
            return slLauncher.injectJs(source, fileUrl);
        }

        // resolve the filename against the current working directory
        let f = slUtils.getAbsMozFile(filename, Services.dirsvc.get("CurWorkD", Components.interfaces.nsIFile));
        if (!f.exists()) {
            // filename resolved against the libraryPath property
            f = slUtils.getAbsMozFile(filename, libPath);
            if (!f.exists()) {
                dump("Error phantom.injectJs: Can't open '"+filename+"'\n");
                return false;
            }
        }
        let source = slUtils.readSyncStringFromFile(f);
        return slLauncher.injectJs(source, Services.io.newFileURI(f).spec);
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
        page : 'r',
        injectJs : 'r',
        onError : 'rw',
        defaultErrorHandler : 'r',
        defaultPageSettings : 'r'
    }
}

