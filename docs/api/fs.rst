
==
fs
==

Documentation not complete. Please help us to fill this page :-)

This module implements `the file system API specified in CommonJS <http://wiki.commonjs.org/wiki/Filesystem>`_.

This module is mostly copied from the `Mozilla Add-on SDK's io/file module. 
<https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/io_file>`_ 
its documentation may be useful.

.. _fs-changeWorkingDirectory:

changeWorkingDirectory(path)
----------------------------

It changes the working directory. But only in the SlimerJS "process". When
SlimerJS is terminated, the real working directory is the same when SlimerJS started.

.. _fs-workingDirectory:

workingDirectory
-------------------

This property contains the current working directory.
It cannot be set. Use changeWorkingDirectory.

Note: in CommonJS, it is defined as a method, but in phantomjs, it is a property.
So this is a property to be compatible with phantomjs.


.. _fs-exists:

exists(path)
-------------------

true if the file or directory exists. Otherwise it returns false.

.. _fs-isFile:

isFile(path)
-------------------

true if this object corresponds to a normal file. Otherwise it returns false.

.. _fs-isDirectory:

isDirectory(path)
-------------------

true if this object corresponds to a directory. Otherwise it returns false.

.. _fs-isReadable:

isReadable(path)
-------------------

This method tests whether or not this object corresponds to a file or directory that may be read by the user.

.. _fs-isWritable:

isWritable(path)
-------------------

true if the file or directory may be modified by the user. Otherwise it returns false.

.. _fs-isLink:

isLink(path)
-------------------

This method tests whether or not this object corresponds to a symbolic link, shortcut, or alias.

.. _fs-size:

size(path)
-------------------

returns the number of bytes corresponding to the data represented by the file.

.. _fs-lastModified:

lastModified(path)
-------------------

returns a Date object of the last modified time of the file.

.. _fs-read:

read(path, mode)
-------------------

Shorthand for open(path,mode).read(). Stream is closed after reading.

.. _fs-write:

write(path, content, mode)
---------------------------

Shorthand for open(path,mode).write(content). Stream is closed after writing.

.. _fs-separator:

separator
-------------------

A valid path component separator. May be hard-coded to '/'.

.. _fs-join:

join(basepath, dirname, ... ,filename)
---------------------------------------

Takes a variable number of strings, joins them on the file system's path separator, and returns the result.

.. _fs-split:

split(path)
-------------------

Returns an array of path components from a path.

.. _fs-directory:

directory(path)
-------------------

Returns path with the last path component removed.

Not implemented in PhantomJS <=2.1 at least.

.. _fs-dirname:

dirname(path)
-------------------

Deprecated, use directory() instead. Not implemented in PhantomJS

.. _fs-base:

base(path)
-------------------

Returns the final component of a path. Not implemented in PhantomJS <=2.1 at least.

.. _fs-basename:

basename(path)
-------------------

Deprecated, use base() instead.
Not implemented in PhantomJS.

.. _fs-absolute:

absolute(path)
-------------------

Returns the absolute path of a given path, resolving any components 
"." or ".." and replacing multiple separators with single separators.  
Does not resolve Unix symbolic links.

.. _fs-extension:

extension(path, withoutdot)
----------------------------

It returns a dot following by the part of the path after the last dot.

The method accept a non standard second parameters, a boolean indicating
if you want the extension without the dot character (true) or not.

.. code-block:: javascript

    fs.extension("file.txt"); // returns ".txt"
    fs.extension("file.txt", true); // returns "txt"


.. container:: warning

    In SlimerJS 0.9.6 and lower, this method return always the extension without
    the dot, which is not the result as expected by the CommonJS Filesystem
    specification.


Not implemented in PhantomJS <=2.1 at least.

.. _fs-list:

list(path)
-------------------

Returns an array of file names in the given directory.

.. _fs-open:

open(filename, opts)
---------------------

Returns a stream providing access to the contents of a file.

``opts`` is optional. It can be a single string, indicating the open mode,
or an object containing these properties:

- ``mode``: the open mode
- ``charset``: the charset code (IANA code). Charset is ignored if the mode is binary mode
- ``nobuffer``: if true, for mode="w", there will be a flush each time you call
   the ``write`` method of the stream (SlimerJS only).

Mode is a string that can contain character which describes a characteristic of the returned stream.

* If the string contains "r", the file is opened in read-only mode.
* "w" opens the file in write-only mode.
* "b" opens the file in binary mode. If "b" is not present, the file is
    opened in text mode, and its contents are assumed to be UTF-8.
* "a" means to open as "append" mode: the file is open in write-only mode and
  all written character are append to the file


.. _fs-remove:

remove(path)
-------------------

Removes a file from the file system. To remove directories, use rmdir.

.. _fs-makeDirectory:

makeDirectory(path)
--------------------

Create a single directory specified by path. If the directory cannot be 
created for any reason an exception will be thrown. This includes if the 
parent directories of "path" are not present. 

.. _fs-makeTree:

makeTree(path)
--------------------

Documentation needed


.. _fs-mkpath:

mkpath(path)
-------------------

Deprecated. Use makeDirectory(path). Not implemented in PhantomJS.

.. _fs-removeDirectory:

removeDirectory(path)
----------------------

Removes a directory from the file system. If the directory is not empty, an exception is thrown.

.. _fs-removeTree:

removeTree(path)
-------------------

Removes a directory and its contents recursively.

.. _fs-rmdir:

rmdir(path)
-------------------

Deprecated. Use removeDirectory.

Not implemented in PhantomJS.

.. _fs-copy:

copy(source, target)
---------------------

Documentation needed


.. _fs-copyTree:

copyTree(source, target)
------------------------

Documentation needed


.. _fs-rename:

rename(path, newname)
---------------------

Documentation needed.

Not implemented in PhantomJS <=2.1 at least.


.. _fs-move:

move(source, target)
---------------------

Documentation needed


.. _fs-touch:

touch(path, date)
-------------------

Documentation needed


.. _fs-readLink:

readLink(path)
-------------------

Documentation needed


.. _fs-isAbsolute:

isAbsolute(path)
-------------------

Documentation needed.

Not defined in the CommonJS specification.


.. _fs-isExecutable:

isExecutable(path)
-------------------

Documentation needed.


Not defined in the CommonJS specification.
