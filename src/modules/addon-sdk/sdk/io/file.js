/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

module.metadata = {
  "stability": "experimental"
};

const {Cc,Ci,Cr,Cu} = require("chrome");
const byteStreams = require("./byte-streams");
const textStreams = require("./text-streams");

// Flags passed when opening a file.  See nsprpub/pr/include/prio.h.
const OPEN_FLAGS = {
  RDONLY: parseInt("0x01"),
  WRONLY: parseInt("0x02"),
  CREATE_FILE: parseInt("0x08"),
  APPEND: parseInt("0x10"),
  TRUNCATE: parseInt("0x20"),
  EXCL: parseInt("0x80")
};

Cu.import('resource://slimerjs/slUtils.jsm');

var _separator = '/';
var isWin = false;

if (slUtils.workingDirectory instanceof Ci.nsILocalFileWin) {
  _separator = '\\';
  isWin = true;
}


function MozFile(path) {
  return slUtils.getAbsMozFile(path, slUtils.workingDirectory);
}

// in the file system specification, it is a method
// but in phantomjs, it is a property. And we want to be compatible with
// phantomjs
Object.defineProperty(exports, "workingDirectory", {
    get: function() { return slUtils.workingDirectory.path; }
});

exports.changeWorkingDirectory = function changeWorkingDirectory(path) {
    slUtils.workingDirectory = MozFile(path);
}

function ensureReadable(file) {
  if (!file.isReadable())
    throw new Error("path is not readable: " + file.path);
}

function ensureDir(file) {
  ensureExists(file);
  if (!file.isDirectory())
    throw new Error("path is not a directory: " + file.path);
}

function ensureFile(file) {
  ensureExists(file);
  if (file.isSpecial())
    return;
  if (!file.isFile())
    throw new Error("path is not a file: " + file.path);
}

function ensureExists(file) {
  if (!file.exists())
    throw friendlyError(Cr.NS_ERROR_FILE_NOT_FOUND, file.path);
}

function friendlyError(errOrResult, filename) {
  var isResult = typeof(errOrResult) === "number";
  var result = isResult ? errOrResult : errOrResult.result;
  switch (result) {
  case Cr.NS_ERROR_FILE_NOT_FOUND:
    return new Error("path does not exist: " + filename);
  }
  return isResult ? new Error("XPCOM error code: " + errOrResult) : errOrResult;
}

function readOpts(modeOrOpts) {
  if (typeof(modeOrOpts) == 'string') {
    return { mode : modeOrOpts, charset:null, nobuffer:false}
  }
  else if (typeof(modeOrOpts) == 'object') {
    if (!('mode' in modeOrOpts)) {
      modeOrOpts.mode = '';
    }
    else if (typeof(modeOrOpts.mode) != 'string') {
      modeOrOpts.mode = '';
    }
    if (!('charset' in modeOrOpts)) {
      modeOrOpts.charset = null;
    }
    else if (typeof(modeOrOpts.charset) != 'string' || modeOrOpts.charset == '') {
      modeOrOpts.charset = null;
    }
    if (!('nobuffer' in modeOrOpts)) {
      modeOrOpts.nobuffer = false;
    }
    return modeOrOpts;
  }
  return { mode : '', charset:null, nobuffer:false}
}

exports.exists = function exists(filename) {
  if (!filename)
    return false;
  return MozFile(filename).exists();
};

exports.isFile = function isFile(filename) {
  if (!filename)
    return false;
  let file = MozFile(filename);
  if (!file.exists()) {
    return false;
  }
  return file.isFile();
};

exports.isDirectory = function isDirectory(filename) {
  if (!filename)
    return false;
  let file = MozFile(filename);
  if (!file.exists()) {
    return false;
  }
  return file.isDirectory();
};

exports.isReadable = function isReadable(filename) {
  if (!filename)
    return false;
  let file = MozFile(filename);
  if (!file.exists()) {
    return false;
  }
  return file.isReadable();
}

exports.isWritable = function isWritable(filename) {
  if (!filename)
    return false;
  let file = MozFile(filename);
  if (!file.exists()) {
    return false;
  }
  return file.isWritable();
}

exports.isLink = function isLink(filename) {
  if (!filename)
    return false;
  let file = MozFile(filename);
  if (!file.exists()) {
    return false;
  }
  return file.isSymLink();
}

exports.size = function size(filename) {
  if (!filename)
    return 0;
  return MozFile(filename).fileSize;
}

exports.lastModified = function lastModified(filename) {
  if (!filename)
    return null;
  return new Date(MozFile(filename).lastModifiedTime);
}

exports.read = function read(filename, mode) {
  let opts = readOpts(mode);

  // Ensure mode is read-only.
  opts.mode = /b/.test(opts.mode) ? "b" : "";

  var stream = exports.open(filename, opts);
  try {
    var str = stream.read();
  }
  finally {
    stream.close();
  }

  return str;
};

