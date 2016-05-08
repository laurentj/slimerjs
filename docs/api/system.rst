
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
- ``system.os.isWindows()``: a function returning a boolean indicating if it is windows (SlimerJS only)

.. _system-pid:

pid
-----------------------------------------

Contains the id of the Gecko system process.

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


.. _system-standarderr:

standarderr
-----------------------------------------

Same as ``stderr``.

.. _system-standardin:

standardin
-----------------------------------------

Same as ``stdin``.

.. _system-standardout:

standardout
-----------------------------------------

Same as ``stdout``.

.. _system-stdout:

stdout
-----------------------------------------

The standard output stream.
This is an object with the same API as a file (/dev/stdout on MacOs and Linux)
opened with the mode "w" with encoding set by ``phantom.outputEncoding``
(UTF-8 by default) or ``--output-encoding``.

- ``system.stdout.write('something')``

You can output binary content (for chained commands for example).


.. code-block:: javascript

    // myscript.js
    
    phantom.outputEncoding = 'binary';
    
    var page = require('webpage').create();
    page.viewportSize = { width:600, height:800 };
    page.open(url, function(success) {
        if (success == "success") {
            let bytes = page.renderBytes({format:'png'})
            if (bytes) {
                system.stdout.write(bytes);
                phantom.exit(0);
            }
        }
        phantom.exit(1);
    })

And on the command line:

.. code-block:: bash

    slimerjs myscripts.js > image.png
    slimerjs myscripts.js | convert - test.jpg


Note: binary output is not really supported on Windows.

.. _system-stderr:

stderr
-----------------------------------------

The standard error stream. Same behavior of stdout but on /dev/stderr.

On windows, it is the output stream.

- ``system.stderr.write('something')``


.. _system-stdin:

stdin
-----------------------------------------

The standard input stream. This is an object with the same API as a file
opened with the mode "rb" with no encoding.

It is not available on Windows.

``var input = system.stdin.read()``

