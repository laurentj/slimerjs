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


Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

Components.utils.import("resource://slimerjs/slConfiguration.js");

function slCommandLine() {

}

slCommandLine.prototype = {

    classID: Components.ID("{00995ba2-223f-4efb-b656-ce98aff7019b}"),
    classDescription: "Command line handler for SlimerJS",
    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsICommandLineHandler]),

    // ------- nsICommandLineHandler interface

    handle : function (cmdLine) {

        if (!cmdLine.handleFlag("slimerjs", false)) {
            return;
        }

        cmdLine.preventDefault = true;

        let configFile = cmdLine.handleFlagWithParam("config", false);
        if (configFile) {
            dump("--config not supported yet\n");
        }

        var cookiesFile = cmdLine.handleFlagWithParam("cookies-file", false);
        if (cookiesFile) {
            // read cookie files
            dump("--cookies-file not supported yet\n");
        }

        if (cmdLine.handleFlagWithParam("ignore-ssl-errors", false) === 'yes') {
            // deactivate ssl errors
            dump("--ignore-ssl-errors not supported yet\n");
        }
        else {
            // activate ssl errors
        }

        if (cmdLine.handleFlagWithParam("web-security", false) === 'no') {
            // deactivate web security and authorise cross-domain xhr
            dump("--web-security not supported yet\n");
        }
        else {
            // activate web security and forbid cross-domain xhr
        }

        if (cmdLine.handleFlagWithParam("load-images", false) === 'no') {
            // deactivate image loading
            dump("--load-images not supported yet\n");
        }
        else {
            // activate image loading
        }

        if (cmdLine.handleFlagWithParam("local-to-remote-url-access", false) === 'yes') {
            // deactivate ssl errors
            dump("--local-to-remote-url-access not supported yet\n");
        }
        else {
            // activate ssl errors
        }

        if (cmdLine.handleFlagWithParam("disk-cache", false) === 'yes') {
            // activate disk cache
            dump("--disk-cache not supported yet\n");
        }
        else {
            // disable disk cache
        }

        let maxDiscCache = cmdLine.handleFlagWithParam("max-disk-cache-size", false);
        if (maxDiscCache !== null) {
            dump("--max-disk-cache-size not supported yet\n");
        }

        let outputEncoding = cmdLine.handleFlagWithParam("output-encoding", false);
        if (!outputEncoding) {
            outputEncoding = 'utf-8';
        }
        else
            dump("--output-encoding not supported yet\n");

        let scriptEncoding = cmdLine.handleFlagWithParam("script-encoding", false);
        if (!scriptEncoding)
            scriptEncoding = 'utf-8';
        else
            dump("--script-encoding not supported yet\n");

        let proxy = cmdLine.handleFlagWithParam("proxy", false);
        if (proxy) {
            dump("--proxy not supported yet\n");
        }

        let proxyType = cmdLine.handleFlagWithParam("proxy-type", false);
        if (proxyType) {
            dump("--proxy-type not supported yet\n");
        }

        if (cmdLine.length == 0) {
            Components.utils.reportError("script is missing");
            dump("script is missing\n");
            return;
        }

        let nbArgs = cmdLine.length;
        for(let i=0; i < nbArgs; i++) {
            slConfiguration.args.push(cmdLine.getArgument(i));
        }
        cmdLine.removeArguments(0, nbArgs-1);

        if (slConfiguration.args[0].substr(0,1) == '-') {
            Components.utils.reportError("unknown option");
            dump("unknown option\n");
            return;
        }

        try {
            slConfiguration.scriptFile = cmdLine.resolveFile(slConfiguration.args[0]);
        }
        catch(e) {
            Components.utils.reportError("script not found");
            dump("script not found\n");
            return;
        }

        Services.ww.openWindow(null, "chrome://slimerjs/content/slimerjs.xul", "_blank",
                "chrome,menubar,toolbar,status,resizable,dialog=no",
                null);
    },

    get helpInfo () {
        return "  -slimerjs           launch SlimerJS instead of Firefox\n";
    }
}

var NSGetFactory = XPCOMUtils.generateNSGetFactory([slCommandLine]);

