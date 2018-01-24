.. index:: webpage

=======
webpage
=======

This module provide a ``create()`` function that returns a webpage object. This
object allows to load and manipulate a web page.


.. code-block:: javascript

   var page = require("webpage").create();

In the ``page`` variable, you have then an object with many properties and
methods. See below.

Note: almost properties and methods are implemented, but some are not documented yet.
Please help us to document them ;-). You can also read the PhantomJS documentation.

Index of properties and methods
--------------------------------

Navigation:

:ref:`canGoBack <webpage-canGoBack>`,
:ref:`canGoForward <webpage-canGoForward>`,
:ref:`navigationLocked <webpage-navigationLocked>`

:ref:`go() <webpage-go>` ,
:ref:`goBack() <webpage-goBack>`,
:ref:`goForward() <webpage-goForward>`

:ref:`onNavigationRequested <webpage-onNavigationRequested>`

Frames and windows management:

:ref:`focusedFrameName <webpage-focusedFrameName>`,
:ref:`frameContent <webpage-frameContent>`,
:ref:`frameName <webpage-frameName>`,
:ref:`framePlainText <webpage-framePlainText>`,
:ref:`frameTitle <webpage-frameTitle>`,
:ref:`frameUrl <webpage-frameUrl>`,
:ref:`framesCount <webpage-framesCount>`,
:ref:`framesName <webpage-framesName>`,
:ref:`ownsPages <webpage-ownsPages>`,
:ref:`pages <webpage-pages>`,
:ref:`pagesWindowName <webpage-pagesWindowName>`,
:ref:`url <webpage-url>`,
:ref:`windowName <webpage-windowName>`

:ref:`childFramesCount() <webpage-childFramesCount>`,
:ref:`childFramesName() <webpage-childFramesName>`,
:ref:`close() <webpage-close>`,
:ref:`currentFrameName() <webpage-currentFrameName>`,
:ref:`getPage() <webpage-getPage>`,
:ref:`open() <webpage-open>`,
:ref:`openUrl() <webpage-openUrl>`,
:ref:`release() <webpage-release>`,
:ref:`reload() <webpage-reload>`,
:ref:`stop() <webpage-stop>`,
:ref:`switchToFocusedFrame() <webpage-switchToFocusedFrame>`,
:ref:`switchToFrame() <webpage-switchToFrame>`,
:ref:`switchToChildFrame() <webpage-switchToChildFrame>`,
:ref:`switchToMainFrame() <webpage-switchToMainFrame>`,
:ref:`switchToParentFrame() <webpage-switchToParentFrame>`

:ref:`onPageCreated <webpage-onPageCreated>`,
:ref:`onClosing <webpage-onClosing>`,
:ref:`onUrlChanged <webpage-onUrlChanged>`

Offline storage:

:ref:`offlineStoragePath <webpage-offlineStoragePath>`,
:ref:`offlineStorageQuota <webpage-offlineStorageQuota>`

Rendering:

:ref:`clipRect <webpage-clipRect>`,
:ref:`paperSize <webpage-paperSize>`,
:ref:`viewportSize <webpage-viewportSize>`,
:ref:`zoomFactor <webpage-zoomFactor>`

:ref:`render() <webpage-render>`,
:ref:`renderBase64() <webpage-renderBase64>`
:ref:`renderBytes() <webpage-renderBytes>`


Content management:

:ref:`captureContent <webpage-captureContent>`,
:ref:`content <webpage-content>`,
:ref:`plainText <webpage-plainText>`,
:ref:`scrollPosition <webpage-scrollPosition>`,
:ref:`title <webpage-title>`


:ref:`setContent() <webpage-setContent>`,
:ref:`uploadFile() <webpage-uploadFile>`

:ref:`onAlert <webpage-onAlert>`,
:ref:`onAuthPrompt <webpage-onAuthPrompt>`,
:ref:`onCallback <webpage-onCallback>`,
:ref:`onConfirm <webpage-onConfirm>`,
:ref:`onConsoleMessage <webpage-onConsoleMessage>`,
:ref:`onFilePicker <webpage-onFilePicker>`,
:ref:`onFileDownload <webpage-onFileDownload>`,
:ref:`onFileDownloadError <webpage-onFileDownloadError>`,
:ref:`onPrompt <webpage-onPrompt>`

Javascript execution:

:ref:`evaluateJavaScript() <webpage-evaluateJavaScript>`,
:ref:`evaluate() <webpage-evaluate>`,
:ref:`evaluateAsync() <webpage-evaluateAsync>`,
:ref:`includeJs() <webpage-includeJs>`,
:ref:`injectJs() <webpage-injectJs>`,
:ref:`stopJavaScript() <webpage-stopJavaScript>`

:ref:`onLongRunningScript <webpage-onLongRunningScript>`,
:ref:`onError <webpage-onError>` 




Cookies management:

:ref:`cookies <webpage-cookies>`,
:ref:`addCookie() <webpage-addCookie>`

:ref:`clearCookies() <webpage-clearCookies>`,
:ref:`deleteCookie() <webpage-deleteCookie>`

Network management:

:ref:`customHeaders <webpage-customHeaders>`

:ref:`onInitialized <webpage-onInitialized>`,
:ref:`onLoadFinished <webpage-onLoadFinished>`,
:ref:`onLoadStarted <webpage-onLoadStarted>`

:ref:`onResourceError <webpage-onResourceError>`,
:ref:`onResourceRequested <webpage-onResourceRequested>`,
:ref:`onResourceReceived <webpage-onResourceReceived>`,
:ref:`onResourceTimeout <webpage-onResourceTimeout>`

Page events:

:ref:`event <webpage-event>`,
:ref:`sendEvent() <webpage-sendEvent>`

Others properties:

:ref:`libraryPath <webpage-libraryPath>`

:ref:`settings <webpage-settings>`

Internal methods to trigger callbacks:

:ref:`closing() <webpage-closing>`,
:ref:`initialized() <webpage-initialized>`,
:ref:`javaScriptAlertSent() <webpage-javaScriptAlertSent>`,
:ref:`javaScriptConsoleMessageSent() <webpage-javaScriptConsoleMessageSent>`,
:ref:`loadFinished() <webpage-loadFinished>`,
:ref:`loadStarted() <webpage-loadStarted>`,
:ref:`navigationRequested() <webpage-navigationRequested>`,
:ref:`rawPageCreated() <webpage-rawPageCreated>`,
:ref:`resourceError() <webpage-resourceError>`,
:ref:`resourceReceived() <webpage-resourceReceived>`,
:ref:`resourceRequested() <webpage-resourceRequested>`,
:ref:`urlChanged() <webpage-urlChanged>`


Properties
===========

.. _webpage-clipRect:

clipRect
-----------------------------------------

This is an object indicating the coordinates of an area to capture, used
by the ``render()`` method. It contains four properties: ``top``, ``left``, ``width``, ``height``.

To modify it, set an entire object on this property.

.. code-block:: javascript

    page.clipRect = { top: 14, left: 3, width: 400, height: 300 };

.. _webpage-canGoBack:

canGoBack
-----------------------------------------

