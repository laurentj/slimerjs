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

Note: most of properties and methods are implemented, but not documented. Help us to document them ;-)


Webpage object
==============

Properties list:

:ref:`clipRect <webpage-clipRect>` :ref:`canGoBack <webpage-canGoBack>` :ref:`canGoForward <webpage-canGoForward>`
:ref:`content <webpage-content>` :ref:`cookies <webpage-cookies>` :ref:`customHeaders <webpage-customHeaders>`
:ref:`event <webpage-event>` :ref:`focusedFrameName <webpage-focusedFrameName>` :ref:`frameContent <webpage-frameContent>`
:ref:`frameName <webpage-frameName>` :ref:`framePlainText <webpage-framePlainText>` :ref:`frameTitle <webpage-frameTitle>`
:ref:`frameUrl <webpage-frameUrl>` :ref:`framesCount <webpage-framesCount>` :ref:`framesName <webpage-framesName>`
:ref:`libraryPath <webpage-libraryPath>` :ref:`navigationLocked <webpage-navigationLocked>`
:ref:`offlineStoragePath <webpage-offlineStoragePath>` :ref:`offlineStorageQuota <webpage-offlineStorageQuota>`
:ref:`ownsPages <webpage-ownsPages>` :ref:`pages <webpage-pages>` :ref:`pagesWindowName <webpage-pagesWindowName>`
:ref:`paperSize <webpage-paperSize>` :ref:`plainText <webpage-plainText>` :ref:`scrollPosition <webpage-scrollPosition>`
:ref:`settings <webpage-settings>` :ref:`title <webpage-title>` :ref:`url <webpage-url>`
:ref:`viewportSize <webpage-viewportSize>` :ref:`windowName <webpage-windowName>` :ref:`zoomFactor <webpage-zoomFactor>`

Functions list:

:ref:`addCookie() <webpage-addCookie>` :ref:`childFramesCount() <webpage-childFramesCount>` :ref:`childFramesName() <webpage-childFramesName>` 
:ref:`clearCookies() <webpage-clearCookies>` :ref:`close() <webpage-close>` :ref:`currentFrameName() <webpage-currentFrameName>` 
:ref:`deleteCookie() <webpage-deleteCookie>` :ref:`evaluateJavaScript() <webpage-evaluateJavaScript>` :ref:`evaluate() <webpage-evaluate>` 
:ref:`evaluateAsync() <webpage-evaluateAsync>` :ref:`getPage() <webpage-getPage>` :ref:`go() <webpage-go>` 
:ref:`goBack() <webpage-goBack>` :ref:`goForward() <webpage-goForward>` :ref:`includeJs() <webpage-includeJs>` 
:ref:`injectJs() <webpage-injectJs>` :ref:`open() <webpage-open>` :ref:`openUrl() <webpage-openUrl>` 
:ref:`release() <webpage-release>` :ref:`reload() <webpage-reload>` :ref:`render() <webpage-render>` 
:ref:`renderBase64() <webpage-renderBase64>` :ref:`sendEvent() <webpage-sendEvent>` 
:ref:`setContent() <webpage-setContent>` :ref:`stop() <webpage-stop>` :ref:`switchToFocusedFrame() <webpage-switchToFocusedFrame>` 
:ref:`switchToFrame() <webpage-switchToFrame>` :ref:`switchToChildFrame() <webpage-switchToChildFrame>` 
:ref:`switchToMainFrame() <webpage-switchToMainFrame>`
:ref:`switchToParentFrame() <webpage-switchToParentFrame>` :ref:`uploadFile() <webpage-uploadFile>`

Callbacks list:

:ref:`onAlert <webpage-onAlert>` :ref:`onCallback <webpage-onCallback>` :ref:`onClosing <webpage-onClosing>` 
:ref:`onConfirm <webpage-onConfirm>` :ref:`onConsoleMessage <webpage-onConsoleMessage>` :ref:`onError <webpage-onError>` 
:ref:`onFilePicker <webpage-onFilePicker>` :ref:`onInitialized <webpage-onInitialized>` :ref:`onLoadFinished <webpage-onLoadFinished>` 
:ref:`onLoadStarted <webpage-onLoadStarted>` :ref:`onNavigationRequested <webpage-onNavigationRequested>` :ref:`onPageCreated <webpage-onPageCreated>` 
:ref:`onPrompt <webpage-onPrompt>` :ref:`onResourceRequested <webpage-onResourceRequested>` :ref:`onResourceReceived <webpage-onResourceReceived>` 
:ref:`onUrlChanged <webpage-onUrlChanged>`

Internal methods to trigger callbacks:

