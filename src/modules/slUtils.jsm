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
var EXPORTED_SYMBOLS = ["dumpex", "dumpStack", "getMozFile", "readSyncStringFromFile"];



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
        file = Components.classes['@mozilla.org/file/local;1']
                  .createInstance(Components.interfaces.nsILocalFile);
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