Indicates if there is a previous page in the navigation history. This is a boolean.
Read-only.

.. _webpage-canGoForward:

canGoForward
-----------------------------------------

Indicates if there is a next page in the navigation history. This is a boolean.
Read-only.

.. _webpage-captureContent:

captureContent
-----------------------------------------

This is an array of regexp matching content types of resources for which you want to
retrieve the content. The content is then set on the body property of the response
object received by your :ref:`onResourceReceived callback <webpage-onResourceReceived>`.

.. code-block:: javascript

    webpage.captureContent = [ /css/, /image\/.*/ ]

This limitation exists to avoid to take memory uselessly (in the case where you don't need
the ``body`` property), since resources like images or videos could take many memory.

(SlimerJS only)

.. _webpage-content:

content
-----------------------------------------

This property contain the source code of the actual webpage.
You can set this property with the source code of an HTML page
to replace the content of the current web page.

.. _webpage-cookies:

cookies
-----------------------------------------


This is an array of all :doc:`Cookie objects <cookie>` stored in the current
profile, and which corresponds to the current url of the webpage.

When you set an array of Cookie to this property, cookies will be set
for the current url: their domain and path properties will be changed.

Note: modifying an object in the array won't modify the cookie. You should
retrieve the array, modify it, and then set the ``cookies`` property with this array.
Probably you would prefer to use the ``addCookie()`` method to modify a cookie.

If cookies are disabled, or if no page is loaded, modifying this property does nothing.

Be careful about `the inconsistent behavior of the expiry property <cookie.html#expires>`_.

.. _webpage-customHeaders:

customHeaders
-----------------------------------------

.. index:: customHeaders

This property is an object defining additional HTTP headers that will be send
with each HTTP request, both for pages and resources.

Example:

.. code-block:: javascript

    webpage.customHeaders = {
        "foo": "bar"
    }


To define user agent, prefer to use ``webpage.settings.userAgent``

.. container:: warning

   **Warning**: Do not set headers that contain sensitive information, like authentication
   username/password, cookies etc! It can be a security issue!
   Remember that all custom headers are sent with **every requests** made during
   the load of the web page.
   And as you may know, a web page can load resources from everywhere. If you set
   http authentication username/password into headers, and if the web page loaded
   from the web site A, contains an iframe that loads a page from another web site B,
   this website will receive all custom headers, and then **the username and password**,
   although it should not!

- To set cookies, prefer to use the :ref:`cookies property <webpage-cookies>`.
- To set http authentication username and password, prefer to use :ref:`settings <webpage-settings>`
  or better, define an ``onAuthPrompt`` callback (version 0.9+) with which you can precisely indicate
  credentials for specific hosts.
- If you want to set headers only for the main request of the web page, use the ``httpConf``
  parameter to the :ref:`open() method <webpage-open>` or the :ref:`openUrl() method <webpage-openurl>`.


.. _webpage-event:

event
-----------------------------------------

This is an object (read only) that hosts some constants
to use with ``sendEvent()``.

There is a ``modifier`` property containing constants
for key modifiers:

.. code-block:: javascript

    page.event.modifier.shift
    page.event.modifier.ctrl
    page.event.modifier.alt
    page.event.modifier.meta
    page.event.modifier.keypad

There is also a ``key`` property containing constants
for key codes.


.. _webpage-focusedFrameName:

focusedFrameName
-----------------------------------------

Contains the name of the child frame that has the focus. Read only.

.. _webpage-frameContent:

frameContent
-----------------------------------------

This property contain the source code of `the selected frame <../manual/frames-manipulation.html>`_.
You can set this property with the source code of an HTML page
to replace the content of the current frame.


.. _webpage-frameName:

frameName
-----------------------------------------

Contains the name of `the selected frame <../manual/frames-manipulation.html>`_.

Read only.

.. _webpage-framePlainText:

framePlainText
-----------------------------------------

Contains the text version of the content of `the selected frame <../manual/frames-manipulation.html>`_.

Read only.


.. _webpage-frameTitle:

frameTitle
-----------------------------------------

Contains the title of `the selected frame <../manual/frames-manipulation.html>`_.

Read only.



.. _webpage-frameUrl:

frameUrl
-----------------------------------------


Contains the URL of `the selected frame <../manual/frames-manipulation.html>`_.

Read only.



.. _webpage-framesCount:

framesCount
-----------------------------------------

Contains the number of child frames of `the selected frame <../manual/frames-manipulation.html>`_.

Read only.

.. _webpage-framesName:

framesName
-----------------------------------------

Contains the list of names of child frames of `the selected frame <../manual/frames-manipulation.html>`_.

Read only.


.. _webpage-libraryPath:

libraryPath
-----------------------------------------

Implemented. Documentation needed.


.. _webpage-navigationLocked:

navigationLocked
-----------------------------------------

This is a property to lock navigation. If it is ``true``, clicking on a link in
the web page to load a new page, submitting a form etc, will not have effect.

.. _webpage-offlineStoragePath:

offlineStoragePath
-----------------------------------------

Indicates the path of the sqlite file where content of window.localStorage is stored. Read only.

Note: in PhantomJS, this is the path of a directory. The storage is different than in Gecko.
Contrary to PhantomJS, this property cannot be changed with the ``--local-storage-path`` flag
from the command line.


.. _webpage-offlineStorageQuota:

offlineStorageQuota
-----------------------------------------

Contains the maximum size of data for a page, stored in window.localStorage.
The number is in Bytes. Default is 5 242 880 (5MB).  Read only.

To change this number, use the ``--local-storage-quota`` flag in the command line.


.. _webpage-ownsPages:

ownsPages
-----------------------------------------

This boolean indicates if pages opening by the webpage (by `window.open()`)
should be children of the webpage (true) or not (false). Default is true.

When it is true, child pages appears in the `pages` property.

.. _webpage-pages:

pages
-----------------------------------------

This is the list of child pages that the page has currently opened with `window.open()`.

If a child page is closed (by `window.close()` or by `webpage.close()`),
the page is automatically removed from this list.

You should not keep a strong reference to this array since you obtain
only a copy, so in this case you won't see changes.
 
If "ownsPages" is "false", this list won't owns the child pages.


.. _webpage-pagesWindowName:

pagesWindowName
-----------------------------------------

list of window name (strings) of child pages.

The window name is the name given to `window.open()`.

The list is only from child pages that have been created when
ownsPages was true.

.. _webpage-paperSize:

paperSize
-----------------------------------------

Contains an object specifying some dimensions for the PDF rendering.
If null, the PDF size will be the viewport size of the webpage.

It can be either:

.. code-block:: javascript

    {width:'', height:'', margin:''}

or

.. code-block:: javascript

    {format:'', orientation:'', margin:''}

Margin (optional) can be a single dimension or an object containing one or more of the following
properties: 'top', 'left', 'bottom', 'right'. Default is 0.

Dimensions in width, height, margin should be a number following by a unit: 'mm', 'cm', 'in',
'px'. No unit means 'px'.

Format should one of these strings : "A4", "B5", "Letter", "Legal", "Executive",
"A0", "A1", "A2", "A3", "A5", "A6", "A7", "A8", "A9",
"B0", "B1", "B10", "B2", "B3", "B4", "B6", "B7", "B8", "B9",
"C5E", "Comm10E", "DLE", "Folio", "Ledger", "Tabloid".

