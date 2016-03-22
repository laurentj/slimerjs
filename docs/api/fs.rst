
==
fs
==

Documentation not complete. Please help us to fill this page :-)

This module implements the file system API specified in CommonJS.


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

Documentation needed

.. _fs-isFile:

isFile(path)
-------------------

Documentation needed

.. _fs-isDirectory:

isDirectory(path)
-------------------

Documentation needed

.. _fs-isReadable:

isReadable(path)
-------------------

Documentation needed

.. _fs-isWritable:

isWritable(path)
-------------------

Documentation needed

.. _fs-isLink:

isLink(path)
-------------------

Documentation needed

.. _fs-size:

size(path)
-------------------

Documentation needed

.. _fs-lastModified:

lastModified(path)
-------------------

Documentation needed

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

Documentation needed

.. _fs-join:

join(basepath, dirname, ... ,filename)
---------------------------------------

Documentation needed

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

Documentation needed

.. _fs-open:

open(filename, mode)
---------------------

Documentation needed

.. _fs-remove:

remove(path)
-------------------

Documentation needed

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

Documentation needed

.. _fs-removeTree:

removeTree(path)
-------------------

Documentation needed

.. _fs-rmdir:

rmdir(path)
-------------------

Documentation needed

Deprecated.

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
