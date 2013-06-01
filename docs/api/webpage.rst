
=======
webpage
=======


Documentation soon. Please help us to fill this page :-)


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



.. _webpage-cookies:

cookies
-----------------------------------------



.. _webpage-customHeaders:

customHeaders
-----------------------------------------

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



.. _webpage-pages:

pages
-----------------------------------------



.. _webpage-pagesWindowName:

pagesWindowName
-----------------------------------------



.. _webpage-paperSize:

paperSize
-----------------------------------------



.. _webpage-plainText:

plainText
-----------------------------------------



.. _webpage-scrollPosition:

scrollPosition
-----------------------------------------



.. _webpage-settings:

settings
-----------------------------------------

This property allows to set some options for the load of a page.
Changing them after the load has no effect.

- ``javascriptEnabled`` (not supported yet)
- ``javascriptCanCloseWindows``  (not supported yet)
- ``javascriptCanOpenWindows``  (not supported yet)
- ``loadImages``  (not supported yet)
- ``localToRemoteUrlAccessEnabled``  (not supported yet)
- ``maxAuthAttempts``  (not supported yet)
- ``password``  (not supported yet)
- ``userAgent``: string to define the user Agent in HTTP requests
- ``userName``  (not supported yet)
- ``XSSAuditingEnabled``  (not supported yet)
- ``webSecurityEnabled``  (not supported yet)

.. code-block:: javascript

    webpage.settings.userAgent = "My Super Agent / 1.0"


.. _webpage-title:

title
-----------------------------------------

It allows to retrieve the title of the loaded page. (Readonly)

.. _webpage-url:

url
-----------------------------------------



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

addCookie()
-----------------------------------------



.. _webpage-childFramesCount:

childFramesCount()
-----------------------------------------



.. _webpage-childFramesName:

childFramesName()
-----------------------------------------

 

.. _webpage-clearCookies:

clearCookies()
-----------------------------------------



.. _webpage-close:

close()
-----------------------------------------



.. _webpage-currentFrameName:

currentFrameName()
-----------------------------------------

 

.. _webpage-deleteCookie:

deleteCookie()
-----------------------------------------



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

getPage()
-----------------------------------------



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

open()
-----------------------------------------



.. _webpage-openUrl:

openUrl()
-----------------------------------------

 

.. _webpage-release:

release()
-----------------------------------------



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

setContent()
-----------------------------------------



.. _webpage-stop:

stop()
-----------------------------------------



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

uploadFile()
-----------------------------------------


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



.. _webpage-onResourceRequested:

onResourceRequested
-----------------------------------------



.. _webpage-onResourceReceived:

onResourceReceived
-----------------------------------------

 

.. _webpage-onUrlChanged:

onUrlChanged
-----------------------------------------


.. _webpage-closing:

closing()
-----------------------------------------



.. _webpage-initialized:

initialized()
-----------------------------------------

 

.. _webpage-javaScriptAlertSent:

javaScriptAlertSent()
-----------------------------------------



.. _webpage-javaScriptConsoleMessageSent:

javaScriptConsoleMessageSent()
-----------------------------------------



.. _webpage-loadFinished:

loadFinished()
-----------------------------------------

 

.. _webpage-loadStarted:

loadStarted()
-----------------------------------------



.. _webpage-navigationRequested:

navigationRequested()
-----------------------------------------



.. _webpage-rawPageCreated:

rawPageCreated()
-----------------------------------------

 

.. _webpage-resourceReceived:

resourceReceived()
-----------------------------------------



.. _webpage-resourceRequested:

resourceRequested()
-----------------------------------------



.. _webpage-urlChanged:

urlChanged()
-----------------------------------------

 