Orientation (optional) is "landscape" or 'portrait' (default).

'header' and 'footer' properties supported in PhantomJS are not supported yet by SlimerJS.

SlimerJS supports 'headerStr' and 'footerStr' properties which are static text with following special symbols interpretation.
 ====================  ===========================================================
 Variable              Description
 ====================  ===========================================================
 ``&T``                title
 ``&U``                URL
 ``&D``                date/time
 ``&P``                current page number
 ``&PT``               total number of pages in form "*page* ``of`` *total*"
 ``&L``                last page number   
 ====================  ===========================================================

The font of header and footer can't be modified.
  
'headerStr' and 'footerStr' can be objects with properties for position (left,center,right) of header/footer.

.. code-block:: javascript

    {
	 	 headerStr:{left:'', center:'&T', right:''}
		 , footerStr:{left:'', center:'', right:'&P of &L'}
	 }

SlimerJS supports following additional properties of paperSize.

- ``unwriteableMargin``: unwriteable margins
- ``edge`` : positioning of the headers and footers on the page. They're measured as an offset from the unwriteable margin
- ``shrinkToFit``: try to fit content in page (bool) 
- ``printBGColors``, ``printBGImages``: control printing of background colors and images (bool)
- ``title``: title of printed content (see 'headerStr' and 'footerStr')
 

.. _webpage-plainText:

plainText
-----------------------------------------

Contains the content of the web page as text. For html pages, you'll have
only texts of the page.

Read only.

.. _webpage-scrollPosition:

scrollPosition
-----------------------------------------

This property contains an object indicating the scrolling position. You can read or
modify it. The object contains two properties: ``top`` and ``left``

Example:

.. code-block:: javascript

    page.scrollPosition = { top: 100, left: 0 };


.. _webpage-settings:

settings
-----------------------------------------

.. index:: settings

This property allows to set some options for the load of a page.
Changing them after the load has no effect.

- ``allowMedia``: ``false`` to deactivate the loading of media (audio / video). Default: ``true``. (SlimerJS only)
- ``javascriptEnabled``: ``false`` to deactivate javascript in web pages (default is ``true``)
- ``javascriptCanCloseWindows``  (not supported yet)
- ``javascriptCanOpenWindows``  (not supported yet)
- ``loadImages``: ``false`` to deactivate the loading of images (default is ``true``)
- ``localToRemoteUrlAccessEnabled``  (not supported yet)
- ``maxAuthAttempts``: indicate the maximum of attempts of HTTP authentication. (SlimerJS 0.9)
- ``password``: password to give to HTTP authentication (SlimerJS 0.9)
- ``userAgent``: string to define the user Agent in HTTP requests. By default, it is
  something like ``"Mozilla/5.0 (X11; Linux x86_64; rv:21.0) Gecko/20100101 SlimerJS/0.7"``
  (depending of the version of Firefox you use), or the value set by the ``--user-agent`` command line option.
- ``userName``: username to give to HTTP authentication (SlimerJS 0.9)
- ``XSSAuditingEnabled``  (not supported yet)
- ``webSecurityEnabled``  (not supported yet)
- ``plainTextAllContent``: ``true`` to indicate that webpage.plainText returns everything, even
   content of ``script`` elements, invisible elements etc.. Default: ``false``. (SlimerJS only)
- ``resourceTimeout``: the number of milliseconds that the browser should wait
   after the loading of a resource. ``undefined`` (default value) means default
   gecko parameters.

.. code-block:: javascript

    page.settings.userAgent = "My Super Agent / 1.0"

.. container:: warning

    user name and password indicated into settings are given to the server of the main loaded
    webpage (if it asks them), but also to all servers that are called for some resources
    and that ask an http authentication! Without knowing it, you can give these
    sensitive information to a web resource loading from an other
    domain than the main page and which asks http authentication (like
    an iframe, a css stylesheets etc..).
    If you want a better control of the authentication, use the ``httpConf`` parameter
    on the :ref:`open() <webpage-open>` or :ref:`openUrl() <webpage-openUrl>` method,
    or use the callback :ref:`onAuthPrompt <webpage-onAuthPrompt>`.

.. _webpage-title:

title
-----------------------------------------

It allows to retrieve the title of the loaded page. (Readonly)

.. _webpage-url:

url
-----------------------------------------

This property contains the current url of the page. If nothing
is loaded yet, this is an empty string.
Read only.

.. _webpage-viewportSize:

viewportSize
-----------------------------------------

This property allows to change the size of the viewport, e.g., the size of the window
where the webpage is displayed. (default is ``{width: 400, height: 300}`` or the values
from the ``--viewport-width`` and ``--viewport-height`` command line options.)

It is useful to test the display of the web page in different size of windows.

``viewportSize`` is an object with with ``width`` and ``height`` properties, containing
the size in pixels.

Note that changing this property triggers a reflow of the rendering and this is done
asynchronously (this is how browser rendering engines work). So for example, if you take
a screenshot with ``webpage.render()`` just after setting the viewportSize, you may not
have the final result (you call ``render()`` too early).

.. code-block:: javascript

    page.viewportSize = { width: 480, height: 800 };


.. _webpage-windowName:

windowName
-----------------------------------------

Contains the name of the window, e.g. the name given to ``window.open()`` if the page
has been opened with this method.

.. _webpage-zoomFactor:

zoomFactor
-----------------------------------------

Contains the zoom factor of the webpage display. Setting a value to this property decreases
or increases the size of the web page rendering. A value between 0 and 1 decreases the
size of the page, and a value higher than 1 increases its size. ``1`` means no zoom
(normal size).

Note that changing its value refreshes the display of the page asynchronously.
So for example, if you call :ref:`render() <webpage-render>` just after setting a value on
``zoomFactor``, the screenshot may not represent the final result (``render()`` is called
too early). After the call of ``zoomFactor``, You probably have to put the code into a
callback given to ``window.setTimeout()``, or you can call ``slimer.wait(500)`` (which is
not compatible with PhantomJS).


Methods
========


.. _webpage-addCookie:

addCookie(cookie)
-----------------------------------------

Add a cookie in the cookies storage of the current profile, for the
current url. The parameter is :doc:`a Cookie object <cookie>`.
The domain and the path of the cookie will be set to the domain
and the path of the current url.

It returns true if the cookie has been really added. If cookies are
disabled, or if no page is loaded, the cookie is not added into the cookie database.

Be careful about `the inconsistent behavior of the expiry property <cookie.html#expires>`_.


.. _webpage-childFramesCount:

childFramesCount()
-----------------------------------------

Returns the number child frames of `the selected frame <../manual/frames-manipulation.html>`_.

Deprecated. Use :ref:`framesCount <webpage-framesCount>` instead.


.. _webpage-childFramesName:

childFramesName()
-----------------------------------------

Returns the list of the names of child frames of `the selected frame <../manual/frames-manipulation.html>`_.

Deprecated. Use :ref:`framesName <webpage-framesName>` instead.


