.. index:: script execution context environment module require

================
Script execution
================

The main script
===============

The script you give to SlimerJS is a javascript script.

The script is considered by SlimerJS as a module. SlimerJS uses the module
system of the Mozilla Addons SDK. It implements the
`CommonJS module specification version 1.1.1 <http://wiki.commonjs.org/wiki/Modules/1.1.1>`_
(except that the ``require()`` function has not a path attribute; it will have it in
a future version of SlimerJS).

The script has access only to few objects in its context (see below). Modules
define other objects. Some are provided by SlimerJS, but you'll certainly provide
your owns modules.

So to execute something, to use some APIs, most of time you'll have to *import*
modules into your script, with ``require()``.

Another way to use objects of an other script, is to *inject*
it into your script.


Modules
=======

A module is a javascript file that defines functions to export and has an id.
The id of modules you provide and use, is the name of the module file in the
current working directory, without the '.js' extension.

Some internal module have a specific id. The script given to SlimerJS is the
module "main".



Modules and main script context
===============================

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
``Math``...

