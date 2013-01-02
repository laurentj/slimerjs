/*!
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
"use strict";
var EXPORTED_SYMBOLS = ["slLauncher"];

const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import('resource://slimerjs/addon-sdk/loader.jsm'); //Sandbox, Require, main, Module, Loader

var sandbox = null;
var mainLoader = null;


var slLauncher = {
    launchMainScript: function (contentWindow, scriptFile) {

        sandbox = Cu.Sandbox(contentWindow,
                            {
                                'sandboxName': 'slimerjs',
                                'sandboxPrototype': contentWindow,
                                'wantXrays': true
                            });

        // expose a console object that dump output into the shell console
        var c = {}
        Cu.import("resource://gre/modules/devtools/Console.jsm", c);
        // we need to indicate which properties the script can access on the console
        c.console.__exposedProps__ = {
            debug:'r', log:'r', info:'r', warn:'r',
            error:'r', trace:'r', clear:'r',
            dir:'r', dirxml:'r', group:'r', groupEnd:'r'
        }
        sandbox.console = c.console;

        // import the slimer/phantom API into the sandbox
        Cu.import('resource://slimerjs/slimer.jsm', sandbox);

        // load and execute the provided script
        let fileURI = Services.io.newFileURI(scriptFile).spec;
        let dirURI =  Services.io.newFileURI(scriptFile.parent).spec;
        mainLoader = prepareLoader(fileURI, dirURI);
        Loader.main(mainLoader, 'main', sandbox);
    },

    /**
     * the XUL elements containing all opened browsers
     * @var DOMElement
     */
    browserElements : null,

    /**
     * create a new browser element. call the given callback when it is ready,
     * with the browser element as parameter.
     */
    openBrowser : function(callback, currentNavigator) {
        let browser = currentNavigator;
        if (!currentNavigator) {
            browser = this.browserElements.ownerDocument.createElement("webpage");
        }
        function onReady(event) {
            browser.removeEventListener("BrowserReady", onReady, false);
            callback(browser);
        }
        browser.addEventListener("BrowserReady", onReady, false);
        if (!currentNavigator)
            this.browserElements.appendChild(browser);
        this.browserElements.selectedPanel = browser;
    },

    closeBrowser: function (navigator) {
        //navigator.resetBrowser();
        navigator.parentNode.removeChild(navigator);
        this.browserElements.selectedPanel = this.browserElements.lastChild;
    }
}


function prepareLoader(fileURI, dirURI) {

    return Loader.Loader({
        javascriptVersion : 'ECMAv5',

        paths: {
          'main': fileURI,
          '': dirURI,
          'sdk/': 'resource://slimerjs/addon-sdk/'
        },
        globals: {
        },
        modules: {
          //"webserver": Cu.import("resource://slimerjs/webserver.jsm", {}),
          "system": Cu.import("resource://slimerjs/system.jsm", {}),
          "webpage": Cu.import("resource://slimerjs/webpage.jsm", {}),
        },
        resolve: function(id, requirer) {
            // we have some aliases, let's resolve them
            if (id == 'fs') {
                return 'sdk/io/file';
            }

            // the chrome module is only allowed in emmbedded modules
            if (id == 'chrome') {
                if (requirer.indexOf('sdk/') === 0) {
                    return 'chrome';
                }
                throw Error("Module "+ requirer+ " is not allowed to require the chrome module");
            }

            if (id.indexOf('@loader/') === 0)
                throw Error("Unknown "+ id +"module");

            // let's resolve other id module as usual
            let paths = id.split('/');
            let result = requirer.split('/');
            result.pop();
            while (paths.length) {
              let path = paths.shift();
              if (path === '..')
                result.pop();
              else if (path !== '.')
                result.push(path);
            }
            return result.join('/');
        }
    });
}