.. _webpage-clearCookies:

clearCookies()
-----------------------------------------

Delete all cookies corresponding to the current url.


.. _webpage-close:

close()
-----------------------------------------

Close the web page. It means that it closes the window displaying the web page.
After the close, some methods cannot be used and you should call ``open()`` or ``openUrl()``
to be able to reuse the webpage object.


.. _webpage-currentFrameName:

currentFrameName()
-----------------------------------------

Returns the name of `the selected frame <../manual/frames-manipulation.html>`_.

Deprecated. Use :ref:`frameName <webpage-frameName>` instead.


.. _webpage-deleteCookie:

deleteCookie(cookiename)
-----------------------------------------

It deletes all cookies that have the given name and corresponding
to the current url.

It returns true if some cookies have been deleted.
It works only if cookies are enabled.

.. _webpage-evaluateJavaScript:

evaluateJavaScript(src)
-----------------------------------------

Evaluate the current javascript source (in a string), into the context of the
loaded web page, or if a frame is selected, into the context of
`the selected frame <../manual/frames-manipulation.html>`_.
It returns the result of the evaluation.

.. _webpage-evaluate:

evaluate(func, arg1, arg2...)
-----------------------------------------

It executes the given function in the context of the loaded web page, or if a frame is
selected, into the context of `the selected frame <../manual/frames-manipulation.html>`_.
It means that the code of the function cannot access to objects and variables of your
script.

For example, in this function, the ``document`` and ``window`` objects are belongs
to the loaded page, not to your script. In other terms, you cannot use closures.

.. code-block:: javascript

    var page = require('webpage').create();
    page.open("http://example.com", function (status) {
        var someContent = page.evaluate(function () {
            return document.querySelector("#aDiv").textContent;
        });
        console.log('The introduction: ' + someContent);
        slimer.exit()
    });

You can give additional parameters to ``evaluate()``. This will be the parameters
for the function. For example, here the function will receive "#aDiv" as parameter:

.. code-block:: javascript

    var someContent = page.evaluate(function (selector) {
        return document.querySelector(selector).textContent;
    }, "#aDiv");

Parameters can only some basic javascript objects or literal values. You cannot pass
some objects like DOM elements. In other terms, you cannot pass parameters on which you
cannot call a ``toString()`` or you cannot serialize as a JSON value.

``evaluate()`` returns the value returned by the function.

.. _webpage-evaluateAsync:

evaluateAsync(func, timeMs, arg1, arg2...)
-------------------------------------------

It is equivalent to ``evaluate()``, but with some differences:

- the function is executed asynchronously. It means that the call of ``evaluateAsync()``
  does not wait after the execution of the given function to return. It does not
  block your current script. The script can be executed after the given
  number of milliseconds (timeMs).
- you cannot return values inside the given function

.. _webpage-getPage:

getPage(windowName)
-----------------------------------------

This methods returns the child page that matches the given "window.name".

Only children opened when ownsPage was true are checked.

.. _webpage-go:

go(indexIncrement)
-----------------------------------------

This method allows to navigate into the navigation history.
The parameter, an integer, indicates how far to move forward or backward in the navigation history.

.. code-block:: javascript

    webpage.go(-3);
    webpage.go(-1); // equivalent to webpage.goBack()
    webpage.go(1);  // equivalent to webpage.goForward()
    webpage.go(4);

.. _webpage-goBack:

goBack()
-----------------------------------------

Displays the previous page in the navigation history.

.. _webpage-goForward:

goForward()
-----------------------------------------

Displays the next page in the navigation history.


.. _webpage-includeJs:

includeJs(url, callback)
-----------------------------------------

It loads into the current web page, the javascript file stored
at the given url. If `a frame is selected <../manual/frames-manipulation.html>`_,
the file is loaded into this frame.

When the load is done, the given callback is called.

.. _webpage-injectJs:

injectJs(filename)
-----------------------------------------

It loads and executes the given javascript file into
the context of the current web page. If `a frame is selected <../manual/frames-manipulation.html>`_,
the file is executed into this frame.

If the given filename is a relative path, SlimerJS tries
to resolve the full path from the current working directory
(that is the directory from which SlimerJS has been launched).
If the file is not found, SlimerJS tries to resolve with
the libraryPath.

Note: there is a limitation in SlimerJS. If the loaded script
wants to modify a variable of the current web page/frame, it should
call ``window.myvariable = '..'`` instead of ``myvariable = '..'``.

.. _webpage-stopJavaScript:

stopJavaScript()
-----------------------------------------
Stop long running JavaScript within `onLongRunningScript` callback.
Called outside of the `onLongRunningScript` callback it does nothing.

.. _webpage-open:

open(url...)
-----------------------------------------

.. index:: open, promise

.. _promise: https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/core/promise.html

This method allows to open a page into a virtual browser.

Since this operation is asynchronous, you cannot do something on
the page after the call of ``open()``. You should provide a callback
or you should use the returned promise_ (not compatible with PhantomJS),
to do something on the loaded page. The callback or the promise receives
a string "success" if the loading was successful.

Example with a callback function:

.. code-block:: javascript

   page.open("http://slimerjs.org", function(status){
        if (status == "success") {
            console.log("The title of the page is: "+ page.title);
        }
        else {
            console.log("Sorry, the page is not loaded");
        }
   })

Example with the returned promise_ (not compatible with PhantomJS):

.. code-block:: javascript

   page.open("http://slimerjs.org")
       .then(function(status){
            if (status == "success") {
                console.log("The title of the page is: "+ page.title);
            }
            else {
                console.log("Sorry, the page is not loaded");
            }
       })


To load two pages, one after an other, here is how to do:

.. code-block:: javascript

   page.open("http://example.com/page1", function(status){
        // do something on the page...
        
        page.open("http://example.com/page2", function(status){
            // do something on the page...
        })
   })

With the promise_, it's better in term of code (not compatible with PhantomJS):

.. code-block:: javascript

   page.open("http://example.com/page1")
       .then(function(status){
           // do something on the page...
           
           return page.open("http://example.com/page2")
       })
       .then(function(status){
           // do something on the page...
           
           // etc...
           return page.open("http://example.com/page3")
       })

To load N pages in parallel, here is how to do:

.. code-block:: javascript

   const URLS = [
       'http://example.com/page1',
       'http://example.com/page2'
   ];
   
   var queue = [];
   URLS.forEach(function(url) {
       var p = new Promise(function(resolve, reject) {
           var page = require('webpage').create();
           page.open(url)
               .then(function(status) {
                   if (status == "success") {
                       var title = page.title;
                       console.log("Page title of " + url + " : " + title);
                       page.close();
                       resolve([url, title]);
                   } else {
                       console.log("Sorry, the page is not loaded for " + url);
                       reject(new Error("Some problem occurred with " + url));
                   }
               });
       });
       queue.push(p);
   });
   
   Promise.all(queue).then(function(values) {
       console.log(values);
       phantom.exit();
   });
   
**Other arguments:**

The ``open()`` method accepts several arguments:

- ``open(url)``
- ``open(url, callback)``
- ``open(url, httpConf)``
- ``open(url, httpConf, callback)``
- ``open(url, operation, data)``
- ``open(url, operation, data, callback)``
- ``open(url, operation, data, headers, callback)``

