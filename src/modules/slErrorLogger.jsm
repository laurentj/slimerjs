/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";


var EXPORTED_SYMBOLS = ["initErrorLogger"];

const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

Cu.import('resource://slimerjs/slUtils.jsm');
Cu.import("resource://gre/modules/Services.jsm");

var outputStream;
var uconv;

/**
 * initialize a logger which writes all javascript error
 * in the given file name
 */
function initErrorLogger(fileName, workingDir) {
    if (outputStream) {
        return;
    }
    try {
        uconv = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
              createInstance(Ci.nsIScriptableUnicodeConverter);
        uconv.charset = "UTF-8";

        // open the log file
        let file = slUtils.getAbsMozFile(fileName, workingDir);
        let openFlags = parseInt("0x1A");
        let permFlags = parseInt("0644", 8);
        outputStream = Cc['@mozilla.org/network/file-output-stream;1'].
                            createInstance(Ci.nsIFileOutputStream);
        outputStream.init(file, openFlags, permFlags, 0);
        
        // convert the stream into a buffered stream
        let ioUtils = Cc["@mozilla.org/io-util;1"].getService(Ci.nsIIOUtil);
        if (!ioUtils.outputStreamIsBuffered(outputStream)) {
            let stream = Cc["@mozilla.org/network/buffered-output-stream;1"].
                createInstance(Ci.nsIBufferedOutputStream);
            stream.init(outputStream, 0x8000);
            outputStream = stream;
        }

        // an observer on quit-application, to close the log file properly
        var quitObserver = {
            observe: function(subject, topic, data) {
                outputStream.close();
                Services.obs.removeObserver(quitObserver, "quit-application");
                Services.console.unregisterListener(slErrorLogger);
            },
            QueryInterface: function (iid) {
                if (!iid.equals(Ci.nsIObserver) &&
                    !iid.equals(Ci.nsISupports)) {
                    throw Cr.NS_ERROR_NO_INTERFACE;
                }
                return this;
            }
        }
        Services.obs.addObserver(quitObserver, "quit-application", false);
    }
    catch(e){
        dump("Error logger error: "+e+"\n");
        return;
    }

    /// register our logger in the console service
    Services.console.registerListener(slErrorLogger);
}


/**
 * a listener for the console service, to log errors in a file.
 */
var slErrorLogger = {
    observe:function( aMessage ){
        try {
            let msg = aMessage.QueryInterface(Ci.nsIScriptError);

            // forget some messages from embedded libs
            if (msg.sourceName.indexOf("resource://slimerjs/coffee-script/") != -1
                || msg.sourceName.indexOf("jasmine/jasmine.js") != -1)
                return;

            //dump(" *** slErrorLogger:"+aMessage.message+ "("+aMessage.category+")\n")

            let type = "error";
            if (msg.flags & msg.warningFlag) {
                type = "warning"
            }
            else if (msg.flags & msg.strictFlag) {
                type = "strict"
            }

            let str = "*** "+msg.category+"["+type+"]: "+msg.sourceName+"\n\t"+msg.lineNumber+": "+msg.sourceLine;
            str += "\n\t"+ msg.errorMessage+"\n\n";
            this.logStr(str)
            //dump("   *** slErrorLogger log ok\n")
        }
        catch(e) {
            //dump("**************** slErrorLogger EXCEPTION:"+e+"\n")
        }
    },
    logStr : function(str) {
        let istream = uconv.convertToInputStream(str);
        let len = istream.available();
        while (len > 0) {
            outputStream.writeFrom(istream, len);
            len = istream.available();
        }
        istream.close();
        outputStream.flush();
    },
    QueryInterface: function (iid) {
        if (!iid.equals(Ci.nsIConsoleListener) &&
            !iid.equals(Ci.nsISupports)) {
            throw Cr.NS_ERROR_NO_INTERFACE;
        }
        return this;
    }
};
