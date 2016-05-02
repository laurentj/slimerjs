/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var EXPORTED_SYMBOLS = ["slExit"];
const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import("resource://gre/modules/Services.jsm");

var callbacks = new Set();

function writeExitStatus (status) {
    var envService = Cc["@mozilla.org/process/environment;1"]
                      .getService(Ci.nsIEnvironment);
    if (!envService.exists('__SLIMER_EXITCODEFILE')) {
        return;
    }
    let filePath = envService.get('__SLIMER_EXITCODEFILE');
    let file = Cc['@mozilla.org/file/local;1']
                .createInstance(Ci.nsILocalFile);
    file.initWithPath(filePath);

    let str = String(status);
    let foStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
    foStream.init(file, (0x02 | 0x08 | 0x20), parseInt("0444", 8), 0);
    try {
        foStream.write(str, str.length);
    }
    finally {
        foStream.close();
    }
} 


var slExit = {
    addCallback : function(clb) {
        callbacks.add(clb);
    },
    removeCallback : function(clb) {
        if (callbacks.has(clb)) {
            callbacks.delete(clb);
        }
    },

    exit : function(code) {
        if (this.slimerExiting) {
            return
        }
        let c = +code || 0;
        writeExitStatus(c);
        this.slimerExiting = true;
        for (let clb of callbacks) {
            if (typeof (clb) == 'function') {
                clb(c);
            }
        }
        Services.startup.quit(Ci.nsIAppStartup.eForceQuit);
    },

    /**
     * boolean to indicate if SlimerJS is in a closing process. Set by slimer.exit() and phantom.exit()
     */
    slimerExiting : false
}