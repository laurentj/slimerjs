/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var EXPORTED_SYMBOLS = ["phantom"];
Components.utils.import('resource://slimerjs/slConfiguration.jsm');
Components.utils.import('resource://slimerjs/slUtils.jsm');
Components.utils.import('resource://slimerjs/slLauncher.jsm');
Components.utils.import("resource://gre/modules/Services.jsm");

var cookieManager = Components.classes["@mozilla.org/cookiemanager;1"]
                    .getService(Components.interfaces.nsICookieManager2);


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
     * set a list of cookies for any domain
     * @param cookie[] val
     */
    set cookies (val) {
        if (!Array.isArray(val))
            throw new Error("Invalid value");
        cookieManager.removeAll();
        let self = this;
        val.forEach(function (cookie) {
            self.addCookie(cookie);
        })
    },

    /**
     * retrieve the list of cookies
     * @return cookie[]
     */
    get cookies () {
        let cookiesList = []
        let cookiesEnum = cookieManager.enumerator;
        while(cookiesEnum.hasMoreElements()) {
            let cookie = cookiesEnum.getNext()
                                    .QueryInterface(Components.interfaces.nsICookie2);
            let c = new Cookie(cookie.name, cookie.value, cookie.host, cookie.path);
            c.httponly = cookie.isHttpOnly;
            c.secure =  cookie.isSecure;
            c.expires = cookie.expires;
            c.expiry = cookie.expiry;
            cookiesList.push(c);
        }
        return cookiesList;
    },

    /**
     * if set to true, cookies will be send in requests
     */
    get cookiesEnabled () {
        return (Services.prefs.getIntPref("network.cookie.cookieBehavior") != 2);
    },

    set cookiesEnabled(val) {
        Services.prefs.setIntPref("network.cookie.cookieBehavior", (val?0:2));
    },

    /**
     * add a cookie in the cookie jar
     * @param cookie cookie
     */
    addCookie : function(cookie) {
        let expires = 0;
        // in phantomJs, expiry and expires can be a string or a number
        if ("expiry" in cookie) {
            expires = cookie.expiry;
        }
        else if ("expires" in cookie) {
            expires = cookie.expires;
        }
        if (typeof(expires) == "string") {
            expires = Math.ceil(Date.parse(expires) / 1000);
        }
        else if (expires > 2983305600){ // if date > 2200, let's assume that this is in milliseconds
            expires = Math.ceil(expires / 1000);
        }

        let isSession = (expires <= 0);

        cookieManager.add(
            "domain" in cookie ? cookie.domain:'',
            "path" in cookie ? cookie.path:'/',
            "name" in cookie ? cookie.name:'',
            "value" in cookie ? cookie.value:'',
            "secure" in cookie ? cookie.secure:false,
            "httponly" in cookie ? cookie.httponly:true,
            isSession,
            expires
            );
    },

    /**
     * erase all cookies
     */
    clearCookies : function() {
        cookieManager.removeAll();
    },

    /**
     * delete all cookies that have the given name
     */
    deleteCookie : function(cookieName) {
        if (cookieName == '') {
            // matches phantomjs behavior
            cookieManager.removeAll();
            return
        }
        let cookiesEnum = cookieManager.enumerator;
        while(cookiesEnum.hasMoreElements()) {
            let cookie = cookiesEnum.getNext()
                                    .QueryInterface(Components.interfaces.nsICookie2);
            if (cookie.name == cookieName) {
                cookieManager.remove(cookie.host, cookie.name, cookie.path, false);
            }
        }
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
        injectJs : 'r',
        onError : 'rw',
        defaultErrorHandler : 'r',
        defaultPageSettings : 'r'
    }
}

/**
 * cookie object for http requests
 */
function Cookie(name, value, domain, path) {
    this.name = name;
    this.value = value;
    this.domain = domain || 'localhost';
    this.path = path || '/';

    this.httponly = true;

    this.secure =  false;
    this.expires = null;
}

