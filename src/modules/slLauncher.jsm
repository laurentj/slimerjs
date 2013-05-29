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

var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Ci.nsIWindowMediator);

var fileHandler = Cc["@mozilla.org/network/protocol;1?name=file"]
                     .getService(Ci.nsIFileProtocolHandler)

var mainSandbox = null;
var mainLoader = null;

var slLauncher = {
    launchMainScript: function (contentWindow, scriptFile) {

        mainSandbox = Cu.Sandbox(contentWindow,
                            {
                                'sandboxName': 'slimerjs',
                                'sandboxPrototype': contentWindow,
                                'wantXrays': true
                            });

        // import the slimer/phantom API into the sandbox
        Cu.import('resource://slimerjs/slimer.jsm', mainSandbox);
        Cu.import('resource://slimerjs/phantom.jsm', mainSandbox);

        // load and execute the provided script
        let fileURI = Services.io.newFileURI(scriptFile).spec;
        mainLoader = prepareLoader(fileURI, scriptFile.parent);

        try {
            loadMainScript(mainLoader, mainSandbox);
        }
        catch(e) {
            if (mainSandbox.phantom.onError) {
                let [msg, stackRes] = getTraceException(e, fileURI);
                mainSandbox.phantom.onError(msg, stackRes);
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

function getFile(path, isDir) {
    let file = Cc['@mozilla.org/file/local;1']
              .createInstance(Ci.nsILocalFile);
    try {
        file.initWithPath(path);
    }
    catch(e){
        throw Error("Modules path "+path+" is not a valid path");
    }
    if (!file.exists()) {
        throw Error("Modules path "+path+" does not exists");
    }
    if (isDir && !file.isDirectory()) {
        throw Error("Modules path "+path+" is not a directory");
    }
    return file;
}

/**
 * @param string filename
 * @param base nsIFile
 */
function isFile(filename, base) {
    try {
        // see if we have an absolute path
        let file;
        if (base) {
            file = base.clone();
            file.appendRelativePath(filename);
        }
        else {
            file = Cc['@mozilla.org/file/local;1']
                        .createInstance(Ci.nsILocalFile);
            file.initWithPath(filename);
        }
        if (file.exists()) {
            return file.path;
        }
    }
    catch(e){
    }
    return false;
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

    // list of all nsIFile corresponding to a modules directory
    var pathsNsFile = [ dirFile ];

    // create a proxy around the array which will contain all module paths.
    // we should know when an element is set or delete, in order to update
    // pathsNsFile and loader.mapping
    var requirePathsProxy = new Proxy(
        [dirPath],
        {
            deleteProperty : function(arr, idx) {
                if (idx.match(/^([0-9])+$/) != null && idx in arr) {
                    var path =arr[idx];
                    pathsNsFile.splice(idx,1);
                    // loader.mapping is not writable, we cannot use filter()
                    let idxToDelete = -1;
                    loader.mapping.forEach(function(elt, idx) {
                        if (elt[0] == path)
                            idxToDelete = idx;
                    });
                    if (idxToDelete > -1)
                        loader.mapping.splice(idxToDelete,1);
                    arr.splice(idx,1);
                    return true;
                }
                return false;
            },
            set: function(arr, idx, path) {
                if (idx.match(/^([0-9])+$/) == null) {
                    arr[idx] = path;
                    return;
                }
                let file = getFile(path, true);
                pathsNsFile[idx] = file;
                loader.mapping.push([file.path, Services.io.newFileURI(file).spec]);
                arr[idx] = file.path;
            },
            // because of a regression in proxies in Firefox 20, we should implement
            // the get() function. see https://bugzilla.mozilla.org/show_bug.cgi?id=876114
            get : function(arr, idx) {
                return arr[idx];
            }
        }
    )

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
            let content = readSyncStringFromFile(getFile(filename));
            return module._compile(content, filename);
        },
        '.json': function(module, filename) {
            let content = readSyncStringFromFile(getFile(filename));
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

            // let's resolve other id module as usual
            id = Loader.resolve(id, requirer);

            if (id.indexOf('sdk/') === 0
                && requirer.indexOf('slimer-sdk/') === 0) {
                return id;
            }

            // if requirer is an absolute path, the id is then an absolute path after Loader.resolve
            let realId = findFileExtension(id);
            if (realId)
                return realId;

            // this is not an absolute path, try to resolve the id
            // against all registered path
            for (let i=0; i < pathsNsFile.length;i++) {
                let dir = pathsNsFile[i];
                if (!dir)
                    continue;
                let file = findFileExtension(id, dir);
                if (file)
                    return file;
            }
            return id;
        },
        load : function(loader, module) {
            var require = Loader.Require(loader, module);

            Object.defineProperty(require, 'paths',
                                  {
                                    enumerable:true,
                                    value: requirePathsProxy,
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

            // we create the prototype of the new sandbox.
            // we don't import directly require and module.exports
            // into the current sandbox else properties of module.exports
            // are shadowed and an __exposedProps__ should be needed.
            // this is why we create a new sandbox with a new prototype
            // that contains properties of the initial sandbox and
            // the properties we want to inject
            let proto = Loader.override(globalProperties, loader.globals);
            proto = Loader.override( proto,
                {
                require: require,
                module: module,
                exports: module.exports
            });

            let sandbox = Loader.Sandbox({
              name: module.uri,
              prototype: mainSandbox,
              wantXrays: false
            });
            Object.defineProperties(sandbox, Loader.descriptor(proto));

            module._compile = function (content, filename) {
                Loader.load(loader, module, sandbox, content);
            }

            if (module.uri.indexOf('file://') == -1) {
                Loader.load(loader, module, sandbox);
                return;
            }
            let file;
            try {
                file = fileHandler.getFileFromURLSpec(module.uri);
            }
            catch(e) {
                dump("err for "+module.uri+" :"+e+"\n")
                throw e;
            }
            let filename = file.leafName;
            let source = '';
            for(let ext in extensions) {
                let idx = filename.lastIndexOf(ext);
                if (idx == -1 || idx != (filename.length - ext.length)) {
                    continue;
                }
                extensions[ext](module, file.path);
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

function loadMainScript(loader, sandbox) {
    // first load the bootstrap module
    let bsModule = Loader.Module('slimer-sdk/bootstrap', 'resource://slimerjs/slimer-sdk/bootstrap.js');
    loader.load(loader, bsModule);

    // load the main module
    let uri =resolveMainURI(loader.mapping);
    let module = loader.main = loader.modules[uri] = Loader.Module('main', uri);
    loader.load(loader, module);
}
