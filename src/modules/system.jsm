/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var EXPORTED_SYMBOLS = ["os", "pid", "platform", "env"];
Components.utils.import('resource://slimerjs/slConfiguration.jsm');
Components.utils.import("resource://gre/modules/Services.jsm");

var xulRuntime = Components.classes["@mozilla.org/xre/app-info;1"]
                 .getService(Components.interfaces.nsIXULRuntime);

var httphandler =  Components.classes["@mozilla.org/network/protocol;1?name=http"]
                    .getService(Components.interfaces.nsIHttpProtocolHandler);

var oscpu = httphandler.oscpu;

var _isWindows = false;

var OS = {
    architecture: '32bit',
    name: xulRuntime.OS.toLowerCase(),
    version: '',
    isWindows : function() _isWindows

}

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
    _isWindows = true;
}

this.__defineGetter__('os', function(){ return  OS;});

this.__defineGetter__('pid', function(){
    //Components.utils.reportError("system.pid not implemented");
    return 0;  // no Mozilla API to retrieve the PID :-/
});

this.__defineGetter__('platform', function(){
    return "slimerjs";
});

var envService = Components.classes["@mozilla.org/process/environment;1"].
          getService(Components.interfaces.nsIEnvironment);
var environment;

// we use a Proxy object to access to environment variable
// so we can get and set any environment variable, even those which don't exist yet
var environmentHandler = {
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
    keys : function(obj) {
        return slConfiguration.envs;
    },
    has : function (obj, prop) {
        return envService.exists(prop);
    },
    hasOwn : function (obj, prop) {
        return envService.exists(prop);
    },
    getPropertyNames : function(obj) {
        return slConfiguration.envs;
    },
    getOwnPropertyNames : function(obj) {
        return slConfiguration.envs;
    },
    getPropertyDescriptor: function(prop) {
        return this.getOwnPropertyDescriptor(prop)
    },
    getOwnPropertyDescriptor: function(prop) {
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
        envService.set(prop, value);
    },
}
try {
    // Firefox 18
    environment = new Proxy({}, environmentHandler);
}
catch(e) {
    // Firefox < 18
    environment = Proxy.create(environmentHandler, {});
}

this.__defineGetter__('env', function(){
    return environment;
});

this.__defineGetter__('args', function(){
    return slConfiguration.args;
});

