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

    this.httponly = true;

    this.secure =  false;
    this.expires = null;
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
     * retrieve the list of cookies.
     * If url is given, it returns only cookies available for this url
     * @param string url (optional)
     * @return Array list of Cookie objects.
     */
    getCookies: function (url) {
        let cookiesList = []
        let cookiesEnum = nsCookieManager.enumerator;
        while(cookiesEnum.hasMoreElements()) {
            let cookie = cookiesEnum.getNext()
                                    .QueryInterface(Ci.nsICookie2);
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
     * set a new list of cookies.
     * Cookies already set are deleted.
     * If an url is given, cookies will be assigned to the given domain
     * @param array cookies list of Cookie objects
     * @param string url (optional)
     * @return boolean true if cookies have been set
     */
    setCookies: function (cookies, url) {
        if (!Array.isArray(cookies))
            throw new Error("Invalid value");
        if (!this.isCookiesEnabled())
            return false;

        nsCookieManager.removeAll();
        let cookieAdded = false;
        cookies.forEach(function (cookie) {
            if (slCookiesManager._addCookie(cookie))
                cookieAdded = true;
        })
        return cookieAdded;
    },

    /**
     * add a cookie in the cookie jar
     * If an url is given, the cookie will be assigned to the given domain
     * @param cookie cookie
     * @param string url (optional)
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
    _addCookie: function (cookie, url) {
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

        try {
            nsCookieManager.add(
                "domain" in cookie ? cookie.domain:'',
                "path" in cookie ? cookie.path:'/',
                "name" in cookie ? cookie.name:'',
                "value" in cookie ? cookie.value:'',
                "secure" in cookie ? cookie.secure:false,
                "httponly" in cookie ? cookie.httponly:true,
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
     * @param string url (optional)
     * @return boolean true if deletion is ok
     */
    clearCookies: function (url) {
        if (!this.isCookiesEnabled())
            return false;

        nsCookieManager.removeAll();
        return true;
    },

    /**
     * delete all cookies that have the given name
     * If an url is given, only delete cookies attached to
     * @param string cookieName  the cookie name
     * @param string url (optional)
     * @return boolean true if deletion is ok
     */
    deleteCookie: function (cookieName, url) {
        if (!this.isCookiesEnabled())
            return false;

        if (cookieName == '') {
            // matches phantomjs behavior
            nsCookieManager.removeAll();
            return true;
        }
        let cookiesEnum = nsCookieManager.enumerator;
        let hasBeenDeleted = false;
        while(cookiesEnum.hasMoreElements()) {
            let cookie = cookiesEnum.getNext()
                                    .QueryInterface(Ci.nsICookie2);
            if (cookie.name == cookieName) {
                nsCookieManager.remove(cookie.host, cookie.name, cookie.path, false);
                hasBeenDeleted = true;
            }
        }
        return hasBeenDeleted;
    }
}