exports.write = function write(filename, content, mode) {
  let opts = readOpts(mode);
  mode = opts.mode;

  var hasA = /a/.test(mode)
  var hasX = /x/.test(mode)
  // Ensure mode is write-only.
  mode = /b/.test(mode) ? "wb" : "w";
  if (hasA)
    mode += "a";
  if (hasX)
    mode += "x";

  opts.mode = mode;
  var stream = exports.open(filename, opts);
  try {
    stream.write(content);
    stream.flush();
  }
  finally {
    stream.close();
  }
};

Object.defineProperty(exports, "separator", {
  enumerable: true,
  configurable: false,
  writable: false,
  value: _separator
});

exports.join = function join(base) {
  if (arguments.length < 2)
    throw new Error("join() needs at least 2 args");
  base = MozFile(base);
  for (var i = 1; i < arguments.length; i++)
    base.append(arguments[i]);
  return base.path;
};

exports.split = function split(path) {
    var f;
    if (isWin)
        // normalize path with / and replace redondant separator by a single separator
        f = path.replace(/\\+/g,"/");
    else
        // replace redondant separators by a single separator
        f = path.replace(/\/+/g,"/");

    return f.replace(/\/$/, "").split("/")
}

exports.directory = function directory(path) {
  if (!path) {
    return '';
  }
  return path.toString()
            .replace(/\\/g, '/') // replace \ by /
            .replace(/\/$/, "")  // remove trailing slash
            .replace(/\/[^\/]*$/, ''); // remove last path component
};

// @deprecated
exports.dirname = function dirname(path) {
  if (!path) {
    return '';
  }
  var p = path.toString().replace(/\\/g, '/') // replace \ by /
  if (p.endsWith('/')) {
    return p.replace(/\/$/, "")  // remove trailing slash
  }
  return p.replace(/\/[^\/]*$/, ''); // remove last path component
};

exports.base = function base(path) {
  var leafName = MozFile(path).leafName;

  // On Windows, leafName when the path is a volume letter and colon ("c:") is
  // the path itself.  But such a path has no basename, so we want the empty
  // string.
  return leafName == path ? "" : leafName;
};

// @deprecated
exports.basename = function basename(path) {
    return exports.base(path);
};

exports.absolute = function base(path) {
    var mzf = MozFile(path).path;
    var f = exports.split(mzf);
    var p = [];
    f.forEach(function(element){
        if (element == '.')
            return;
        if (element == '..') {
            p.pop();
            return
        }
        p.push(element);
    })
    if (!p.length)
        return '';
    if (_separator != '\\')
      p[0] = _separator+p[0];
    if (p.length > 1) {
      var ret = exports.join.apply(exports, p);
      return ret;
    }
    return p[0];
}

exports.extension = function extension(path, withoutdot) {
  var m = path.match(/\.([^\.]+)$/);
  if (m) {
    return (withoutdot?m[1]:'.'+m[1]);
  }
  return '';
};

exports.list = function list(path) {
  var file = MozFile(path);
  ensureDir(file);
  ensureReadable(file);

  var entries = file.directoryEntries;
  var entryNames = [];
  while(entries.hasMoreElements()) {
    var entry = entries.getNext();
    entry.QueryInterface(Ci.nsIFile);
    entryNames.push(entry.leafName);
  }
  return entryNames;
};

exports.open = function open(filename, mode) {
  var file = MozFile(filename);
  let opts = readOpts(mode);
  mode = opts.mode;

  // File opened for write only.
  if (/(w|a)/.test(mode)) {
    if (/x/.test(mode) && !file.exists()) {
        throw new friendlyError(Cr.NS_ERROR_FILE_NOT_FOUND, filename);
    }
    if (file.exists()) {
      ensureFile(file);
    }
    var stream = Cc['@mozilla.org/network/file-output-stream;1'].
                 createInstance(Ci.nsIFileOutputStream);
    var openFlags = OPEN_FLAGS.WRONLY |
                    OPEN_FLAGS.CREATE_FILE;
    if (/a/.test(mode))
        openFlags |= OPEN_FLAGS.APPEND;
    else
        openFlags |= OPEN_FLAGS.TRUNCATE;

    var permFlags = parseInt("0644", 8); // u+rw go+r
    try {
      stream.init(file, openFlags, permFlags, 0);
    }
    catch (err) {
      throw friendlyError(err, filename);
    }
    return /b/.test(mode) ?
           new byteStreams.ByteWriter(stream, opts.nobuffer) :
           new textStreams.TextWriter(stream, opts.charset, opts.nobuffer);
  }

  // File opened for read only, the default.
  ensureFile(file);
  stream = Cc['@mozilla.org/network/file-input-stream;1'].
           createInstance(Ci.nsIFileInputStream);
  try {
    stream.init(file, OPEN_FLAGS.RDONLY, 0, 0);
  }
  catch (err) {
    throw friendlyError(err, filename);
  }
  return /b/.test(mode) ?
         new byteStreams.ByteReader(stream) :
         new textStreams.TextReader(stream, opts.charset);
};

