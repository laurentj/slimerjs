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


/*
Script handlers are object that can be used to launch a script (intenal or external).
These handlers can handle some command line parameter, and then are able to say
which script SlimerJS should execute.

Interface for script handlers:

- setOptionsSpecInto(currentOptionSpec) : indicate all options that it supports on the
  command line. It should fill the current object. see optionsSpec in slConfiguration.jsm

- isHandledMainScript(). returns true if it is able to indicate the main script to
  execute. This method is called after setOptionsSpecInto().

- declareScript(nsICommandLine): set to slConfiguration the main script URI.
  called only if isHandledMainScript() returned true.

*/

// script handler for external js file
var externalScriptHandler = {
    name: 'externalScriptHandler',
    setOptionsSpecInto : function(currentOptionSpec) {
        // no specific options
    },

    isHandledMainScript : function() {
        // first argument should be the script name
        return (slConfiguration.args.length && slConfiguration.args[0].substr(0,1) != '-');
        //dump("unknown option "+slConfiguration.args[0]+" \n");
        //cmdLine.preventDefault = true
    },
    declareScript : function(cmdLine) {
        let file = null;
        if (/Mac/i.test(httphandler.oscpu)) {
            // under MacOS, resolveFile fails with a relative path
            try {
                file = cmdLine.resolveFile(slConfiguration.args[0]);
            }
            catch(e) {
                file = slUtils.getAbsMozFile(slConfiguration.args[0], cmdLine.workingDirectory)
            }
        }
        else {
            file = cmdLine.resolveFile(slConfiguration.args[0]);
        }
        if (!file.exists())
            throw new Error("script not found");

        slConfiguration.mainScriptURI = Services.io.newFileURI(file);
        slConfiguration.scriptFile = file;
    }
}

// example of a script handler that loads an script from a specifique URI/namespace
var helloScriptHandler = {
    name : 'helloScriptHandler',
    setOptionsSpecInto : function(currentOptionSpec) {
        currentOptionSpec.helloworld = ['hello-world', 'bool', false, true];
    },
    isHandledMainScript : function() {
        return slConfiguration.helloworld;
    },
    declareScript : function(cmdLine) {
        slConfiguration.mainScriptURI = Services.io.newURI('resource://slimerjs/hello/world.js', null, null);
        slConfiguration.scriptModulePath = 'hello/';
        slConfiguration.args.unshift(slConfiguration.mainScriptURI.spec);
    }
}



// Script handler for GhostDriver
var webDriverScriptHandler = {
    name : 'webDriverScriptHandler',
    _getDir : function() {
        var appDir = Services.dirsvc.get("CurProcD", Components.interfaces.nsIFile);
        appDir.append('vendors');
        appDir.append('ghostdriver');
        return appDir;
    },
    setOptionsSpecInto : function(currentOptionSpec) {

        slConfiguration.baseURIStrictCommonJS.push(this._getDir().path);

        function parse_webdriver(val, cmdlineOpt) {
            let pos = val.lastIndexOf(':');
            if ( pos > 0) {
                slConfiguration.webdriverIp = val.substring(0, pos);
                slConfiguration.webdriverPort = val.substring(pos+1);
            }
            else {
                slConfiguration.webdriverPort = val;
            }
            return val;
        }
        //currentOptionSpec.webdriverEngine = ['webdriver-engine', '', null, true];
        currentOptionSpec.webdriver = [['webdriver', 'wd','w'], parse_webdriver, '', true];
        currentOptionSpec.webdriverIp = ['', '', '127.0.0.1', true];
        currentOptionSpec.webdriverPort = ['', '', '8910', true];
        currentOptionSpec.webdriverLogFile = ['webdriver-logfile', 'file', '', true];
        currentOptionSpec.webdriverLogLevel = ['webdriver-loglevel',
                function (val, cmdlineOpt) {
                    if (!(val == 'ERROR' || val == 'WARN' || val=='INFO' || val == 'DEBUG')) {
                        throw new Error("Invalid value for '"+cmdlineOpt+"' option. It should be ERROR, WARN, INFO or DEBUG");
                    }
                    return val;
                }, 'INFO', true];
        currentOptionSpec.webdriverSeleniumGridHub = ['webdriver-selenium-grid-hub', 'url', '', true];
    },
    isHandledMainScript : function() {
        return (slConfiguration.webdriver != '');
    },
    declareScript : function(cmdLine) {
        slConfiguration.scriptFile = this._getDir();
        slConfiguration.scriptFile.append('main.js');
        slConfiguration.mainScriptURI = Services.io.newFileURI(slConfiguration.scriptFile);
        slConfiguration.args.unshift(slConfiguration.mainScriptURI.spec);

        slConfiguration.args.push("--ip="+slConfiguration.webdriverIp);
        slConfiguration.args.push("--port="+slConfiguration.webdriverPort);

        if (slConfiguration.webdriverSeleniumGridHub) {
            slConfiguration.args.push("--hub="+slConfiguration.webdriverSeleniumGridHub);
        }

        if (slConfiguration.webdriverLogFile) {
            slConfiguration.args.push("--logFile="+slConfiguration.webdriverLogFile);
            slConfiguration.args.push("--logColor=false");
        }

        slConfiguration.args.push("--logLevel="+slConfiguration.webdriverLogLevel);
        slConfiguration.enableCoffeeScript = false;
    }
}