Remember that in all cases, the method returns a promise_.

``httpConf`` is an object. See :ref:`webpage.openUrl <webpage-openUrl>` below.
``operation``, ``data`` and ``headers`` should have same type of values
as you can find in ``httpConf``.

Note that ``open()`` call in fact ``openUrl()``.


.. _webpage-openUrl:

openUrl(url, httpConf, settings, callback)
-------------------------------------------

.. index:: openUrl, promise

Like ``open()``, it loads a webpage. The only difference is the number
and the type of arguments.
 
``httpConf`` is an object with these properties:

- ``httpConf.operation``: the http method. Allowed values: ``'get'`` or ``'post'`` (other methods are not supported in SlimerJS)
- ``httpConf.data``: the body. Useful only for ``'post'`` method
- ``httpConf.headers``: the headers to send. An object like :ref:`webpage.customHeaders <webpage-customHeaders>`, but it
  doesn't replace ``webpage.customHeaders``. It allows you to specify additional headers
  for this specific load.

``httpConf`` is optional and you can give ``null`` instead of an object.
The default method will be ``'get'``, without data and without specific headers.s

``settings`` is an object like :ref:`webpage.settings <webpage-settings>`. In
fact the given value changes ``webpage.settings``. You can indicate ``null`` if
you don't want to set new settings.

``callback`` is a callback function, called when the page is loaded.

``openUrl()`` returns a promise.

.. _webpage-release:

release()
-----------------------------------------

Similar to :ref:`close() <webpage-close>`.
This method is deprecated in PhantomJS.  ``webpage.close()`` should
be used instead.

.. _webpage-reload:

reload()
-----------------------------------------

Reload the current web page.

.. _webpage-render:

render(filename, options)
-----------------------------------------

This method takes a screenshot of the web page and stores it into the given file.
You can limit the area to capture by setting the ``clipRect`` property.

By default, it determines the format of the file by inspecting its extension.
It supports only JPG, PNG and PDF format (and gif probably in future version).

The second parameter is an object containing options. Here are its possible properties:

- ``format``: indicate the file format (then the file extension is ignored). possible
  values: ``jpg``, ``png``, ``jpeg``, ``pdf``, ``bmp`` and ``ico``. Gecko doesn't have a
  GIF encoder so it is not available.
- ``quality``: the compression quality. A number between 0 and 100 (in SlimerJS 0.9.2 and
  lower, it was between 0 and 1)
- ``ratio``: (SlimerJS only), a number between 0 and 1, indicating the "zoom level" of the capture.
   (``zoomFactor`` is then ignored).
- ``onlyViewport``: (SlimerJS only), set to true if you only want to take a screenshot of
  the current viewport. By default, it is false, and screenshot has the size of the content,
  except when webpage.clipRect is set.

Note: because of a limitation of Gecko (see `Mozilla bug 650418 <https://bugzilla.mozilla.org/show_bug.cgi?id=650418>`_),
plugins content like flash cannot be rendered in the screenshot (even if you can see it in
the window). Except in the case where the ``<object>`` element contains ``<param name="wmode" value="transparent">``.

Note: An other limitation of Gecko on the canvas element (`used to render the page <https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D#drawWindow%28%29>`_
inside SlimerJS) prevents us to get transparent background. However
`there is a workaround <https://github.com/laurentj/slimerjs/issues/154#issuecomment-58495876>`_.

For PDF rendering, the ``clipRect`` property, ``quality`` and ``onlyViewport`` options are
ignored. Some options for PDF should be set in the ``paperSize`` property.


Note: On MacOSx, you probably have to install a "PDF driver" as a printer on your system.
See for example `PDFWriter for mac <http://sourceforge.net/projects/pdfwriterformac/>`_.

On Linux,:

- Verify that Cups is installed and is running.
- if it hangs during PDF rendering, try by unsetting the environment variable CUPS_SERVER before running Slimerjs. 

.. _webpage-renderBase64:

renderBase64(format)
-----------------------------------------

This method takes a screenshot of the web page and returns it as a string containing the
image in base64. The format indicates the format of the image: ``jpg``, ``png``, ``jpeg``.
Gecko doesn't have a  GIF encoder so it is not available..

You can limit the area to capture by setting the ``clipRect`` property.

Instead of giving the format, you can give an object containing options (SlimerJS only).
See the ``render()`` function.

.. _webpage-renderBytes:

renderBytes(options)
-----------------------------------------

This method takes a screenshot of the web page and returns it as a "binary string" containing the
image data in the specified format. 

The options object is the same as in ``render()``.

Not in PhantomJS.

Note: you can use the result to output on the standard output, by setting
``phantom.outputEncoding`` to "binary".

.. code-block:: javascript

    phantom.outputEncoding = 'binary';
    // ....
    let bytes = page.renderBytes({format:'png'})
    if (bytes) {
        system.stdout.write(bytes);
    }


.. _webpage-sendEvent:

sendEvent(eventType, arg1, arg2, button, modifier)
---------------------------------------------------

It sends hardware-like events to the web page, through the
browser window, like a user does when he types on a keyboard or
uses his mouse. Then the browser engine (Gecko) translates these events
into DOM events into the web page.

So this method does not directly synthesize DOM events. This is why
you cannot indicate a DOM element as target.

With this method, you can generate keyboard events and mouse events.
Arguments depends which type of event you want to generate.

The event type is given as the first argument.

**Mouse events**

You should indicate 'mouseup', 'mousedown', 'mousemove', 'doubleclick'
or 'click' as event type. 

Arguments arg1 and arg2 should represent the mouse position on the window.
arg1 is the horizontal coordinate (x) and arg2 is the vertical coordinate (y).
These arguments are optional. In this case, give null as value.

The fourth argument is the pressed button. Indicates 'left', 'middle' or 'right'.

The "modifier" argument is a combination of keyboard modifiers, i.e., a code
indicating if a key like 'ctrl' or 'alt' is pressed. Codes are available
on the ``webpage.event.modifier`` object:

- ``webpage.event.modifier.ctrl``
- ``webpage.event.modifier.shift``
- ``webpage.event.modifier.alt``
- ``webpage.event.modifier.meta``
- ``webpage.event.modifier.keypad``

If no modifiers key, just use 0 as value.

.. code-block:: javascript

    // we send a click with ctrl+shift and the left button
    var mod = page.event.modifier.ctrl | page.event.modifier.shift;
    page.sendEvent('click', null, null, 'left', mod);

- with 'mouseup', the web page will receive a mouseup and a click DOM event.
- with 'mousedown', the web page will receive a mousedown and a click DOM event.
- with 'mousemove', the web page will receive a simple mousemove DOM event.
- with 'doubleclick' and 'click', the web page will receive a mousedown
  and a mouseup DOM events, followed by a click DOM event. And
  followed by a dblclick DOM event in the case of 'doubleclick'.

The targeted DOM element is the DOM element under the indicated coordinates.

Note that if coordinates are outside the viewport of the window,
the webpage will not receives DOM events.

**Keyboard events**

