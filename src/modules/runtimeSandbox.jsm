/*!
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
"use strict";
var EXPORTED_SYMBOLS = ["runtimeSandbox"];


Components.utils.import("resource://gre/modules/Services.jsm");

function runtimeSandbox(name, contentWindow) {
    this._contentWindow = contentWindow;
    this._sandbox = Components.utils.Sandbox(contentWindow,
                        {
                            'sandboxName': name,
                            'sandboxPrototype': contentWindow,
                            'wantXrays': true
                        });
    //Components.utils.import("resource://gre/modules/commonjs/loader.js"); // require

    // expose a console object that dump output into the shell console
    var c = {}
    Components.utils.import("resource://gre/modules/devtools/Console.jsm", c);
    // we need to indicate which properties the script can access
    c.console.__exposedProps__ = {
        debug:'r', log:'r', info:'r', warn:'r',
        error:'r', trace:'r', clear:'r',
        dir:'r', dirxml:'r', group:'r', groupEnd:'r'
    }
    this._sandbox.console = c.console;

    Components.utils.import('resource://slimerjs/slimer.jsm', this._sandbox);
}


runtimeSandbox.prototype = {

    /**
     * @param nsIFile scriptFile
     */
    execScriptFile : function (scriptFile) {
        let script = readSyncStringFromFile(scriptFile);
        return Components.utils.evalInSandbox(script, this._sandbox, "ECMAv5", scriptFile.path, 1);
    }
}




function readSyncStringFromFile (file) {
    let fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].
                   createInstance(Components.interfaces.nsIFileInputStream);
    let cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
                  createInstance(Components.interfaces.nsIConverterInputStream);
    fstream.init(file, -1, 0, 0);
    cstream.init(fstream, "UTF-8", 0, 0);
    let data = '';
    let (str = {}) {
      let read = 0;
      do {
        read = cstream.readString(0xffffffff, str); // read as much as we can and put it in str.value
        data += str.value;
      } while (read != 0);
    }
    cstream.close(); // this closes fstream
    return data;
}
