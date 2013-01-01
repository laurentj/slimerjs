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

Components.utils.import("resource://gre/modules/Services.jsm");

// we need to output to the shell console
Services.prefs.setBoolPref('browser.dom.window.dump.enabled', true);

Components.utils.import('resource://slimerjs/slLauncher.jsm');
Components.utils.import('resource://slimerjs/slConfiguration.jsm');
Components.utils.import('resource://slimerjs/slUtils.jsm');

/**
 * reference the iframe where scripts are executed
 */
var runtimeIframe = null;

function startup() {

    var runtimeIframe = document.getElementById('runtime');
    slLauncher.browserElements = document.getElementById('browsers');

    try {
        slLauncher.launchMainScript(runtimeIframe.contentWindow, slConfiguration.scriptFile);
    }
    catch(e) {
        dumpex(e, 'Error during the script execution\n');
        dumpStack(e.stack);
        Services.startup.quit(Components.interfaces.nsIAppStartup.eForceQuit);
    }
}