You should indicate 'keyup', 'keypress' or 'keydown' as event type.

The second parameter is a key code (from webpage.event.key), or a string
of one or more characters.

You can also indicate a modifier key as fifth argument. See above for mouse events.

Third and fourth argument are not taken account for keyboard events.
Just give null for them.

.. code-block:: javascript

    page.sendEvent('keypress', page.event.key.B);
    page.sendEvent('keypress', "C");
    page.sendEvent('keypress', "abc");
    
    var mod = page.event.modifier.ctrl | page.event.modifier.shift;
    page.sendEvent('keypress', page.event.key.A, null, null, mod);

When you give a string as a second parameter, if its length is more
than one character:

- for keyup and keydown, only the first character is used
- for keypress, it will generates a keydown+keypress+keyup DOM events
  for each characters.

The targeted DOM element is the DOM element that has the focus.

Note: the DOMEvent.DOM_VK_ENTER key code has been removed in Gecko 30+. So using
page.event.key.Enter will do nothing (or you receive 0 as key code in your event listener).
Use page.event.key.Return instead.

.. _webpage-setContent:

setContent(content, url)
-----------------------------------------

This method allows to replace the content of the current page
with the given HTML source code. The URL indicates the address
assigned to this new content.


.. _webpage-stop:

stop()
-----------------------------------------

It stops the loading of the page.

.. _webpage-switchToFocusedFrame:

switchToFocusedFrame()
-----------------------------------------

It selects the frame that has the focus.

See `frames manipulation <../manual/frames-manipulation.html>`_.

.. _webpage-switchToFrame:

switchToFrame(name)
-----------------------------------------

It selects the frame that has the given name, and is the child of
the current frame.

See `frames manipulation <../manual/frames-manipulation.html>`_.

.. _webpage-switchToChildFrame:

switchToChildFrame()
-----------------------------------------

Deprecated. Use :ref:`webpage.switchToFrame() <webpage-switchToFrame>` instead.


.. _webpage-switchToMainFrame:

switchToMainFrame()
-----------------------------------------

It selects the main frame, i.e. the root window.

See `frames manipulation <../manual/frames-manipulation.html>`_.


.. _webpage-switchToParentFrame:

switchToParentFrame()
-----------------------------------------

It selects the parent frame of the current frame.

See `frames manipulation <../manual/frames-manipulation.html>`_.


.. _webpage-uploadFile:

uploadFile(selector, filename)
-----------------------------------------

A form may content an ``<input type="file">`` element. Of course, because
SlimerJs is a scriptable browser, you cannot manipulate the file picker
opened when you click on this element. ``uploadFile()`` allows you to set the
value of such elements.

Arguments are the CSS selector (in `the current frame <../manual/frames-manipulation.html>`_)
of the input element, and the full path of the file. The file must exist. You can also
indicate an array of path, if the input element accepts several files.

Note that a virtual file picker is opened when calling ``uploadFile()``, and
so the ``onFilePicker`` callback is called. If this callback exists and
returns a filename, the filename given to ``uploadFile()`` is ignored.


Callbacks
==========


.. _webpage-onAlert:

onAlert
-----------------------------------------

This should be a callback function, called when the webpage do a ``window.alert('...')``.
The callback receives the message. It allows you to do something during this process.


.. code-block:: javascript

    page.onAlert = function(text) {
        console.log("Alert done! "+text);
    }


.. _webpage-onAuthPrompt:

onAuthPrompt
-----------------------------------------

This is a callback called when a webpage needs an HTTP authentication.
(SlimerJS only: not available in PhantomJS).

The callback accepts four arguments:

- ``type``: its value is ``'http'``
- ``url``: the url of the page that needs authentication
- ``realm``: the message indicating the realm
- ``credentials``: an object containing two properties, ``username`` and
  ``password``. You should modify these properties to indicate the username
  and the password.

The callback should return ``true`` if it accepts to authenticate, else
``false``.

To know more, see  :doc:`doc about http authentication with SlimerJS <../manual/http-authentication>`.

.. _webpage-onCallback:

onCallback
-----------------------------------------

Sometimes, you may need to pass values from the web page to the webpage object, at any time,
not only when you have to evaluate javascript code inside the web page.

From a script of the web page, you should then call the ``window.callPhantom()``
function, exposed by SlimerJs to the document. You can pass one argument to this function.
This argument is then passed to the function you set on ``webpage.onCallback``. This
callback can return a value which is then the returned value of ``window.callPhantom()``.

In your SlimerJS script:

.. code-block:: javascript

    page.onCallback = function(arg) {
        return arg + " world";
    }

In your web page:

.. code-block:: html

    <script>
      var returnedValue = window.callPhantom("hello");
      // returnedValue == "hello world"
    </script>

.. _webpage-onClosing:

onClosing
-----------------------------------------

function called when the browser is being closed, during a call of ``WebPage.close()``
or during a call of ``window.close()`` inside the web page. It receives the webpage object
as argument.

.. _webpage-onConfirm:

onConfirm
-----------------------------------------

This should be a function called when a dialog box asking a confirmation is opened by the
browser, typically when the web page call ``window.confirm('text')``. It may be called
also during some specific behavior, like during an ``beforeunload`` event.

The argument given to the callback is the text of the confirmation

Contrary to PhantomJS, SlimerJS can give also other arguments:

- the title of the dialog box
- the list of button labels (it may have until three labels) (optional)
- an object for the checkbox. Sometimes the browser may want to display a confirm dialog box
  with a checkbox. The object has a ``label`` property and a ``checked`` property that you
  should set to true or false.

If you have more than two buttons, your callback should return the button number (0, 1, 2,
0 being often the approval button),
else you can return true or false.

.. code-block:: javascript

    // simple callback
    page.onConfirm = function(text) {
        if (text == 'foo') {
            if (something) {
                return true;
            }
            return false;
        }
        return false;
    }

    // extended callback (SlimerJS only)
    page.onConfirm = function(text, title, buttons, checkbox) {
        if (buttons) {
            // this is an extended confirm dialog box
            // with a checkbox and/or with more than 2 buttons
            if (text == 'bar') {
                checkbox.checked = false
            }
            else if (buttons[0] === 'Leave Page') {
                // support of dialog box appearing during an "beforeunload" event
                return 0;
            }
            return 1;
        }
        else {
            if (text == 'foo') {
                return false;
            }
            return false;
        }
    }



.. _webpage-onConsoleMessage:

onConsoleMessage
-----------------------------------------

This callback is called when page scripts call the various console methods (console.log(),
console.info() etc.). This callback is ``not`` called when the Gecko engine itself outputs
information to the console - see :ref:`onError <webpage-onError>` for those messages.

The callback accepts six arguments:

- ``message``: a string containing the text of the message
- ``line``: the line number of the statement that calls the console method
- ``file``: the file name of the statement that calls the console method
- ``level``: the level of the message ('log', 'debug' etc...) (SlimerJS 0.10+ only)
- ``functionName``: the name of the function from which the message has been sent (SlimerJS 0.10+ only)
- ``timestamp``: the date of the message (SlimerJS 0.10+ only)

.. code-block:: javascript

    page.onConsoleMessage = function(message, line, file) {
        // Process message here
    };

