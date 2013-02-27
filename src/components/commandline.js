/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://slimerjs/slConfiguration.jsm");

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

        slConfiguration.setEnvNames(cmdLine.handleFlagWithParam("envs", false).split(/,/));

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
            cmdLine.preventDefault = true
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
            cmdLine.preventDefault = true
            return;
        }

        try {
            slConfiguration.scriptFile = cmdLine.resolveFile(slConfiguration.args[0]);
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