/**
 * The main command line handler of SlimerJS
 */
function slCommandLine() {
}

slCommandLine.prototype = {

    classID: Components.ID("{00995ba2-223f-4efb-b656-ce98aff7019b}"),
    classDescription: "Command line handler for SlimerJS",
    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsICommandLineHandler]),

    /**
     * known script handlers
     */
    _scriptHandlers : [
        webDriverScriptHandler,
        //helloScriptHandler,
        externalScriptHandler // should be always the last one
    ],

    // ------- nsICommandLineHandler interface

    handle : function (cmdLine) {

        // clear all caches, so scripts will be truly loaded
        try {
            if ('cache2' in Services) {
                Services.cache2.clear();
            }
            else {
                // GECKO <31
                Services.cache.evictEntries(Services.cache.STORE_ANYWHERE);
            }
        } catch(ex) {
            dump("error cache service:"+ ex+"\n");
        }

        // retrieve environment variables
        if (envService.exists('__SLIMER_ENV')) {
            let envs = envService.get('__SLIMER_ENV');
            slConfiguration.setEnvNames(envs.split(/,/));
        }

        // set working directory
        slConfiguration.workingDirectory = cmdLine.workingDirectory;

        // bug in mozilla: the -attach-console used during the call of xulrunner
        // on windows is not "eat"
        cmdLine.handleFlag('attach-console', false)

        // read all options and parameters (except script name and script arguments)
        try {
            slConfiguration.handleFlags(cmdLine, this._scriptHandlers);
        }
        catch(e) {
            dump(e+"\n");
            cmdLine.preventDefault = true
            return;
        }

        // let's read all script arguments, so they will be available in system.args
        this._extractScriptArgs(cmdLine);

        // did a script handler is able to give us the main script to execute?
        let handler = this._scriptHandlers.filter(function(sh) {
                return sh.isHandledMainScript();
            });

        if (handler.length == 0) {
            // no script handler...
            let msg;
            if (slConfiguration.args.length && slConfiguration.args[0].substr(0,1) == '-') {
                msg = "unknown option "+slConfiguration.args[0];
            }
            else {
                msg = "script is missing";
            }
            Components.utils.reportError(msg);
            dump(msg+"\n");
            cmdLine.preventDefault = true
        }
        else {
            // yes, we found a script handler!
            handler = handler[0];
            try {
                handler.declareScript(cmdLine);
                if (!slConfiguration.mainScriptURI)
                    throw new Error("Internal error: script cannot be defined");
            }
            catch(e) {
                let msg = ("getMessage" in e?e.getMessage() : "" +e);
                Components.utils.reportError(msg);
                dump(msg + "\n");
                cmdLine.preventDefault = true
                return;
            }
        }

        // display debug information if needed
        Components.utils.import("resource://slimerjs/slDebug.jsm");
        if (DEBUG_CLI) {
            slDebugLog('Gecko version: '+Services.appinfo.platformVersion);
            slDebugLog('script args: '+slConfiguration.args.join(' '));
        }
        if (DEBUG_CONFIG) {
            slConfiguration.printDebugConfig();
        }

        // now XulRunner will open the slimerjs.xul window which
        // will call slLauncher.
    },

    get helpInfo () {
        return "\n";
    },

    _extractScriptArgs: function(cmdLine) {
        let nbArgs = cmdLine.length;
        if (nbArgs == 0) {
            return;
        }
        // The command line parser normalize options:
        // --flag becomes -flag and --flag==value becomes -flag value
        // we should store original flags into system.args
        let realArgs = ''
        if (envService.exists('__SLIMER_ARGS'))
            realArgs = envService.get('__SLIMER_ARGS');

        for(let i=0; i < nbArgs; i++) {
            let arg = cmdLine.getArgument(i);
            if (arg.charAt(0) == '-' && realArgs) {
                let r = new RegExp("-"+arg+"(\=[^ \t\r\n]+)?")
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
    }
}





var NSGetFactory = XPCOMUtils.generateNSGetFactory([slCommandLine]);

