/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";
var EXPORTED_SYMBOLS = ["slConsole", "getTraceException"];

function getTraceException(e, fileURI) {
    let msg;
    let stackRes = [];

    if (typeof e == 'object' && 'stack' in e) {
        msg = e.message;

        let r = /^\s*(.*)@(.*):(\d+)\s*$/gm;
        let m, a = [];
        // exemple of stack
        // bla@resource://slimerjs/addon-sdk/loader.jsm -> file:///home/laurent/projets/slimerjs/test/initial-tests.js:130
        // @resource://slimerjs/addon-sdk/loader.jsm -> file:///home/laurent/projets/slimerjs/test/initial-tests.js:134
        // evaluate@resource://slimerjs/addon-sdk/loader.jsm:180

        while ((m = r.exec(e.stack))) {
            let [full, funcName, sourceURL, lineNumber] = m;
            if (sourceURL.indexOf('->') != -1) {
                sourceURL = sourceURL.split('->')[1].trim();
            }
            else if (sourceURL == 'resource://slimerjs/addon-sdk/toolkit/loader.js'
                     || sourceURL == 'resource://slimerjs/slLauncher.jsm' ) {
                break;
            }

            var line = {
                "sourceURL":sourceURL,
                "line": lineNumber,
                "function": funcName
            }
            stackRes.push(line);
        }
    }
    else {
        msg = e.toString();
        var line = {
            "sourceURL":fileURI||'unknown',
            "line": 0,
            "function":null
        }
        stackRes.push(line);
    }
    return [msg, stackRes];
}

function formatTrace(stack) {
    let str = '';
    stack.forEach(function(line) {
        str += "\t" + line.sourceURL+" at line "+ line.line + " in "+line["function"]+"\n";
    })
    return str;
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
    log:function(str) { dump(str+"\n");},
    info:function(str) { dump(str+"\n");},
    warn:function(str) { dump(str+"\n");},
    error:function(str) { dump(str+"\n");},
    debug:function(str) { dump(str+"\n");},
    exception: function (e) {
        let [msg, stackRes] = getTraceException(e);
        let str = "An exception occurred" +(e.name ? " "+ e.name: "") +": " +
                  (e.message ? e.message : e.toString()) + "\n" +
                  (e.fileName ? "\t"+e.fileName + " " + e.lineNumber + "\n" : "");
        str += "\n"+formatTrace(stackRes);
        dump(str);
    },
    trace:function() {
        let frame = Components.stack.caller
        let stack = [];
        while (frame) {
          if (frame.filename) {
            stack.unshift({
              "sourceURL": frame.filename,
              "line": frame.lineNumber,
              "function": frame.name
            });
          }
          frame = frame.caller;
        }
        dump("Trace:\n");
        dump(formatTrace(stack)+"\n");
    },
    dir: function dir() {},
    group: function group() {},
    groupCollapsed: function groupCollapsed() {},
    groupEnd: function groupEnd() {},
    time: function time() {},
    timeEnd: function timeEnd() {}
}
