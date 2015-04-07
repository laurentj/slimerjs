/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

Components.utils.import("resource://gre/modules/Services.jsm");

// we need to output to the shell console
Services.prefs.setBoolPref('browser.dom.window.dump.enabled', true);

Components.utils.import('resource://slimerjs/slLauncher.jsm');
Components.utils.import('resource://slimerjs/slConfiguration.jsm');
Components.utils.import('resource://slimerjs/slUtils.jsm');
Components.utils.import('resource://slimerjs/slimer.jsm');

function startup() {
   document.getElementById("versionnumber").textContent =  Services.appinfo.version
    var runtimeIframe = document.getElementById('runtime');
    try {
        slimer.mainWindow = this;
        slLauncher.launchMainScript(runtimeIframe.contentWindow);
    }
    catch(e) {
        dumpex(e, 'Error during the script execution\n');
        dumpStack(e.stack);
        Services.startup.quit(Components.interfaces.nsIAppStartup.eForceQuit);
    }
}

function quit() {
    Services.startup.quit(Components.interfaces.nsIAppStartup.eForceQuit);
}
