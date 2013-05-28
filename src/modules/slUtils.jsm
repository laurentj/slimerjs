/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";
var EXPORTED_SYMBOLS = ["dumpex", "dumpStack", "getMozFile", "readSyncStringFromFile",
                        "getWebpageFromContentWindow", "getWebpageFromDocShell"];

const Cc = Components.classes;
const Ci = Components.interfaces;

function dumpex(ex, msg) {
    if (msg)
        dump (msg);
    if ( (typeof ex) == 'object') {
        dump('[Exception] '+ex);
        if ('fileName' in ex) {
            dump ('  filename:'+ex.fileName);
        }
        if ('lineNumber' in ex) {
            dump ('  line:'+ex.lineNumber);
        }
        dump('\n');
    }
    else {
        dump('[Exception] '+ex+'\n');
    }
}

function dumpStack(aStack) {
    let stackText = "\nStack trace:\n";
    let count = 0;
    let stack = aStack || Components.stack.caller;
    while(stack) {
        stackText += count++ + ":" + stack +"\n";
        stack = stack.caller;
    }
    dump(stackText);
}

/**
 * @param string path
 * @param nsIFile basepath
 */
function getMozFile(path, basepath) {
    var file = basepath.clone();
    var pathElements = path.split(/[\\\/]/);
    var first = pathElements[0];
    if (pathElements.length == 1) {
        if (first)
            file.append(first);
        return file;
    }

    if (first.match(/\:$/) || first == '') {
        file = Cc['@mozilla.org/file/local;1']
                  .createInstance(Ci.nsILocalFile);
        file.initWithPath(path);
        return file;
    }
    while(pathElements.length) {
        first = pathElements.shift();
        if (first == '.' || first == '')
            continue;
        if (first == '..') {
            if (file.parent)
                file = file.parent;
            continue;
        }
        file.append(first);
    }
    return file;
}


function readSyncStringFromFile (file) {
    let fstream = Cc["@mozilla.org/network/file-input-stream;1"].
                   createInstance(Ci.nsIFileInputStream);
    let cstream = Cc["@mozilla.org/intl/converter-input-stream;1"].
                  createInstance(Ci.nsIConverterInputStream);
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


function getWebpageFromContentWindow(contentWin) {
    try {
        /*
        let win = contentWin.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                        .getInterface(Components.interfaces.nsIWebNavigation)
                        .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                        .rootTreeItem
                        .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                        .getInterface(Components.interfaces.nsIDOMWindow);

        */
        var docShell = contentWin.top.QueryInterface(Ci.nsIInterfaceRequestor)
                         .getInterface(Ci.nsIWebNavigation)
                         .QueryInterface(Ci.nsIDocShell);
        return getWebpageFromDocShell(docShell);
    }
    catch(e) {
        return null;
    }
}

function getWebpageFromDocShell(docShell) {
    try {
        var browser= docShell.chromeEventHandler;
        if (!browser) {
            return null;
        }
        if (browser.getAttribute('id') != 'webpage') {
            return null;
        }

        if (browser.ownerDocument.documentElement.getAttribute("windowtype") != 'slimerpage') {
            return null;
        }
        return browser.webpage;
    }
    catch(e) {
        return null;
    }
}
