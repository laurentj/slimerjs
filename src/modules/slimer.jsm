/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var EXPORTED_SYMBOLS = ["slimer"];
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import('resource://slimerjs/slUtils.jsm');
Components.utils.import('resource://slimerjs/slConfiguration.jsm');

var xulAppInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                           .getService(Components.interfaces.nsIXULAppInfo);

var [major, minor, patch] = xulAppInfo.version.split('.');
var _version = { major: checkInt(major), minor: checkInt(minor), patch: checkInt(patch), __exposedProps__ : {major:'r', minor:'r', patch:'r'}};

function checkInt(val) {
    let v = parseInt(val)
    if (isNaN(v))
        return 0;
    return v;
}

var slimer =  {

    /**
     * return the version of SlimerJS
     */
    get version() {
        return _version;
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
     * clear all current FTP/HTTP authentication sessions
     */
    clearHttpAuth : function() {
        // clear all auth tokens
        let sdr = Components.classes["@mozilla.org/security/sdr;1"]
                             .getService(Components.interfaces.nsISecretDecoderRing);
        sdr.logoutAndTeardown();

        // clear FTP and plain HTTP auth sessions
        Services.obs.notifyObservers(null, "net:clear-active-logins", null);
    },

    /**
     * indicates if a feature is implemented and enabled
     * @var string featureName  supported names: 'coffeescript'
     * @return boolean true if the feature is supported AND enabled
     */
    hasFeature : function (featureName) {
        switch(featureName.toLowerCase()) {
            case 'coffeescript': return slConfiguration.enableCoffeeScript;
        }
        return false;
    },

    /**
     * the execution of the script is paused during the given amount of time
     * @param integer msTime  amount of time to wait, in milliseconds
     */
    wait : function(msTime) {
        slUtils.sleep(msTime);
    },

    __exposedProps__ : {
        version : 'r',
        exit : 'r',
        clearHttpAuth : 'r',
        hasFeature : 'r',
        wait: 'r'
    }
}