If multiple arguments are given to ``console.log()``, the ``message`` argument contained
all arguments concatenated as a string.

.. _webpage-onLongRunningScript:

onLongRunningScript
-----------------------------------------
This function is called when there is slow or endless script on the page.
It receives message argument with information about the slow script. (SlimerJS only)
The script execution can be stopped using `stopJavaScript()` method.    

.. code-block:: javascript

    page.onLongRunningScript = function(message) {
        page.stopJavaScript();
    };

.. _webpage-onError:

onError
-----------------------------------------

This function is called when a javascript error appears in the web page. It receives
the error message and the stack trace (an array of objects indicating the file, the line...)

.. code-block:: javascript

    page.onError = function(message, stack) {
        
    };

.. _webpage-onFileDownload:

onFileDownload
-----------------------------------------

This callback is called when the browser askes to download a file.

The callback receives the url and data and should return
the path of the new created file.

.. _webpage-onFileDownloadError:

onFileDownloadError
-----------------------------------------

This function is called when an error appears when downloading file.
It receives the error message.


.. _webpage-onFilePicker:

onFilePicker
-----------------------------------------

This callback is called when the browser needs to open a file picker.
This is the case when a click is made on an ``<input type="file">`` element.

The callback receives the previous selected file, and should return
the path of the new selected file. If the target element accepts
several files, you can return an array of file path.

.. _webpage-onInitialized:

onInitialized
-----------------------------------------

This should be a function that is called when the loading of the page is initialized,
So before the content is loaded (before onLoadStarted).
It receives no arguments.

Note: It seems that it is not called at the same opening step as PhantomJS. In PhantomJS, its
implementation is a bit obscure. In PhantomJS, sometimes it is called twice, sometimes never,
and sometime only one time. We don't know why. We will try to match the same behavior
in future versions. For the moment, in SlimerJS, it is called twice: one time when the
browser is ready to load the page (webpage.url gives nothing), and one time when the content
of the page is loaded (webpage.url is set but resources are not loaded yet).

.. _webpage-onLoadFinished:

onLoadFinished
-----------------------------------------

This callback is called when the loading of the page is finished (including its resources
like images etc). It is called also after each the loading of a frame is finished.

It receives a string as argument. Its value is `"success"` if the loading is a success
else it receives `"fail"` if a network error occurred.

The loading is considered as a success when a correct HTTP response is received, with a
status code etc. It means that it receives `"success"` even in case of a 404 http error for
example.


.. code-block:: javascript

    page.onLoadFinished = function(status) {
        console.log('Status: ' + status);
        // Do other things here...
    };

