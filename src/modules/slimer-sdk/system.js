/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const { Cc, Ci, Cu, Cr } = require('chrome');

var fs = require('fs');

Cu.import('resource://slimerjs/slConfiguration.jsm');
Cu.import("resource://gre/modules/Services.jsm");

var xulRuntime = Cc["@mozilla.org/xre/app-info;1"]
                 .getService(Ci.nsIXULRuntime);

var httphandler =  Cc["@mozilla.org/network/protocol;1?name=http"]
                    .getService(Ci.nsIHttpProtocolHandler);

var oscpu = httphandler.oscpu;

var _isWindows = false;

var OS = {
    architecture: '32bit',
    name: xulRuntime.OS.toLowerCase(),
    version: '',
    isWindows : () => _isWindows
};

if (OS.name == 'linux') {
    if (oscpu.indexOf('64') != -1) {
        OS.architecture = '64bit';
    }
}
else if (/Mac/i.test(oscpu)) {
    if (oscpu.indexOf('PPC') != -1)
        OS.architecture = 'ppc';
    else
        OS.architecture = '64bit';

    OS.version = /([0-9\.ba]+)$/i.exec(oscpu)[1];
}
else if (/windows/i.test(oscpu)) {
    if (oscpu.indexOf('64') != -1) {
        OS.architecture = '64bit';
    }
    OS.version = /(\d+\.\d+)/.exec(oscpu)[1];

    switch (OS.version) { // matches values in Phantomjs
        case "4.0":
        case "3.5":
        case "3.51":
            OS.version = "NT"; break;
        case "5.0":
            OS.version = "2000"; break;
        case "5.1":
            OS.version = "XP"; break;
        case "5.2":
            OS.version = "2003"; break;
        case "6.0":
            OS.version = "Vista"; break;
        case "6.1":
            OS.version = "7"; break;
        case "6.2":
            OS.version = "8"; break;
        case "6.3":
            OS.version = "8.1"; break;
        case "10.0":
            OS.version = "10"; break;
    }
    _isWindows = true;
}

var envService = Cc["@mozilla.org/process/environment;1"].
          getService(Ci.nsIEnvironment);
var environment;

// we use a Proxy object to access to environment variable
// so we can get and set any environment variable, even those which don't exist yet
var environmentHandler = {
    has : function (obj, prop) {
        return envService.exists(prop);
    },
    get : function (obj, prop) {
        if (envService.exists(prop))
            return envService.get(prop);
        return "";
    },
    set : function (obj, prop, value) {
        if (!envService.exists(prop))
            slConfiguration.envs.push(prop);
        return envService.set(prop, value);
    },
    ownKeys : function(obj) {
        return slConfiguration.envs;
    },
    getOwnPropertyDescriptor: function(target, prop) {
        if (!envService.exists(prop))
            return undefined;
        return {
            value: envService.get(prop),
            enumerable: true,
            configurable: true,
            writable: true
        }
    },
    defineProperty: function(prop, { value }){
        if (!envService.exists(prop)) {
            slConfiguration.envs.push(prop);
        }
        envService.set(prop, value);
    },

    
    // obsolete properties since Firefox 33

    hasOwn : function (obj, prop) {
        return envService.exists(prop);
    },
    getOwnPropertyNames : function(obj) {
        return slConfiguration.envs;
    },
    keys : function(obj) {
        return slConfiguration.envs;
    },

    // obsolete? Not defined in Proxy spec
    getPropertyDescriptor: function(prop) {
        return this.getOwnPropertyDescriptor(prop)
    },
    getPropertyNames : function(obj) {
        return slConfiguration.envs;
    },
    enumerate : function(obj) {
        return slConfiguration.envs;
    },
    iterate : function(obj) {
        var props = slConfiguration.envs, i = 0;
        return {
            next: function() {
            if (i === props.length) throw StopIteration;
                return props[i++];
            }
        };
    },

}
environment = new Proxy({}, environmentHandler);

Object.defineProperty(exports, 'os', {
    enumerable: true,
    writeable: false,
    get: function() {
        return OS;
    }
});

Object.defineProperty(exports, 'pid', {
    enumerable: true,
    writeable: false,
    get: function() {
        //Cu.reportError("system.pid not implemented");
        return 0;  // no Mozilla API to retrieve the PID :-/
    }
});

Object.defineProperty(exports, 'platform', {
    enumerable: true,
    writeable: false,
    get: function() {
        return "slimerjs";
    }
});

Object.defineProperty(exports, 'env', {
    enumerable: true,
    writeable: false,
    get: function() {
        return environment;
    }
});

Object.defineProperty(exports, 'args', {
    enumerable: true,
    writeable: false,
    get: function() {
        return slConfiguration.args;
    }
});

var stdout = null;
var stderr = null;
var stdin = null;

var currentEncoding = '';

function getOutput(file, stream) {
    if (_isWindows) {
        return {
            write: dump,
            writeLine: function (data) {
                dump(data + '\n');
            }
        }
    }
    if (stream) {
        if (currentEncoding == slConfiguration.outputEncoding) {
            return stream;
        }
        stream.close();
    }
    currentEncoding = slConfiguration.outputEncoding;
    if (currentEncoding == 'binary') {
        stream = fs.open(file, { mode:'bw'});
    }
    else {
        stream = fs.open(file,
                         { mode:'w',
                           charset:currentEncoding,
                           nobuffer:true});
    }
    return stream;
}

Object.defineProperty(exports, 'stdout', {
    enumerable: true,
    writeable: false,
    get: function() {
        stdout = getOutput('/dev/stdout', stdout);
        return stdout;
    }
});

Object.defineProperty(exports, 'stderr', {
    enumerable: true,
    writeable: false,
    get: function() {
        stderr = getOutput('/dev/stderr', stderr);
        return stderr;
    }
});

Object.defineProperty(exports, 'stdin', {
    enumerable: true,
    writeable: false,
    get: function() {
        if (_isWindows) {
            throw Error("system.stdin is not supported on Windows")
        }
        if (!stdin) {
            // it fails if we open with "rb" mode
            stdin = fs.open('/dev/stdin', 'rb');
        }
        return stdin;
    }
});

Object.defineProperty(exports, 'standardout', {
    enumerable: true,
    writeable: false,
    get: function() {
        stdout = getOutput('/dev/stdout', stdout);
        return stdout;
    }
});

Object.defineProperty(exports, 'standarderr', {
    enumerable: true,
    writeable: false,
    get: function() {
        stderr = getOutput('/dev/stderr', stderr);
        return stderr;
    }
});

Object.defineProperty(exports, 'standardin', {
    enumerable: true,
    writeable: false,
    get: function() {
        if (_isWindows) {
            throw Error("system.standardin is not supported on Windows")
        }
        if (!stdin) {
            // it fails if we open with "rb" mode
            stdin = fs.open('/dev/stdin', 'rb');
        }
        return stdin;
    }
});

