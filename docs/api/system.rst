
======
system
======

System is a module to retrieve some system informations.

.. code-block:: javascript

    var system = require('system')

.. _system-args:

args
-----------------------------------------

An array containing a list of arguments on the command line given to the script.
The first one (at index 0) is always the script name.

.. code-block:: javascript

    var numberOfArg = system.args.length;
    var thirdArgument = system.args[2];


.. _system-OS:

os
-----------------------------------------

An object having information about the operating system. Here are its properties:

- ``system.os.name``: the name of the operating system
- ``system.os.architecture``: its architecture : ``32bit``, ``64bit``...
- ``system.os.version``: its version
- ``system.os.isWindows``: boolean indicating if it is windows (SlimerJS only)

.. _system-pid:

pid
-----------------------------------------

Returns the process ID, if possible, otherwise returns ``0``. 
This should now work on Linux systems.

.. _system-platform:

platform
-----------------------------------------

Returns ``"slimerjs"``.

.. _system-env:

env
-----------------------------------------

An object containing values of all environment variable.


.. code-block:: javascript

   var myHome = system.env['HOME'];


.. _system-stdout:

stdout
-----------------------------------------

The standard output stream. This is an object with the same API as a file
opened with the mode "wb" with no encoding.

- ``system.stdout.write('something')``

.. _system-stderr:

stderr
-----------------------------------------

The standard error stream. This is an object with the same API as a file
opened with the mode "wb" with no encoding.

On windows, it is the output stream.

- ``system.stderr.write('something')``


.. _system-stdin:

stdin
-----------------------------------------

The standard input stream. This is an object with the same API as a file
opened with the mode "rb" with no encoding.

It is not available on Windows.

``var input = system.stdin.read()``