In SlimerJS, you can receive additional arguments (that you don't have in PhantomJS):

- the URL of the content that is loaded
- a boolean indicating if it is a frame (true) or the main content (false)


.. code-block:: javascript

    page.onLoadFinished = function(status, url, isFrame) {
        console.log('Loading of '+url+' is a '+ status);
        if (!isFrame) {
           // this is the main content
        }
    };


.. _webpage-onLoadStarted:

onLoadStarted
-----------------------------------------

This callback is called when the loading of the page is starting or when an frame
inside the page is loading. In SlimerJS, it receives arguments contrary to PhantomJS:

- the URL of the content that is loaded
- a boolean indicating if it is a frame (true) or the main content (false)

.. code-block:: javascript

    page.onLoadStarted = function(url, isFrame) {
        console.log('Loading of '+url+' starts.');
        if (!isFrame) {
           // this is the main content
        }
    };

Note: It seems that it is not called at the same opening step as PhantomJS. In PhantomJS, its
implementation is a bit obscure and PhantomJS's documentation does not match the real
behavior. It seems it is called before the onInitialized call, before the
network process starts. We will try to match the same behavior in future versions.

.. _webpage-onNavigationRequested:

onNavigationRequested
-----------------------------------------

This callback is called when a navigation event happens in the page (a click on a link
or when a form is submitted, for example). It receives these arguments:

- ``url``: The target URL of this navigation event
- ``type``: indicate where the event comes from. Theorically, possible values are:
    'Undefined', 'LinkClicked', 'FormSubmitted', 'BackOrForward', 'Reload',
    'FormResubmitted', 'Other'
- ``willNavigate``: true if navigation will happen, false if it is locked (by :ref:`navigationLocked <webpage-navigationLocked>`)
- ``main``: Theorically, true if this event comes from the main frame, false if it comes from an
   iframe of some other sub-frame.

Because of lack of information in some API of Firefox, SlimerJS cannot give you
the ``type`` and the ``main`` value. They are always respectively ``'Undefined'`` and ``true``

Example:

.. code-block:: javascript

    page.onNavigationRequested = function(url, type, willNavigate, main) {
        console.log('Navigate to: ' + url);
    }
 

.. _webpage-onPageCreated:

onPageCreated
-----------------------------------------

This callback is invoked when a new child window (but not deeper descendant windows) is
created by the page, e.g. using ``window.open()``. The function receives the webpage
object corresponding to the new window.

.. code-block:: javascript

    page.onPageCreated = function(childPage) {
        console.log('a new window is opened');
    }


.. _webpage-onPrompt:

onPrompt
-----------------------------------------

This callback allows you to respond to a prompt dialog, opened by the webpage
with ``window.prompt()`` (in classical browsers, a dialog box with a field that the user
can fill). The function receives the message and the default value for the
response. It should return the response.

In your SlimerJS script:

.. code-block:: javascript

    page.onPrompt = function(question, defaultResponse) {
        return "Roger";
    }

In the web page:

.. code-block:: html

    <script>    
        var firstname = window.prompt("Type your firstname", "Bob");
        // firstname will be "Roger"
    </script>


.. _webpage-onResourceError:

onResourceError
-----------------------------------------
This callback is invoked when the browser received a network error about a resource.

The unique parameter received by the callback is an object containing this
information:
 
- ``id``: the number of the requested resource
- ``url``:  the url of the resource
- ``errorCode``: an error code (see possible values below)
- ``errorString``: the error message.
- ``status``: the response status if there is a response
- ``statusText``: the response status text if there is a response

Note that ``id`` will be null if the error code is ``105``.

List of supported error codes: (see `QNetworkReply codes in QT <http://qt-project.org/doc/qt-5.0/qtnetwork/qnetworkreply.html#NetworkError-enum>`_)

- ``1``: the remote server refused the connection (the server is not accepting requests)
- ``2``: the remote server closed the connection prematurely, before the entire reply
        was received and processed
- ``3``: the remote host name was not found (invalid hostname)
- ``4``: the connection to the remote server timed out
- ``5``: the operation was canceled via calls to abort() or close() before it was finished.
- ``6``: the SSL/TLS handshake failed and the encrypted channel could not be established. The sslErrors() signal should have been emitted.
- ``8``: the connection was broken due to disconnection from the network
           or failure to start the network.
- ``9``: the background request is not currently allowed due to platform policy.
- ``99``: an unknown network-related error was detected
- ``101``: the connection to the proxy server was refused (the proxy server is not accepting requests)
- ``103``: the proxy host name was not found (invalid proxy hostname)
- ``105``: the proxy requires authentication in order to honour the request but did not accept any credentials offered (if any)
- ``201``: the access to the remote content was denied (similar to HTTP error 401)
- ``203``: the remote content was not found at the server (similar to HTTP error 404)
- ``204``: the remote server requires authentication to serve the content but the
            credentials provided were not accepted (if any)
- ``301``: the Network Access API cannot honor the request because the protocol is not known
- ``399``: a breakdown in protocol was detected (parsing error, invalid or unexpected responses, etc.)

.. _webpage-onResourceReceived:

onResourceReceived
-----------------------------------------
This callback is invoked when the browser received a part of a resource. It can
be called several times with multiple chunk of data, during the load of this resource.
A resource can be the web page itself, or any other resources like
images, frames, css files etc.

The unique parameter received by the callback is an object containing this
information:
 
- ``id``: the number of the requested resource
- ``url``:  the url of the resource
- ``time``: a Date object
- ``headers``: the list of headers (list of objects ``{name:'', value:''}``)
- ``bodySize``: the size of the received content (may increase during multiple call of the callback)
- ``contentType``: the content type of the resource
- ``contentCharset``: the charset used for the content of the resource
- ``redirectURL``: if the request has been redirected, this is the redirected url
- ``stage``: "start", "end" or "" for intermediate chunk of data
- ``status``: the HTTP response code (200..)
- ``statusText``: the HTTP response text for the status ("Ok"...)
- ``referrer``: the referer url (slimerjs only)
- ``body``: the content, it may change during multiple call for the same request (slimerjs only).
- ``httpVersion.major``: the major part of the HTTP protocol version.
- ``httpVersion.minor``: the minor part of the HTTP protocol version.
- ``isFileDownloading``: the value is true when file is downloading (slimerjs only).


.. code-block:: javascript

    page.onResourceReceived = function(response) {
        console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
    };

*Note about the ``body`` property*: by default, the ``body`` property is filled only for
the resource that corresponds to the main html page. For other resources, it will be empty.

If you want to have it filled for resources used in the page, you have to indicate their
content type into :ref:`captureContent property <webpage-captureContent>`. This limitation
exists to avoid to take memory uselessly (in the case where you don't need the ``body``
property), since resources like images or videos could take many memory.

.. _webpage-onResourceRequested:

onResourceRequested
-----------------------------------------

This callback is invoked when the browser starts to load a resource.
A resource can be the web page itself, or any other resources like
images, frames, css files etc.

The callback may accept two parameters :

- ``requestData``, a metadata object containing information about the resource
- ``networkRequest``, an object to manipulate the network request.

.. code-block:: javascript

    page.onResourceRequested = function(requestData, networkRequest) {
        console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
    };

Properties of ``requestData`` are:

- ``id``: the number of the requested resource
- ``method``: the http method ("get", "post"..)
- ``url``: the url of the resource
- ``time``: a Date object
- ``headers``: the list of headers (list of objects ``{name:'', value:''}``)
- ``postData``: a string containing the body of the request, when method is "post" or "put" (SlimerJS 0.9) or "patch" (SlimerJS 1.0)

The ``networkRequest`` object has two methods:

- ``abort()``: call it to cancel the request. ``onResourceReceived`` and ``onLoadFinished``
   will be called.
- ``changeUrl(url)``: abort the current request and do an immediate redirection to
   the given url.
- ``setHeader(key, value, merge)``: allows you to set an header on the HTTP request. If
  value is ``null`` or an empty string, the header will be removed. The ``merge`` parameter
  (only available on SlimerJS), is a boolean: ``true`` to merge the given value with an
  existing value for this header. If ``false``, the old value is replaced by the new one.
  (Introduced: SlimerJS 0.9)


.. _webpage-onResourceTimeout:

onResourceTimeout
-----------------------------------------

This callback is invoked when a resource takes too long time to load,
when webpage.settings.resourceTimeout is set.

The function receives an object containing these properties:

- ``id``: the number of the requested resource
- ``url``:  the url of the resource
- ``time``: a Date object
- ``headers``: the list of headers (list of objects ``{name:'', value:''}``)
- ``method``: the http method ("get", "post"..)
- ``errorCode``: an error code: 408
- ``errorString`` the error message.


.. _webpage-onUrlChanged:

onUrlChanged
-----------------------------------------

This callback is invoked when the main URL of the browser changes, so when a new document
will be loaded. The only argument to the callback is the new URL.

Example:

.. code-block:: javascript

    page.onUrlChanged = function(targetUrl) {
        console.log('New URL: ' + targetUrl);
    };

To retrieve the old URL, use the onLoadStarted callback.


Internal methods
=================

.. _webpage-closing:

closing(page)
-----------------------------------------

Call the callback :ref:`onClosing <webpage-onClosing>`  with given
parameters, if the callback has been set.

.. _webpage-initialized:

initialized()
-----------------------------------------

Call the callback :ref:`onInitialized <webpage-onInitialized>` if it has been set.
 

.. _webpage-javaScriptAlertSent:

javaScriptAlertSent( message)
-----------------------------------------

Call the callback  :ref:`onAlert <webpage-onAlert>` with given
parameters, if the callback has been set.



.. _webpage-javaScriptConsoleMessageSent:

javaScriptConsoleMessageSent( message, lineNumber, fileName)
------------------------------------------------------------

Call the callback  :ref:`onConsoleMessage <webpage-onConsoleMessage>` with given
parameters, if the callback has been set.


.. _webpage-loadFinished:

loadFinished(status, url, isFrame)
-----------------------------------------
Call the callback :ref:`onLoadFinished <webpage-onLoadFinished>` with given
parameters, if the callback has been set.


.. _webpage-loadStarted:

loadStarted(url, isFrame)
-----------------------------------------

Call the callback :ref:`onLoadStarted <webpage-onLoadStarted>` with given
parameters, if the callback has been set.


.. _webpage-navigationRequested:

navigationRequested(url, navigationType, willNavigate, isMainFrame)
--------------------------------------------------------------------

Call the callback  :ref:`onNavigationRequested <webpage-onNavigationRequested>` with given
parameters, if the callback has been set.

.. _webpage-rawPageCreated:

rawPageCreated(page)
-----------------------------------------

Call the callback :ref:`onPageCreated <webpage-onPageCreated>` with given
parameters, if the callback has been set.


.. _webpage-resourceError:

resourceError(response)
-----------------------------------------

Call the callback :ref:`onResourceError <webpage-onResourceError>`  with given
parameters, if the callback has been set.

.. _webpage-resourceReceived:

resourceReceived(response)
-----------------------------------------

Call the callback :ref:`onResourceReceived <webpage-onResourceReceived>`  with given
parameters, if the callback has been set.


.. _webpage-resourceRequested:

resourceRequested(requestData, networkRequest)
----------------------------------------------

Call the callback :ref:`onResourceRequested <webpage-onResourceRequested>` with given
parameters, if the callback has been set.


.. _webpage-urlChanged:

urlChanged(url)
-----------------------------------------

Call the callback :ref:`onUrlChanged <webpage-onUrlChanged>` with given
parameters, if the callback has been set.

 



