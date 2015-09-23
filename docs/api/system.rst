
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

Always returns ``0`` (no Mozilla API to retrieve the PID)

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

- ``system.stdout.write('something')``
- ``system.stdout.writeLine('something')``