:ref:`closing() <webpage-closing>` :ref:`initialized() <webpage-initialized>` 
:ref:`javaScriptAlertSent() <webpage-javaScriptAlertSent>` :ref:`javaScriptConsoleMessageSent() <webpage-javaScriptConsoleMessageSent>`
:ref:`loadFinished() <webpage-loadFinished>` 
:ref:`loadStarted() <webpage-loadStarted>` :ref:`navigationRequested() <webpage-navigationRequested>` :ref:`rawPageCreated() <webpage-rawPageCreated>` 
:ref:`resourceReceived() <webpage-resourceReceived>` :ref:`resourceRequested() <webpage-resourceRequested>` :ref:`urlChanged() <webpage-urlChanged>` 



.. _webpage-clipRect:

clipRect
-----------------------------------------



.. _webpage-canGoBack:

canGoBack
-----------------------------------------



.. _webpage-canGoForward:

canGoForward
-----------------------------------------



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

If cookies are disabled, modifying this property does nothing.

Be careful about `the inconsistent behavior of the expiry property <cookies.html#expires>`_.

.. _webpage-customHeaders:

customHeaders
-----------------------------------------

.. index:: customHeaders

This property is an object defining additionnal HTTP headers that will be send
with each HTTP request, both for pages and resources.

Example:

.. code-block:: javascript

    webpage.customHeaders = {
        "foo": "bar"
    }


To define user agent, prefer to use ``webpage.settings.userAgent``

.. _webpage-event:

event
-----------------------------------------



.. _webpage-focusedFrameName:

focusedFrameName
-----------------------------------------



.. _webpage-frameContent:

frameContent
-----------------------------------------

This property contain the source code of the current frame.
You can set this property with the source code of an HTML page
to replace the content of the current frame.


.. _webpage-frameName:

frameName
-----------------------------------------



.. _webpage-framePlainText:

framePlainText
-----------------------------------------



.. _webpage-frameTitle:

frameTitle
-----------------------------------------



.. _webpage-frameUrl:

frameUrl
-----------------------------------------



.. _webpage-framesCount:

framesCount
-----------------------------------------



.. _webpage-framesName:

framesName
-----------------------------------------



.. _webpage-libraryPath:

libraryPath
-----------------------------------------



.. _webpage-navigationLocked:

navigationLocked
-----------------------------------------



.. _webpage-offlineStoragePath:

offlineStoragePath
-----------------------------------------



.. _webpage-offlineStorageQuota:

offlineStorageQuota
-----------------------------------------



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



.. _webpage-plainText:

plainText
-----------------------------------------



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

- ``javascriptEnabled`` (not supported yet)
- ``javascriptCanCloseWindows``  (not supported yet)
- ``javascriptCanOpenWindows``  (not supported yet)
- ``loadImages``  (not supported yet)
- ``localToRemoteUrlAccessEnabled``  (not supported yet)
- ``maxAuthAttempts``  (not supported yet)
- ``password``  (not supported yet)
- ``userAgent``: string to define the user Agent in HTTP requests. By default, it is
  something like ``"Mozilla/5.0 (X11; Linux x86_64; rv:21.0) Gecko/20100101 SlimerJS/0.7"``
  (depending of the version of Firefox/XulRunner you use)
- ``userName``  (not supported yet)
- ``XSSAuditingEnabled``  (not supported yet)
- ``webSecurityEnabled``  (not supported yet)

.. code-block:: javascript

    page.settings.userAgent = "My Super Agent / 1.0"

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



.. _webpage-windowName:

windowName
-----------------------------------------



.. _webpage-zoomFactor:

zoomFactor
-----------------------------------------



.. _webpage-addCookie:

addCookie(cookie)
-----------------------------------------

Add a cookie in the cookies storage of the current profile, for the
current url. The parameter is :doc:`a Cookie object <cookie>`.
The domain and the path of the cookie will be set to the domain
and the path of the current url.

It returns true if the cookie has been really added. If cookies are
disabled, the cookie is not added into the cookie database.

Be careful about `the inconsistent behavior of the expiry property <cookies.html#expires>`_.


.. _webpage-childFramesCount:

childFramesCount()
-----------------------------------------



.. _webpage-childFramesName:

childFramesName()
-----------------------------------------

 

.. _webpage-clearCookies:

clearCookies()
-----------------------------------------

Delete all cookies corresponding to the current url.


.. _webpage-close:

close()
-----------------------------------------



.. _webpage-currentFrameName:

currentFrameName()
-----------------------------------------

 

.. _webpage-deleteCookie:

deleteCookie(cookiename)
-----------------------------------------

It deletes all cookies that have the given name and corresponding
to the current url.

It returns true if some cookies have been deleted.
It works only if cookies are enabled.

.. _webpage-evaluateJavaScript:

evaluateJavaScript()
-----------------------------------------



.. _webpage-evaluate:

evaluate()
-----------------------------------------

 

.. _webpage-evaluateAsync:

evaluateAsync()
-----------------------------------------



.. _webpage-getPage:

getPage(windowName)
-----------------------------------------

This methods returns the child page that matches the given "window.name".

Only children opened when ownsPage was true are checked.

.. _webpage-go:

go()
-----------------------------------------

 

.. _webpage-goBack:

goBack()
-----------------------------------------



