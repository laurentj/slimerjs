/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://slimerjs/slConfiguration.jsm");
Components.utils.import("resource://slimerjs/slUtils.jsm");

var envService = Components.classes["@mozilla.org/process/environment;1"].
          getService(Components.interfaces.nsIEnvironment);

var httphandler =  Components.classes["@mozilla.org/network/protocol;1?name=http"]
                    .getService(Components.interfaces.nsIHttpProtocolHandler);

function slCommandLine() {

}

slCommandLine.prototype = {

    classID: Components.ID("{00995ba2-223f-4efb-b656-ce98aff7019b}"),
    classDescription: "Command line handler for SlimerJS",
    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsICommandLineHandler]),

    // ------- nsICommandLineHandler interface

    handle : function (cmdLine) {

        // clear all caches, so scripts will be truly loaded
        var cacheService = Components.classes["@mozilla.org/network/cache-service;1"]
                           .getService(Components.interfaces.nsICacheService);

        try {
            cacheService.evictEntries(Components.interfaces.nsICache.STORE_ANYWHERE);
        } catch(ex) {
            dump("error cache service:"+ ex+"\n");
        }

        if (envService.exists('__SLIMER_ENV')) {
            let envs = envService.get('__SLIMER_ENV');
            slConfiguration.setEnvNames(envs.split(/,/));
        }

        slConfiguration.workingDirectory = cmdLine.workingDirectory;

        let configFile = cmdLine.handleFlagWithParam("config", false);
        if (configFile) {
            dump("--config not supported yet\n");
        }

        try {
            slConfiguration.handleFlags(cmdLine);
        }
        catch(e) {
            dump(e+"\n");
            cmdLine.preventDefault = true
            return;
        }

        if (cmdLine.length == 0) {
            Components.utils.reportError("script is missing");
            dump("script is missing\n");
            cmdLine.preventDefault = true
            return;
        }

        let nbArgs = cmdLine.length;
        // The command line parser normalize options:
        // --flag becomes -flag and --flag==value becomes -flag value
        // we should store original flags into system.args
        let realArgs = ''
        if (envService.exists('__SLIMER_ARGS'))
            realArgs = envService.get('__SLIMER_ARGS');

        for(let i=0; i < nbArgs; i++) {
            let arg = cmdLine.getArgument(i);
            if (arg.charAt(0) == '-' && realArgs) {
                let r = new RegExp("-"+arg+"(\=[^\s]+)?")
                let result = r.exec(realArgs);
                if (result) {
                    if (result[1]) {
                        i++;
                        slConfiguration.args.push('-'+arg+'='+cmdLine.getArgument(i));
                    }
                    else {
                        slConfiguration.args.push('-'+arg);
                    }
                }
                else {
                    slConfiguration.args.push(arg);
                }
            }
            else {
                slConfiguration.args.push(arg);
            }
        }
        cmdLine.removeArguments(0, nbArgs-1);

        if (slConfiguration.args[0].substr(0,1) == '-') {
            Components.utils.reportError("unknown option");
            dump("unknown option\n");
            cmdLine.preventDefault = true
            return;
        }

        try {
            if (/Mac/i.test(httphandler.oscpu)) {
                // under MacOS, resolveFile fails with a relative path
                try {
                    slConfiguration.scriptFile = cmdLine.resolveFile(slConfiguration.args[0]);
                }
                catch(e) {
                    slConfiguration.scriptFile = getAbsMozFile(slConfiguration.args[0], cmdLine.workingDirectory)
                }
            }
            else {

                slConfiguration.scriptFile = cmdLine.resolveFile(slConfiguration.args[0]);
            }
            if (!slConfiguration.scriptFile.exists())
                throw "script not found";
        }
        catch(e) {
            Components.utils.reportError("script not found");
            dump("script not found\n");
            cmdLine.preventDefault = true
            return;
        }
    },

    get helpInfo () {
        return "\n";
    }
}

var NSGetFactory = XPCOMUtils.generateNSGetFactory([slCommandLine]);

