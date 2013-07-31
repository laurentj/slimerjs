/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";
var EXPORTED_SYMBOLS = ["dumpex", "dumpStack", "dumpo", "getMozFile",
                        "getAbsMozFile", "readSyncStringFromFile", "readChromeFile",
                        "getWebpageFromContentWindow", "getWebpageFromDocShell",
                        "getBrowserFromContentWindow", "getBrowserFromDocShell",
                        "createSimpleEnumerator", "slUtils"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;
const ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
const scriptableStream = Cc["@mozilla.org/scriptableinputstream;1"].getService(Ci.nsIScriptableInputStream);

Cu.import("resource://gre/modules/Services.jsm");

const isWin = (Services.dirsvc.get("CurWorkD", Ci.nsIFile) instanceof Ci.nsILocalFileWin);


function dumpo(obj, indent) {
    if (typeof obj != 'object') {
        dump(""+obj+"\n")
        return
    }
    let i = indent || "";
    dump(i+"{\n");
    for(let p in obj) {
        dump(p+": ");
        dumpo(obj[p], i+"   ")
        dump(",\n")
    }
    dump(i+"}\n")
}

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
 * create an nsIFile object containing the given path. If the path
 * is a relative path, the nsIFile object will contain the path resolved against
 * the given base path.
 * @param string path
 * @param nsIFile basepath
 * @return nsIFile
 */
function getAbsMozFile(path, basepath) {
    var file = basepath.clone();
    var pathElements = path.split(/[\\\/]/);
    var first = pathElements[0];
    if (pathElements.length == 1) {
        if (first)
            file.append(first);
        return file;
    }

    if ( (isWin && first.match(/\:$/)) || (!isWin && first == '')) {
        // this is an absolute path
        file = Cc['@mozilla.org/file/local;1']
                  .createInstance(Ci.nsILocalFile);
        if (isWin) {
            file.initWithPath(path.replace(/\//g, "\\"));
        }
        else
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

/**
 * create an nsIFile object containing the given path.
 * @param string path  an absolute path
 * @return nsIFile
 */
function getMozFile(path) {
    let isAbs;
    if (isWin) {
        path = path.replace(/\//g, "\\");
        isAbs = (/^([a-z]:)/i.test(path));
    }
    else {
        isAbs = (/^\//i.test(path));
    }

    if (!isAbs) {
        throw new Error("getMozFile - the path is not an absolute path: "+path);
    }

    let file = Cc['@mozilla.org/file/local;1']
              .createInstance(Ci.nsILocalFile);
    file.initWithPath(path);
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

function readChromeFile(url) {
    let channel = ioService.newChannel(url,null,null);
    let input = channel.open();

    scriptableStream.init(input);
    let str = scriptableStream.read(input.available());
    scriptableStream.close();
    input.close();
    return str;
}

function getWebpageFromContentWindow(contentWin) {
    let browser = getBrowserFromContentWindow(contentWin);
    if (browser)
        return browser.webpage;
    return null;
}

function getBrowserFromContentWindow(contentWin) {
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
        return getBrowserFromDocShell(docShell);
    }
    catch(e) {
        return null;
    }
}

function getWebpageFromDocShell(docShell) {
    let browser = getBrowserFromDocShell(docShell)
    if (browser)
        return browser.webpage;
    return null;
}

function getBrowserFromDocShell(docShell) {
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
        return browser;
    }
    catch(e) {
        return null;
    }
}


function nsSimpleEnumerator(items) {
  this._items = items;
  this._nextIndex = 0;
}
nsSimpleEnumerator.prototype = {
  hasMoreElements: function() {
    return this._nextIndex < this._items.length;
  },
  getNext: function() {
    if (!this.hasMoreElements())
      throw Cr.NS_ERROR_NOT_AVAILABLE;

    return this._items[this._nextIndex++];
  },
  QueryInterface: function(aIID) {
    if (Ci.nsISimpleEnumerator.equals(aIID) ||
        Ci.nsISupports.equals(aIID))
      return this;

    throw Cr.NS_ERROR_NO_INTERFACE;
  }
};

var slUtils = {
    sleep: function(time, wakeupFunc) {
        let ready = false;
        let timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
        timer.initWithCallback(function(){ready = true;}, time, timer.TYPE_ONE_SHOT);
        let thread = Services.tm.currentThread;
        let wakeup = false;
        while (!ready && !wakeup) {
            thread.processNextEvent(true);
            if (wakeupFunc)
                wakeup = wakeupFunc();
        }
    },

    createSimpleEnumerator: function(anArray) {
        return new nsSimpleEnumerator(anArray);
    }
}
