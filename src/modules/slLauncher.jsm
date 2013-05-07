/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";
var EXPORTED_SYMBOLS = ["slLauncher"];

const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import('resource://slimerjs/addon-sdk/toolkit/loader.js'); //Sandbox, Require, main, Module, Loader
Cu.import('resource://slimerjs/slConsole.jsm');

var windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
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
        contentWindow.global = contentWindow;
        // import the slimer/phantom API into the sandbox
        Cu.import('resource://slimerjs/slimer.jsm', sandbox);
        Cu.import('resource://slimerjs/phantom.jsm', sandbox);

        sandbox.console = new slConsole();

        // load and execute the provided script
        let fileURI = Services.io.newFileURI(scriptFile).spec;
        let dirURI =  Services.io.newFileURI(scriptFile.parent).spec;
        mainLoader = prepareLoader(fileURI, dirURI);

        try {
            Loader.main(mainLoader, 'main', sandbox);
        }
        catch(e) {
            if (sandbox.phantom.onError) {
                let [msg, stackRes] = getTraceException(e, fileURI);
                sandbox.phantom.onError(msg, stackRes);
            }
            else
                throw e;
        }
    },

    injectJs : function (source, uri) {
        let sandbox = mainLoader.sandboxes[mainLoader.main.uri];

        let evalOptions =  {
          version : mainLoader.javascriptVersion,
          source: source
        }
        Loader.evaluate(sandbox, uri, evalOptions);
    },

    /**
     * create a new browser element. call the given callback when it is ready,
     * with the browser element as parameter.
     */
    openBrowser : function(callback, parentWindow) {
        if (!parentWindow)
            parentWindow = windowMediator.getMostRecentWindow("slimerjs");
        return parentWindow.openDialog("chrome://slimerjs/content/webpage.xul", "_blank", "chrome,all,dialog=no", { callback:callback});
    },

    closeBrowser: function (browser) {
        let win = browser.ownerDocument.defaultView.top;
        win.close();
    }
}


function prepareLoader(fileURI, dirURI) {
    var metadata ={
            permissions : {}
    };

    return Loader.Loader({
        javascriptVersion : 'ECMAv5',
        id:'slimerjs@innophi.com',
        name: 'SlimerJs',
        rootURI: dirURI,
        metadata: Object.freeze(metadata),
        paths: {
          'main': fileURI,
          '': dirURI,
          'sdk/': 'resource://slimerjs/addon-sdk/sdk/',
          'slimer-sdk/': 'resource://slimerjs/slimer-sdk/',
        },
        globals: {
            console: new slConsole()
        },
        modules: {
          "webserver": Cu.import("resource://slimerjs/webserver.jsm", {}),
          "system": Cu.import("resource://slimerjs/system.jsm", {}),
        },
        resolve: function(id, requirer) {

            if (id == 'fs') {
                return 'sdk/io/file';
            }
            if (id == 'chrome' || id.indexOf('@loader/') === 0) {
                if (requirer.indexOf('sdk/') === 0
                    || requirer.indexOf('slimer-sdk/') === 0) {
                    return id;
                }
                // the chrome module is only allowed in embedded modules
                if (id == 'chrome') {
                    throw Error("Module "+ requirer+ " is not allowed to require the chrome module");
                }
                else if (id.indexOf('@loader/') === 0)
                    throw Error("Unknown "+ id +" module");
            }

            if (id == 'webpage') {
                return 'slimer-sdk/webpage';
            }

            if (id == 'net-log') {
                return 'slimer-sdk/net-log';
            }

            if (id.indexOf('sdk/') === 0
                && requirer.indexOf('slimer-sdk/') === 0) {
                return id;
            }

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
            var finalpath = result.join('/');
            return finalpath;
        }
    });
}
