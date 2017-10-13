.. index:: Quick Start


===========
Quick Start
===========

SlimerJS executes your script in the context of a blank window (that you cannot see).
So you have a document object, a window object, even if it is not really useful. You
have other objects that allow you to do many tasks.


Hello World
-----------

.. index:: console, exit

Since SlimerJS is called from the command line, the first thing you could do in your script
is to print something in the terminal. You do it with the ``console`` object, as in
any web page.


.. code-block:: javascript

   console.log("Hello Slimer!");

Store this script into a ``hello.js`` file and execute it:

.. code-block:: bash

   slimerjs hello.js

You'll see a little window opening and the "hello" message in the terminal. And that's all.
Contrary to PhantomJS, SlimerJS is not headless by default, this is why you see this window.
But if you are using Firefox 56 or higher, you can add ``--headless`` on the command
line to not see windows. Or with older Firefoxes, on Linux, you can use the tool xvfb
to hide all windows opened by your script. See `the documentation about it <installation.html#having-a-headless-slimerjs>`_.

You see that you have to close the window by yourself. To close it automatically, call
``slimer.exit()`` (or ``phantom.exit()`` to be compatible with PhantomJS), at the end
of your script.

.. code-block:: javascript

   console.log("Hello Slimer!");
   slimer.exit();


Loading a module
----------------

.. index:: module, require

All components and libraries provided by SlimerJS are stored in modules. It follows
the CommonJS module standard. (No support of ES6 module yet). A module is a
javascript file that "exports" a number of functions to the caller script. To "import"
this functions in your scripts, you have to use the ``require()`` function. It accepts
the module name in parameter, and returns an object.

.. code-block:: javascript

   var webpageModule = require("webpage");

The result of require, here stored into ``webpageModule``, is an object that have all
exported functions of the module.

SlimerJS has modules almost identical to those provided by PhantomJS (webpage, fs,
webserver, system) but it has also many other modules from the Mozilla Addons SDK
which is included into the SlimerJS package.

Opening a web page
------------------

.. index:: webpage, webpage loading, open

The main goal of SlimerJS is to open a web page and to manipulate it or to extract data
from it. You have a dedicated module for that, "webpage".

This module provides only one function, ``create()`` that creates a ``webpage`` object.

.. code-block:: javascript

   var page = require("webpage").create();
   page.open("http://slimerjs.org")
       .then(function(status){
            if (status == "success") {
                console.log("The title of the page is: "+ page.title);
            }
            else {
                console.log("Sorry, the page is not loaded");
            }
            page.close();
            phantom.exit();
       })

In SlimerJS, the ``open()`` method of the webpage object returns a "promise", a kind
of object that allows to execute asynchronous tasks one after an other (you can chain
easily several page loading with this object). In our example,
the webpage object load the page at the given URL, and when it is loaded, it executes
the "then" step. Here we check the result of the loading, and if it is ok, we
display the page title.

You can use also the same API of PhantomJS (It doesn't return a promise): give a callback
function to ``open()``:

.. code-block:: javascript

   var page = require("webpage").create();
   page.open("http://slimerjs.org", function(status){
        if (status == "success") {
            console.log("The title of the page is: "+ page.title);
        }
        else {
            console.log("Sorry, the page is not loaded");
        }
        page.close();
        phantom.exit();
   })


Code Evaluation
---------------

.. index:: evaluate javascript, onConsoleMessage

Once a web page is opened, you may need to execute a javascript function into the
context of the web page, in order to retrieve data or to manipulate the page content.

This function must not call functions or use variables, of your script. It will not
have access to them when it will be executed. The function can return a value: it should
be only simple javascript values : array, number, string or literal object. But not objects
like DOM objects...

To execute such function, use the ``evaluate()`` method of the web page object:

.. code-block:: javascript

    var page = require('webpage').create();
    page.open("http://slimerjs.org", function (status) {
        var mainTitle = page.evaluate(function () {
            console.log('message from the web page');
            return document.querySelector("h1").textContent;
        });
        console.log('First title of the page is ' + mainTitle);
        slimer.exit()
    });

You may notice that you don't see the message "message from the web page". Any console
messages sent from the web page are not displayed by default. You need to give a
callback on the property ``onConsoleMessage``, that will do it:

.. code-block:: javascript

    var page = require('webpage').create();
    page.onConsoleMessage = function (msg) {
        console.log(msg);
    };
    page.open("http://slimerjs.org", function (status) {
        var mainTitle = page.evaluate(function () {
            console.log('message from the web page');
            return document.querySelector("h1").textContent;
        });
        console.log('First title of the page is ' + mainTitle);
        slimer.exit()
    });


Taking screenshots
------------------

.. index:: render, screenshot

You can capture the page rendering and store it into an image, with the ``render()``
method:

.. code-block:: javascript

    var page = require('webpage').create();
    page.open("http://slimerjs.org", function (status) {
        page.viewportSize = { width:1024, height:768 };
        page.render('screenshot.png')
    });

``viewportSize`` allows you to set the window size.


Network monitoring
------------------

.. index:: network monitoring, http listeners, onLoadStarted, onLoadFinished, onResourceRequested, onResourceReceived

You can listen all HTTP steps made during a page loading. You have several callback you can give.

To listen the full loading of the page (when all of its resources are loaded), you may
set the ``onLoadStarted`` callback to know when the loading starts, and
``onLoadFinished`` when the page is fully loaded.

.. code-block:: javascript

    var page = require('webpage').create();
    var startTime;
    page.onLoadStarted = function () {
        startTime = new Date()
    };
    page.onLoadFinished = function (status) {
        if (status == "success") {
            var endTime = new Date()
            console.log('The page is loaded in '+ ((endTime - startTime)/1000)+ " seconds" );
        }
        else
            console.log("The loading has failed");
    };
    page.open(url);

This example displays the time spent to load the page.

You can also listen all HTTP requests and responses with callbacks ``onResourceRequested`` and
``onResourceReceived``.

More informations
-----------------

The documentation is not yet complete. You can read the documentation of PhantomJS
to know more about the API.


