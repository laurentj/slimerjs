/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";
var EXPORTED_SYMBOLS = ["slLauncher"];

const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import('resource://slimerjs/addon-sdk/toolkit/loader.js'); //Sandbox, Require, main, Module, Loader
Cu.import('resource://slimerjs/slConsole.jsm');
Cu.import('resource://slimerjs/slUtils.jsm');

const windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Ci.nsIWindowMediator);

const fileHandler = Cc["@mozilla.org/network/protocol;1?name=file"]
                     .getService(Ci.nsIFileProtocolHandler)
const systemPrincipal = Cc['@mozilla.org/systemprincipal;1']
                        .createInstance(Ci.nsIPrincipal)

var mainLoader = null;
var mainWindow = null;

var coffeeScriptSandbox = null;

var slLauncher = {
    launchMainScript: function (contentWindow, scriptFile) {
        mainWindow = contentWindow;

        // prepare the sandbox to execute coffee script injected with injectJs
        coffeeScriptSandbox = Cu.Sandbox(contentWindow,
                            {
                                'sandboxName': 'coffeescript',
                                'sandboxPrototype': {},
                                'wantXrays': true
                            });
        let src = slUtils.readChromeFile("resource://slimerjs/coffee-script/extras/coffee-script.js");
        Cu.evalInSandbox(src, coffeeScriptSandbox, 'ECMAv5', 'coffee-scripts.js', 1);

        // load and execute the provided script
        let fileURI = Services.io.newFileURI(scriptFile).spec;
        mainLoader = prepareLoader(fileURI, scriptFile.parent);

        try {
            // first load the bootstrap module
            let bsModule = Loader.Module('slimer-sdk/bootstrap', 'resource://slimerjs/slimer-sdk/bootstrap.js');
            mainLoader.load(mainLoader, bsModule);

            // load the main module
            let uri =resolveMainURI(mainLoader.mapping);
            let module = mainLoader.main = mainLoader.modules[uri] = Loader.Module('main', uri);
            mainLoader.load(mainLoader, module);
        }
        catch(e) {
            this.showError(e, fileURI);
        }
    },

    injectJs : function (source, uri) {
        let isCoffeeScript = uri.endsWith(".coffee");

        if (source.startsWith("#!") && !isCoffeeScript) {
            source = "//" + source;
        }

        if (isCoffeeScript) {
            coffeeScriptSandbox.source = source
            let src = "this.CoffeeScript.compile(this.source);";
            source = Cu.evalInSandbox(src, coffeeScriptSandbox, 'ECMAv5', 'slLauncher::injectJs', 1);
        }

        let sandbox = mainLoader.sandboxes[mainLoader.main.uri];

        let evalOptions =  {
          version : mainLoader.javascriptVersion,
          source: source
        }
        Loader.evaluate(sandbox, uri, evalOptions);
        return true;
    },

    showError : function(e, fileURI) {
        if (('name' in e && e.name == 'FatalError') || !this.errorHandler)
            throw e;
        let [msg, stackRes] = getTraceException(e, fileURI);
        this.errorHandler(msg, stackRes);
    },

    // can be changed by the phantom module
    errorHandler : function(msg, stack) {
        this.defaultErrorHandler(msg, stack)
    },

    defaultErrorHandler : function (msg, stack) {
        dump("\nScript Error: "+msg+"\n");
        if (stack && stack.length) {
            dump("       Stack:\n");
            stack.forEach(function(t) {
                dump('         -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : '')+"\n");
            })
            dump("\n");
        }
    },

    /**
     * create a new browser element. call the given callback when it is ready,
     * with the browser element as parameter.
     */
    openBrowser : function(callback, parentWindow, size) {
        if (!parentWindow)
            parentWindow = windowMediator.getMostRecentWindow("slimerjs");
        let features = "chrome,dialog=no,scrollbars=no";
        if (size) {
            features += ",width="+size.width+",height="+size.height;
        }
        return parentWindow.openDialog("chrome://slimerjs/content/webpage.xul", "_blank", features, { callback:callback});
    },

    closeBrowser: function (browser) {
        let win = browser.ownerDocument.defaultView.top;
        win.close();
    }
}

/**
 * @param string filename
 * @param base nsIFile
 */
function isFile(filename, base) {
    try {
        let file;
        if (base) {
            file = slUtils.getAbsMozFile(filename, base);
        }
        else {
            file = slUtils.getMozFile(filename);
        }
        if (file.exists()) {
            return file.path;
        }
    }
    catch(e){
    }
    return false;
}

function fillDescriptor(object, host) {
    Object.getOwnPropertyNames(object).forEach(function(name) {
        host[name] = Object.getOwnPropertyDescriptor(object, name)
    });
}

const nativeModules = {
    'fs' : 'sdk/io/file',
    'webpage': 'slimer-sdk/webpage',
    'net-log' : 'slimer-sdk/net-log',
    'webserver' : 'webserver',
    'system' : 'system',
    'vm':'slimer-sdk/vm',
    'path':'slimer-sdk/path',
};

const firstPathPart = /^([a-zA-Z\-]+\/)/;

/**
 * prepare the module loader
 * Some things here could be done in the loader.js file, but we want to avoid to
 * modify it because this is an external file.
 * @param string fileURI  the URI of the main script to execute
 * @param nsIFile dirFile the file object of the directory where the script is stored
 */
function prepareLoader(fileURI, dirFile) {
    var dirURI =  Services.io.newFileURI(dirFile).spec;
    let dirPath = dirFile.path;
    var loader;

    var metadata ={
        permissions : {}
    };

    var requirePaths = new Array();
    requirePaths.push(dirPath);

    let pathsMapping = {
        'main': fileURI,
        'sdk/': 'resource://slimerjs/addon-sdk/sdk/',
        'slimer-sdk/': 'resource://slimerjs/slimer-sdk/',
        '@loader/': 'resource://slimerjs/@loader',
        'chrome': 'resource://slimerjs/@chrome',
        'webserver' : 'resource://slimerjs/webserver.jsm',
        'system' : 'resource://slimerjs/system.jsm',
        'coffee-script/':'resource://slimerjs/coffee-script/lib/coffee-script/',
    }
    pathsMapping[dirPath] = dirURI;

    // list of extensions and their compiler
    var extensions = {
        '.js': function(module, filename) {
            let content = slUtils.readSyncStringFromFile(slUtils.getMozFile(filename));
            return module._compile(content, filename);
        },
        '.json': function(module, filename) {
            let content = slUtils.readSyncStringFromFile(slUtils.getMozFile(filename));
            module.exports = JSON.parse(content);
        }
    }

    function findFileExtension(id, baseFile) {
        let f = isFile(id, baseFile)
        if (f)
            return f;
        for(let ext in extensions) {
            f = isFile(id+ext, baseFile);
            if (f)
                return f;
        }
        return null;
    }

    // will contain all global objects/function/variable accessible from all
    // modules.
    var globalProperties = { }

    loader =  Loader.Loader({
        javascriptVersion : 'ECMAv5',
        id:'slimerjs@innophi.com',
        name: 'SlimerJs',
        rootURI: dirURI,
        // metadata: needed by some modules of the addons sdk
        metadata: Object.freeze(metadata),
        paths:pathsMapping,
        globals: {
            console: new slConsole()
        },
        modules: {
          "webserver": Cu.import("resource://slimerjs/webserver.jsm", {}),
          "system": Cu.import("resource://slimerjs/system.jsm", {}),
        },
        // this function should return the true id of the module.
        // The returned id should be an id or an absolute path of a file
        resolve: function(id, requirer) {

            if (id in nativeModules)
                return nativeModules[id];

            if (id == 'chrome' || id.indexOf('@loader/') === 0) {
                if (requirer.id.indexOf('sdk/') === 0
                    || requirer.id.indexOf('slimer-sdk/') === 0) {
                    return id;
                }
                // the chrome module is only allowed in embedded modules
                if (id == 'chrome') {
                    throw Error("Module "+ requirer.id+ " is not allowed to require the chrome module");
                }
                else if (id.indexOf('@loader/') === 0)
                    throw Error("Unknown "+ id +" module");
            }

            // let's resolve other id module as usual
            id = Loader.resolve(id, requirer);

            // if this is a slimerjs module, don't try to find it in module path
            let part = firstPathPart.exec(id);
            let reqpart = firstPathPart.exec(requirer.id);
            if (part && reqpart && reqpart[1] in pathsMapping && part[1] in pathsMapping) {
                return id;
            }

            // Here the id is an absolute path if requirer.id is an absolute path
            let realId = findFileExtension(id);
            if (realId) {
                 return realId;
            }

            let requirerUri = Services.io.newURI(requirer.uri, null, null);
            let requirerDir = requirerUri.QueryInterface(Ci.nsIFileURL).file.parent;

            // this is not an absolute path, try to resolve the id
            // against all registered path
            for (let i=0; i < requirePaths.length;i++) {
                // if path is a relative path, it should be
                // resolve against the current module path;
                let dir = slUtils.getAbsMozFile(requirePaths[i], requirerDir);
                let file = findFileExtension(id, dir);
                if (file)
                if (file) {
                    return file;
                }
            }
            return id;
        },

        // It loads the given module into a sandbox.
        // It replaces the default loader, Loader.load
        load : function(loader, module) {

            // let's prepare the require function that will
            // be available in the sandbox.
            var require = Loader.Require(loader, module);

            Object.defineProperty(require, 'paths',
                                  {
                                    enumerable:true,
                                    value: requirePaths,
                                    writable:false,
                                  });
            Object.defineProperty(require, 'globals',
                                  {
                                    enumerable:true,
                                    value: globalProperties,
                                    writable:false,
                                  });
            Object.defineProperty(require, 'extensions',
                                  {
                                    enumerable:true,
                                    value: extensions,
                                    writable:false,
                                  });

            // let's create the sandbox
            let sandbox = Loader.Sandbox({
                principal: systemPrincipal,
                name: module.uri,
                prototype:mainWindow,
                wantXrays: true
            });

            // let's define some object available in the sandbox
            Cu.import('resource://slimerjs/slimer.jsm', sandbox);
            Cu.import('resource://slimerjs/phantom.jsm', sandbox);

            let properties = {};
            fillDescriptor(globalProperties, properties)
            fillDescriptor(loader.globals, properties)
            fillDescriptor({
                    require: require,
                    module: module,
                    exports: module.exports
                }, properties);
            Object.defineProperties(sandbox, properties);

            // this method is called by extension handlers
            // @see require.extensions, and the extensions var
            module._compile = function (content, filename) {
                Loader.load(loader, module, sandbox, content);
            }

            // for modules that are provided as JSM modules,
            // load them with Loader
            // we assume that it is always a javascript script
            if (module.uri.indexOf('file://') == -1) {
                Loader.load(loader, module, sandbox);
                return;
            }

            // the module is an external file
            let file;
            try {
                file = fileHandler.getFileFromURLSpec(module.uri);
            }
            catch(e) {
                dump("err for "+module.uri+": "+e+"\n")
                throw e;
            }
            let filename = file.leafName;
            let source = '';
            // depending of the extension of the module file,
            // we load the module with the corresponding handler
            let hasBeenLoaded = false;
            for(let ext in extensions) {
                let idx = filename.lastIndexOf(ext);
                if (idx == -1 || idx != (filename.length - ext.length)) {
                    continue;
                }
                extensions[ext](module, file.path);
                hasBeenLoaded = true;
                break;
            }
            if (!hasBeenLoaded) {
                let err = new Error(file.path + " is not a supported type file")
                if (module.id == "main")
                    err.name = 'FatalError';
                throw err;
            }
        }
    });

    return loader;
}

function resolveMainURI(mapping) {
    let count = mapping.length, index = 0;
    while (index < count) {
        let [ path, uri ] = mapping[index ++];
        if (path == 'main')
            return uri;
    }
    return null;
}

