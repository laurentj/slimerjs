/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";
var EXPORTED_SYMBOLS = ["slConsole", "getTraceException"];

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://slimerjs/slDebug.jsm');
Components.utils.import('resource://slimerjs/slConfiguration.jsm');

function getTraceException(e, fileURI) {
    let msg;
    let stackRes = [];

    if (typeof e == 'object' && 'stack' in e) {
        if (e.message == undefined)
            msg = "" +e;
        else
            msg = e.message;

        let stack = e.stack;
        if ('fileName' in e && e.fileName != undefined) {
            let lineNumber = ('lineNumber' in e? parseInt(e.lineNumber):0);
            let columnNumber = ('columnNumber' in e?parseInt(e.columnNumber):0);
            if (e.fileName.indexOf('->')) {
                stack = (e.fileName.indexOf('@')!=-1?'':'@')+e.fileName+":"+lineNumber+":"+columnNumber+"\n"+stack;
            }
            else {
                let line = {
                    sourceURL: e.fileName,
                    line:lineNumber,
                    column:columnNumber,
                    'function' : null,
                    file: e.fileName
                }
                stackRes.push(line)
            }
        }

        let r = /^\s*(.*)@(.*)\s*$/gm;
        let r2 = /:(\d+)(?::(\d+))?$/
        let m, m2, a = [];

        // exemple of stack
        // bla@resource://slimerjs/addon-sdk/loader.jsm -> file:///home/laurent/projets/slimerjs/test/initial-tests.js:130
        // @resource://slimerjs/addon-sdk/loader.jsm -> file:///home/laurent/projets/slimerjs/test/initial-tests.js:134
        // evaluate@resource://slimerjs/addon-sdk/loader.jsm:180

        while ((m = r.exec(stack))) {
            let [full, funcName, sourceURL] = m;
            let [suffix, lineNumber, columnNumber] = r2.exec(sourceURL);
            sourceURL = sourceURL.substring(0, sourceURL.length-suffix.length);

            if (sourceURL.indexOf('->') != -1) {
                sourceURL = sourceURL.split('->')[1].trim();
            }
            else if (!DEBUG && (sourceURL == 'resource://slimerjs/addon-sdk/toolkit/loader.js'
                             || sourceURL == 'resource://slimerjs/slLauncher.jsm' )) {
                break;
            }

            var line = {
                "sourceURL":sourceURL,
                "file":sourceURL,
                "line": parseInt(lineNumber),
                "column": parseInt(columnNumber),
                "function": funcName
            }
            stackRes.push(line);
        }
    }
    else {
        msg = e.toString();
        var line = {
            "sourceURL":fileURI||'unknown',
            "file":fileURI||'unknown',
            "line": 0,
            "column": 0,
            "function":null
        }
        stackRes.push(line);
    }
    return [msg, stackRes];
}

function formatTrace(stack) {
    let str = '';
    stack.forEach(function(line) {
        str += "\t" + line.sourceURL+" at line "+ line.line + (line.column?" column "+line.column:"")+ " in "+line["function"]+"\n";
    })
    return str;
}

var outputStream = null;

function outputStr(str) {
    if (slConfiguration.isWindows || slConfiguration.outputEncoding =='UTF-8'
        || slConfiguration.outputEncoding =='binary') {
        dump(str);
        return;
    }
    try {
        if (outputStream) {
            outputStream(str);
            return;
        }
        var file = Cc['@mozilla.org/file/local;1']
                  .createInstance(Ci.nsILocalFile);
        file.initWithPath('/dev/stdout');
        var filestream = Cc['@mozilla.org/network/file-output-stream;1'].
                     createInstance(Ci.nsIFileOutputStream);
        filestream.init(file, parseInt("0x12"), parseInt("0644", 8), 0);
        var stream = Cc["@mozilla.org/network/buffered-output-stream;1"].
                    createInstance(Ci.nsIBufferedOutputStream);
        stream.init(filestream, 0x8000);
        var uconv = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
                  createInstance(Ci.nsIScriptableUnicodeConverter);
        uconv.charset =  slConfiguration.outputEncoding;
        outputStream =  function (str) {
            let istream = uconv.convertToInputStream(str);
            let len = istream.available();
            while (len > 0) {
              stream.writeFrom(istream, len);
              len = istream.available();
            }
            istream.close();
            stream.flush();
        }
        outputStream(str);
    } catch (err) {
        dump(str);
    }
}

function dumpArguments() {
    for (var i = 0; i < arguments.length; i++) {
        outputStr(arguments[i] + " ");
    }
    outputStr('\n');
}

function slConsole() {
    this.__exposedProps__ = {
        debug:'r', log:'r', info:'r', warn:'r',
        error:'r', exception: 'r', trace:'r',
        dir:'r', group:'r', groupCollapsed:'r', groupEnd:'r',
        time:'r', timeEnd:'r'
    }
}
slConsole.prototype = {
    log:dumpArguments,
    info:dumpArguments,
    warn:dumpArguments,
    error:dumpArguments,
    debug:dumpArguments,
    exception: function (e) {
        let [msg, stackRes] = getTraceException(e);
        let str = "An exception occurred" +(e.name ? " "+ e.name: "") +": " +
                  (e.message ? e.message : e.toString()) + "\n" +
                  (e.fileName ? "\t"+e.fileName + " " + e.lineNumber + "\n" : "");
        str += "\n"+formatTrace(stackRes);
        outputStr(str);
    },
    trace:function() {
        let frame = Components.stack.caller
        let stack = [];
        while (frame) {
          if (frame.filename) {
            stack.unshift({
              "sourceURL": frame.filename,
              "file": frame.filename,
              "line": frame.lineNumber,
              "column": 0,
              "function": frame.name
            });
          }
          frame = frame.caller;
        }
        outputStr("Trace:\n");
        outputStr(formatTrace(stack)+"\n");
    },
    dir: function dir() {},
    group: function group() {},
    groupCollapsed: function groupCollapsed() {},
    groupEnd: function groupEnd() {},
    time: function time() {},
    timeEnd: function timeEnd() {}
}
