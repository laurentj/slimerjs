
=======
require
=======

``require()`` is the function to load a module. See :doc:`the manual </script-execution>` to know more about modules. 

You should indicate the name of a module (file name without the extension). The module
loader tries to load the module from the directory of the main script, and from directories
indicated into the ``paths`` properties.

For the module name, it can be a relative path to the current module or the full path of the module file.

The ``require()`` function has some properties:

require.paths
-------------

This is an array containing path of directories where to find modules.


.. code-block:: javascript
    
    require.paths.push('/home/laurent/my-modules');
    require.paths.push(fs.workingDirectory+'/modules');
    require.paths.push('../other-modules/');

Since 0.8.3: you can indicate a relative path as indicated in the CommonJS specification. The real
path is resolved only during the call of ``require()``, and against the path of the module that
do that call.

require.globals
---------------

``require.globals`` is an object on which you can set properties that will become
global variables in each loaded modules.

Example:

.. code-block:: javascript
    
    require.globals
            .thisIsMyGlobalFunction = function() {
                                        return 'hello'
                                    }

You can then call this function in an other module, like any native function

.. code-block:: javascript

    var result = thisIsMyGlobalFunction();

require.extensions
------------------

SlimerJS supports natively Javascript files, Coffee-Script files and JSON files, with the
require function.

If you want to support scripts written in an other language (that can be compiled into
javascript), you can then declare the extension of this type of script and the function
that will compile the file.

.. code-block:: javascript

    var fs = require('fs');
    require.extensions['.myext'] = function (module, filename) {
          // here load the file and compile it
          var fileContent = fs.read(filename);
          var jscontent = ....

          // then give the javascript content to module._compile
          module._compile(jscontent, filename);
    }

With this example, you can use require to load modules from files ``*.myext``.
