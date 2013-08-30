.. index:: script, execution, javascript environment

============================
Script execution and modules
============================

The main script
===============

.. index:: CommonJS

The script you give to SlimerJS is a javascript script.

The script is considered by SlimerJS as a module. SlimerJS uses a modified version of
the module system of the Mozilla Addons SDK. It implements the
`CommonJS module specification version 1.1.1 <http://wiki.commonjs.org/wiki/Modules/1.1.1>`_

The script has access only to few objects in its context (see below). Modules
define other objects. Some are provided by SlimerJS, but you'll certainly provide
your owns modules.

So to execute something, to use some APIs, most of time you'll have to *import*
modules into your script, with ``require()``.

Another way to use objects of an other script, is to *inject*
it into your script.


Modules
=======

.. index:: module, require, require.paths

A module is a javascript file that defines functions to export and has an id.
The id of modules you provide and use, is the name of the module file in the
current working directory, without the '.js' extension.

Some internal module have a specific id. The script given to SlimerJS is the
module "main".

To define functions and variables to export, the module should store
these functions and variables into an ``exports`` object

.. code-block:: javascript
    
    exports.printHello = function(param) {
        console.log('hello '+param)
    }
    
    exports.aValue = 123
    
    exports.otherFunction = function() {  }

If the module is stored into a ``hello.js`` file in the same directory of the main script,
in the main script you can use the module like this:

.. code-block:: javascript
    
    // import functions into an object
    var hello = require('hello');
    
    // call the exported function
    hello.printHello('Bob');


By default, you can only load modules that are stored in the
directory of the main script (and in its sub-directories). The id you give to the
require function is always resolved from this directory, except if you indicate an
id starting with "./": it is resolved from the id of the current module.

If you want to load modules from other directories, you can indicate their path into the
array ``require.paths``

.. code-block:: javascript

    var path = fs.absolute(phantom.libraryPath + '/../vendor-modules/');
    require.paths.push(path);


Modules and main script context
===============================

.. index:: sandbox, context, phantom, slimer, console

Each module is executed in its own sandbox. It means that it cannot access to
variables or objects defined outside the module.

In fact, to mimmic PhantomJS, the main script is executed in the context
of a blank page (about:blank). So it has access to a ``window`` object and a
``document`` object. These objects are in fact injected into the module sandbox.
And these objects are shared with other modules.

In their sandbox, modules and the main script have access to other native objects
and functions:

- ``require()`` to import modules
- ``module``, an object that have information about the module itself
- ``phantom`` which is an object similar to the object ``phantom`` you have in PhantomJS.
- ``slimer`` which is an object that provides some "utils" functions

Warning: unlike PhantomJS, these functions and objects are not properties of
the window object.

Of course, you have access to other Javascript native objects like ``Date``, ``RegExp``,
``Math``, ``console``...

Injecting scripts
=================

.. index:: include, injectJs

If you want to *include* a script (that is not a module), into a module,
you have to use ``phantom.injectJs(aFileName)``. Remember, the main script is considered as a module.

The indicated path should be relative to the main script directory, or it can be
an absolute path of course. You can change the default directory by setting the
path of the new directory to ``phantom.libraryPath``.

The injected script is then executed into the context of the current module
(into the sandbox of the module), as if it is part of the module. It has then access to all
variables and functions defined by the module.

