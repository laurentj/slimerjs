/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

module.metadata = {
  "stability": "experimental"
};

const {Cc,Ci,Cr} = require("chrome");
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

var dirsvc = Cc["@mozilla.org/file/directory_service;1"]
             .getService(Ci.nsIProperties);

var currentWorkingDirectory = dirsvc.get("CurWorkD", Ci.nsIFile);

function MozFile(path) {
  var file = currentWorkingDirectory.clone();
  try {
    // if path is a relative path, there won't have exception
    file.appendRelativePath(path);
    return file;
  }
  catch(e) { }
  // the given path is really an absolute path
  file = Cc['@mozilla.org/file/local;1']
            .createInstance(Ci.nsILocalFile);
  file.initWithPath(path);
  return file;
}

exports.workingDirectory = function workingDirectory() {
    return currentWorkingDirectory.path;
}

exports.changeWorkingDirectory = function changeWorkingDirectory(path) {
    currentWorkingDirectory = MozFile(path);
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

exports.exists = function exists(filename) {
  return MozFile(filename).exists();
};

exports.isFile = function isFile(filename) {
  return MozFile(filename).isFile();
};

exports.isDirectory = function isDirectory(filename) {
  return MozFile(filename).isDirectory();
};

exports.isReadable = function isReadable(filename) {
    return MozFile(filename).isReadable();
}

exports.isWritable = function isWritable(filename) {
    return MozFile(filename).isWritable();
}

exports.isLink = function isLink(filename) {
    return MozFile(filename).isSymLink();
}

exports.size = function size(filename) {
    return MozFile(filename).fileSize();
}

exports.lastModified = function lastModified(filename) {
    return new Date(MozFile(filename).lastModifiedTime);
}

exports.read = function read(filename, mode) {
  if (typeof(mode) !== "string")
    mode = "";

  // Ensure mode is read-only.
  mode = /b/.test(mode) ? "b" : "";

  var stream = exports.open(filename, mode);
  try {
    var str = stream.read();
  }
  finally {
    stream.close();
  }

  return str;
};

exports.write = function write(filename, content, mode) {
  if (typeof(mode) !== "string")
    mode = "w";

  // Ensure mode is write-only.
  mode = /b/.test(mode) ? "wb" : "w";

  var stream = exports.open(filename, mode);
  try {
    stream.write(content);
    stream.flush();
  }
  finally {
    stream.close();
  }
};

exports.join = function join(base) {
  if (arguments.length < 2)
    throw new Error("need at least 2 args");
  base = MozFile(base);
  for (var i = 1; i < arguments.length; i++)
    base.append(arguments[i]);
  return base.path;
};

exports.directory = function directory(path) {
  var parent = MozFile(path).parent;
  return parent ? parent.path : "";
};

// @deprecated
exports.dirname = function dirname(path) {
    return exports.directory(path);
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

exports.extension = function extension(path) {
  var leafName = exports.base(path);
  var m = leafName.match(/\.([^\.]+)$/);
  if (m)
    return m[1];
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
  if (typeof(mode) !== "string")
    mode = "";

  // File opened for write only.
  if (/w/.test(mode)) {
    if (file.exists())
      ensureFile(file);
    var stream = Cc['@mozilla.org/network/file-output-stream;1'].
                 createInstance(Ci.nsIFileOutputStream);
    var openFlags = OPEN_FLAGS.WRONLY |
                    OPEN_FLAGS.CREATE_FILE |
                    OPEN_FLAGS.TRUNCATE;
    var permFlags = parseInt("0644", 8); // u+rw go+r
    try {
      stream.init(file, openFlags, permFlags, 0);
    }
    catch (err) {
      throw friendlyError(err, filename);
    }
    return /b/.test(mode) ?
           new byteStreams.ByteWriter(stream) :
           new textStreams.TextWriter(stream);
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
         new textStreams.TextReader(stream);
};

exports.remove = function remove(path) {
  var file = MozFile(path);
  ensureFile(file);
  file.remove(false);
};

exports.makeDirectory = function makeDirectory(path) {
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
    return exports.makeDirectory(path);
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

exports.touch = function move(path, date) {
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