.. _webpage-goForward:

goForward()
-----------------------------------------



.. _webpage-includeJs:

includeJs()
-----------------------------------------

 

.. _webpage-injectJs:

injectJs()
-----------------------------------------



.. _webpage-open:

open(url...)
-----------------------------------------

.. index:: open, promise

This method allows to open a page into a virtual browser.

Since this operation is asynchronous, you cannot do something on
the page after the call of ``open()``. You should provide a callback
or you should use the returned promise (not compatible with PhantomJS),
to do something on the loaded page. The callback or the promise receives
a string "success" if the loading has been succeded.

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

Example with the returned promise (not compatible with PhantomJS):

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

With the promise, it's better in term of code (not compatible with PhantomJS):

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

**Other arguments:**

The ``open()`` method accepts several arguments:

- ``open(url)``
- ``open(url, callback)``
- ``open(url, httpConf)``
- ``open(url, httpConf, callback)``
- ``open(url, operation, data)``
- ``open(url, operation, data, callback)``
- ``open(url, operation, data, headers, callback)``

Remember that in all cases, the method returns a promise.

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
  doesn't replace ``webpage.customHeaders``. It allows you to specify additionnal headers
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



.. _webpage-render:

render()
-----------------------------------------

 
.. _webpage-renderBase64:

renderBase64()
-----------------------------------------



.. _webpage-sendEvent:

sendEvent()
-----------------------------------------

 

.. _webpage-setContent:

setContent(content, url)
-----------------------------------------

This method allows to replace the content of the current page
with the given HTML source code. The URL indicates the url
of this new content.


.. _webpage-stop:

stop()
-----------------------------------------

It stops the loading of the page.

.. _webpage-switchToFocusedFrame:

switchToFocusedFrame()
-----------------------------------------

 

.. _webpage-switchToFrame:

switchToFrame()
-----------------------------------------



.. _webpage-switchToChildFrame:

switchToChildFrame()
-----------------------------------------


.. _webpage-switchToMainFrame:

switchToMainFrame()
-----------------------------------------



.. _webpage-switchToParentFrame:

switchToParentFrame()
-----------------------------------------



.. _webpage-uploadFile:

uploadFile(selector, filename)
-----------------------------------------

A form may content an ``<input type="file">`` element. Of course, because
SlimerJs is a scriptable browser, you cannot manipulate the file picker
opened when you click on this element. ``uploadFile()`` allows you to set the
value of such elements.

Arguments are the CSS selector of the input element, and the full path of the file.
The file must exist. You can also indicate an array of path, if the input element
accepts several files.

Note that a virtual file picker is opened when calling ``uploadFile()``, and
so the ``onFilePicker`` callback is called. If this callback exists and
returns a filename, the filename given to ``uploadFile()`` is ignored.

.. _webpage-onAlert:

onAlert
-----------------------------------------



.. _webpage-onCallback:

onCallback
-----------------------------------------



.. _webpage-onClosing:

onClosing
-----------------------------------------

 

.. _webpage-onConfirm:

onConfirm
-----------------------------------------



.. _webpage-onConsoleMessage:

onConsoleMessage
-----------------------------------------



.. _webpage-onError:

onError
-----------------------------------------

 

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



.. _webpage-onLoadFinished:

onLoadFinished
-----------------------------------------

 

.. _webpage-onLoadStarted:

onLoadStarted
-----------------------------------------



.. _webpage-onNavigationRequested:

onNavigationRequested
-----------------------------------------



.. _webpage-onPageCreated:

onPageCreated
-----------------------------------------

 

.. _webpage-onPrompt:

onPrompt
-----------------------------------------


.. _webpage-onResourceReceived:

onResourceReceived
-----------------------------------------
This callback is invoked when the browser received a part of a resource. It can
be called several times with multiple chunk of data, during the load of this resource.
A resource can be the web page itself, or any other resources like
images, frames, css files etc.

The unique parameter received by the callback is an object containing these
informations:
 
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


.. code-block:: javascript

    page.onResourceReceived = function(response) {
        console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
    };




.. _webpage-onResourceRequested:

onResourceRequested
-----------------------------------------

This callback is invoked when the browser starts to load a resource.
A resource can be the web page itself, or any other resources like
images, frames, css files etc.

The callback may accept two parameters :

- ``requestData``, a metadata object containing informations about the resource
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

The ``networkRequest`` object has two methods:

- ``abort()``: call it to cancel the request. ``onResourceReceived`` and ``onLoadFinished``
   will be called.
- ``changeUrl(url)``: abort the current request and do an immediate redirection to
   the given url.


.. _webpage-onUrlChanged:

onUrlChanged
-----------------------------------------


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

javaScriptAlertSent(message)
-----------------------------------------

Call the callback  :ref:`onAlert <webpage-onAlert>` with given
parameters, if the callback has been set.



.. _webpage-javaScriptConsoleMessageSent:

javaScriptConsoleMessageSent(message, lineNumber, fileName)
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

 



