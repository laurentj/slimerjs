.. index:: Quick Start


===========
Quick Start
===========

SlimerJS execute your script in the context of a blank window (that you cannot see).
So you have a document object, a window object, even if it is not really useful. You
have other objects that will allow you to do many things.


Hello World
-----------

Since SlimerJS is called from the command line, the first thing we could do in our script
is to print something in the terminal. You do it with the ``console`` object, as in
any web page.


.. code-block:: javascript

   console.log("Hello Slimer!");

Store this script into a ``hello.js`` file and execute it:

.. code-block:: bash

   slimerjs hello.js

You'll see a little window opening and the "hello" message in the terminal. And that's all.
Contrary to PhantomJS, SlimerJS is not (yet) headless, this is why you see this window.
But on Linux or MacOS, you can use the tool xvfb to hide all windows opened by your script.

You see that you have to close the window yourself. To close it automatically, call
``slimer.exit()`` (or ``phantom.exit()`` to be compatible with PhantomJS), at the end
of your script



.. code-block:: javascript

   console.log("Hello Slimer!");
   slimer.exit();


Loading a module
----------------

All components and libraries provided by SlimerJS are stored in modules. A module is
a javascript file that "exports" a number of functions to the caller script. To "import"
this functions in your scripts, you have to use the ``require()`` function. It accepts
the module name in parameter, and returns an object

.. code-block:: javascript

   var webpageModule = require("webpage");

The result of require, here stored into ``webpageModule``, is an object that have all
exported functions of the module.

Opening a web page
------------------

The main goal of SlimerJS is to open a web page and to manipulate it or to extract data
from it. You have a dedicated module for that, "webpage".

This module provides only one function, ``create()`` that create a ``webpage`` object.

.. code-block:: javascript

   var page = require("webpage").create();
   page.open("http://slimerjs.org")
       .then(function(status){
            if (status == "success") {
                console.log("The title of the page is: "+ page.title+"\n");
            }
            else {
                console.log("Sorry, the page is not loaded\n");
            }
            page.close();
            phantom.exit();
       })

In SlimerJS, the ``open()`` method of the webpage object returns a "promise", a kind
of object that allows to execute asynchronous task one after an other (you can chain several
page loading with a simple syntax). In our example,
the webpage object load the page at the given URL, and when it is loaded, it executes
the "then" step. Here we check the result of the loading, and if it is ok, we
display the page title.

You can use also the same API of PhantomJS (It doesn't return a promise): give a callback
function to ``open()``:

.. code-block:: javascript

   var page = require("webpage").create();
   page.open("http://slimerjs.org", function(status){
        if (status == "success") {
            console.log("The title of the page is: "+ page.title+"\n");
        }
        else {
            console.log("Sorry, the page is not loaded\n");
        }
        page.close();
        phantom.exit();
   })

