
==
fs
==

Documentation not complete. Please help us to fill this page :-)

This module implements the file system API specified in CommonJS.

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
So this is a property ot be compatible with phantomjs.


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

Documentation needed

.. _fs-write:

write(path, content, mode)
---------------------------

Documentation needed

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

Documentation needed

.. _fs-directory:

directory(path)
-------------------

Documentation needed

.. _fs-dirname:

dirname(path)
-------------------

Documentation needed

deprecated.

.. _fs-base:

base(path)
-------------------

Documentation needed

.. _fs-basename:

basename(path)
-------------------

Documentation needed

Deprecated

.. _fs-absolute:

absolute(path)
-------------------

Documentation needed

.. _fs-extension:

extension(path)
-------------------

Documentation needed

.. _fs-list:

list(path)
-------------------

Returns an array of file names in the given directory.

.. _fs-open:

open(filename, mode)
---------------------

Returns a stream providing access to the contents of a file.

mode is an optional string, each character of which describes a characteristic of the returned stream.

 * If the string contains "r", the file is opened in read-only mode.
 * "w" opens the file in write-only mode.
 * "b" opens the file in binary mode. If "b" is not present, the file is
    opened in text mode, and its contents are assumed to be UTF-8.


.. _fs-remove:

remove(path)
-------------------

Removes a file from the file system. To remove directories, use rmdir.

.. _fs-makeDirectory:

makeDirectory(path)
--------------------

Documentation needed

.. _fs-mkpath:

mkpath(path)
-------------------

Documentation needed

Deprecated.

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

Documentation needed


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