exports.remove = function remove(path) {
  var file = MozFile(path);
  ensureFile(file);
  file.remove(false);
};

exports.makeDirectory = function makeDirectory(path) {
  var file = MozFile(path);
  if (!file.exists()){
    // if the parent directory does not exists, an exception should be thrown
    if (file.parent && !file.parent.exists())
        throw new Error("The parent directory does not exist");
    file.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("0755", 8)); // u+rwx go+rx
  }
  else if (!file.isDirectory())
    throw new Error("The path already exists and is not a directory: " + path);
}

exports.makeTree = function makeTree(path) {
  var file = MozFile(path);
  if (!file.exists())
    file.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("0755", 8)); // u+rwx go+rx
  else if (!file.isDirectory())
    throw new Error("The path already exists and is not a directory: " + path);
}

/**
 * @deprecated
 */
exports.mkpath = function mkpath(path) {
    return exports.makeTree(path);
};

exports.removeDirectory = function removeDirectory(path) {
  var file = MozFile(path);
  ensureDir(file);
  try {
    file.remove(false);
  }
  catch (err) {
    // Bug 566950 explains why we're not catching a specific exception here.
    throw new Error("The directory is not empty: " + path);
  }
};

exports.removeTree = function removeTree(path) {
  var file = MozFile(path);
  try {
    file.remove(true);
  }
  catch (err) {
    // Bug 566950 explains why we're not catching a specific exception here.
    throw new Error("The directory is not empty: " + path);
  }
};

/**
 * @deprecated
 */
exports.rmdir = function rmdir(path) {
    exports.removeDirectory(path);
};

exports.copy = function copy(sourceFileName, targetFileName) {
  var sourceFile = MozFile(sourceFileName);
  var targetFile = MozFile(targetFileName);
  ensureFile(sourceFile);
  sourceFile.copyTo(targetFile.parent, targetFile.leafName);
};


function copyDir(sourceDir, targetDir) {
    if (!targetDir.exists()) {
        targetDir.create(Ci.nsIFile.DIRECTORY_TYPE, parseInt("0755", 8));
    }
    let enumDir = sourceDir.directoryEntries;
    while(enumDir.hasMoreElements()) {
        let file = enumDir.getNext().QueryInterface(Ci.nsIFile);
        if (file.isFile()) {
            file.copyTo(targetDir, file.leafName);
        }
        else if (file.isDirectory()) {
            let newDir = targetDir.clone();
            newDir.append(file.leafName);
            copyDir(file, newDir);
        }
    }
}

exports.copyTree = function copyTree(sourceDirName, targetDirName) {
  var sourceDir = MozFile(sourceDirName);
  var targetDir = MozFile(targetDirName);
  ensureDir(sourceDir);
  if (targetDir.exists())
    throw new Error("The target directory does exist: " + targetDirName);

  copyDir(sourceDir, targetDir);
};


exports.rename = function rename(path, name) {
  var sourceFile = MozFile(path);
  ensureFile(sourceFile);
  sourceFile.moveTo(sourceFile.parent, name);
}

exports.move = function move(sourceFileName, targetFileName) {
  var sourceFile = MozFile(sourceFileName);
  var targetFile = MozFile(targetFileName);
  ensureFile(sourceFile);
  sourceFile.moveTo(targetFile.parent, targetFile.leafName);
}

exports.touch = function touch(path, date) {
  var file = MozFile(path);
  var d;
  if (date)
    d = new Date(date);
  else
    d = new Date();

  if (file.exists()) {
    file.lastModifiedTime = d.getTime();
  }
  else {
    file.create(file.NORMAL_FILE_TYPE, parseInt('644', 8));
    if (date)
      file.lastModifiedTime = d.getTime();
  }
}

exports.readLink = function readLink(path) {
    var file =  MozFile(path);
    if (!file.exists()) {
        throw new Error("File does not exists");
    }
    if (!file.isSymLink()) {
        throw new Error("The given path is not a symbolic link");
    }
    return file.target;
}

/*
no way in Gecko to create symbolic links.
So we don't define symbolicLink and hardLink,
as indicated in the FileSystem/A/0 specification

exports.symbolicLink = function symbolicLink(source, target) {
}
exports.hardLink = function symbolicLink(source, target) {
}
*/


/**
 * not defined in the CommonJS specification
 */

exports.isAbsolute = function isAbsolute(path) {
  if (path == "")
    return false;

  if (isWin) {
    return (/^([a-z]:\\)/i.test(path.replace(/\//g, "\\")));
  }
  else {
    return (/^\//i.test(path));
  }
}

exports.isExecutable = function isExecutable(path) {
    if (path == "")
      return false;
    var file =  MozFile(path);
    if (!file.exists()) {
        throw new Error("File does not exists");
    }
    return (file.permissions & 0x49) > 0
}
