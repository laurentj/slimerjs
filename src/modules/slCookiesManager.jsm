/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var EXPORTED_SYMBOLS = ["slCookiesManager"];

const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;

Cu.import("resource://gre/modules/Services.jsm");

var nsCookieManager = Cc["@mozilla.org/cookiemanager;1"]
                    .getService(Ci.nsICookieManager2);


/**
 * cookie object for http requests
 */
function Cookie(name, value, domain, path) {
    this.name = name;
    this.value = value;
    this.domain = domain || 'localhost';
    this.path = path || '/';

    this.httponly = false;

    this.secure =  false;
    this.expires = null;
    this.expiry = null;
}

function initCookieFromnsICookie(nsCookie) {
    let c = new Cookie(nsCookie.name, nsCookie.value, nsCookie.host, nsCookie.path);
    c.httponly = nsCookie.isHttpOnly;
    c.secure =  nsCookie.isSecure;
    if (nsCookie.isSession) {
        c.expires = null;
        c.expiry = null;
    }
    else {
        c.expires = (new Date(nsCookie.expires)).toString();
        c.expiry = nsCookie.expiry;
    }
    return c;
}


var slCookiesManager = {

    /**
     * indicate if cookies will be sent to next requests
     * @return boolean
     */
    isCookiesEnabled : function() {
        return (Services.prefs.getIntPref("network.cookie.cookieBehavior") != 2);
    },

    /**
     * enable or disable cookies
     */
    enableCookies : function (enable) {
        Services.prefs.setIntPref("network.cookie.cookieBehavior", (enable?0:2));
    },

    /**
     * retrieve the list of all cookies.
     * @return Array list of Cookie objects.
     */
    getCookies: function () {
        let cookiesList = []
        let cookiesEnum = nsCookieManager.enumerator;
        while(cookiesEnum.hasMoreElements()) {
            let cookie = cookiesEnum.getNext()
                                    .QueryInterface(Ci.nsICookie2);
            let c = initCookieFromnsICookie(cookie);
            cookiesList.push(c);
        }

        return cookiesList;
    },

    /**
     * retrieve the list of cookies corresponding to the given url
     * @param nsIURI uri
     * @return Array list of Cookie objects.
     */
    getCookiesForUri: function (uri) {
        let cookiesList = [];
        if (uri.scheme != 'http' && uri.scheme != 'https')
            return cookiesList;
        let cookiesEnum = nsCookieManager.getCookiesFromHost(uri.host);
        while (cookiesEnum.hasMoreElements()) {
            let cookie = cookiesEnum.getNext()
                                    .QueryInterface(Ci.nsICookie2);
            if (uri.path.indexOf(cookie.path) !== 0)
                continue;
            if (cookie.isSecure && uri.scheme !== 'https' )
                continue;
            let c = initCookieFromnsICookie(cookie);
            cookiesList.push(c);
        }
        return cookiesList;
    },

    /**
     * set a new list of cookies.
     * Cookies already set are deleted.
     * If an url is given, cookies will be assigned to the given domain
     * @param array cookies list of Cookie objects
     * @param nsIURI uri (optional)
     * @return boolean true if cookies have been set
     */
    setCookies: function (cookies, uri) {
        if (!Array.isArray(cookies))
            throw new Error("Invalid value");
        if (!this.isCookiesEnabled())
            return false;

        if (uri) {
            this.clearCookies(uri);
        }
        else
            nsCookieManager.removeAll();
        let cookieAdded = false;
        cookies.forEach(function (cookie) {
            if (slCookiesManager._addCookie(cookie, uri))
                cookieAdded = true;
        })
        return cookieAdded;
    },

    /**
     * add a cookie in the cookie jar
     * If an url is given, the cookie will be assigned to the given domain
     * @param cookie cookie
     * @param nsIURI url (optional)
     * @return boolean true if the cookie has been set
     */
    addCookie: function (cookie, url) {
        if (!this.isCookiesEnabled())
            return false;
        return this._addCookie(cookie, url);
    },

    /**
     * @private
     */
    _addCookie: function (cookie, uri) {
        let expires = 0;
        // in phantomJs, expiry and expires can be a string or a number
        // PhantomJS gives priority to "expires" over "expiry"
         if ("expires" in cookie && cookie.expires !== null) {
            expires = cookie.expires;
        }
        else if ("expiry" in cookie && cookie.expiry !== null) {
            expires = cookie.expiry;
        }
        if (typeof(expires) == "string") {
            expires = Math.ceil(Date.parse(expires) / 1000);
        }
        else if (expires > 2983305600){ // if date > 2200, let's assume that this is in milliseconds
            expires = Math.ceil(expires / 1000);
        }

        let isSession = false;
        if (expires <= 0) {
            // if 0, the gecko cookies manager will ignore the cookie...
            expires = Math.ceil(Date.now()/1000) + (24 * 60 * 60);
            isSession = true;
        }
        let domain = '';
        let path = '/';
        if (uri) {
            domain = uri.host;
            path = uri.path;
        }
        else {
            domain = "domain" in cookie ? cookie.domain:'';
            if (domain == '')
                return false;
            path = "path" in cookie ? cookie.path:'/';
        }

        try {
            nsCookieManager.add(
                domain,
                path,
                "name" in cookie ? cookie.name:'',
                "value" in cookie ? cookie.value:'',
                "secure" in cookie ? cookie.secure:false,
                "httponly" in cookie ? cookie.httponly:false,
                isSession,
                expires
                );
        }
        catch(e) {
            return false;
        }
        return true;
    },

    /**
     * delete all cookies if cookies are enabled.
     * If an url is given, only delete cookies attached to
     * @param nsIURI url (optional)
     * @return boolean true if deletion is ok
     */
    clearCookies: function (uri) {
        if (!this.isCookiesEnabled())
            return false;
        if (!uri) {
            nsCookieManager.removeAll();
            return true;
        }
        let cookies = this.getCookiesForUri(uri);
        if (!cookies.length)
            return false;
        cookies.forEach(function(cookie) {
            nsCookieManager.remove(cookie.domain, cookie.name, cookie.path, false);
        });
        return true;
    },

    /**
     * delete all cookies that have the given name
     * If an url is given, only delete cookies attached to
     * @param string cookieName  the cookie name
     * @param nsIURI uri (optional)
     * @return boolean true if deletion is ok
     */
    deleteCookie: function (cookieName, uri) {
        if (!this.isCookiesEnabled())
            return false;

        if (cookieName == '') {
            // matches phantomjs behavior
            nsCookieManager.removeAll();
            return true;
        }
        let cookiesEnum;
        if (uri)
            cookiesEnum = nsCookieManager.getCookiesFromHost(uri.host);
        else
            cookiesEnum = nsCookieManager.enumerator;
        let hasBeenDeleted = false;
        while(cookiesEnum.hasMoreElements()) {
            let cookie = cookiesEnum.getNext()
                                    .QueryInterface(Ci.nsICookie2);
            if (uri) {
                if (uri.path.indexOf(cookie.path) !== 0)
                    continue;
                if (cookie.isSecure && uri.scheme !== 'https' )
                    continue;
            }

            if (cookie.name == cookieName) {
                nsCookieManager.remove(cookie.host, cookie.name, cookie.path, false);
                hasBeenDeleted = true;
            }
        }
        return hasBeenDeleted;
    }
}


