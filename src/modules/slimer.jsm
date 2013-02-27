/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var EXPORTED_SYMBOLS = ["slimer"];
Components.utils.import("resource://gre/modules/Services.jsm");

var xulAppInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                           .getService(Components.interfaces.nsIXULAppInfo);

var [major, minor, patch] = xulAppInfo.version.split('.');
var _version = { major: parseInt(major), minor: parseInt(minor), patch: parseInt(patch), __exposedProps__ : {major:'r', minor:'r', patch:'r'}};

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

    __exposedProps__ : {
        version : 'r',
        exit : 'r'
    }
}
