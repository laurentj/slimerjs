
==========================
Differences with PhantomJS
==========================

There are some differences between SlimerJS and PhantomJS 1.9.x
although we tried to implement the same behaviors of PhantomJS APIs.

PhantomsJS is built on top of Webkit and JavascriptCore (like Safari)
and SlimerJS is built on top of Gecko and SpiderMonkey (like Firefox).

Many of differences come from differences between these two
web platforms, Webkit and Gecko. So we couldn't suppress these
differences in SlimerJS. There are also some few differences that exist
in the API because it was our choice.

So here are some of these differences. This list is not exhaustive of course!
We found most of them during the port of CasperJS on SlimerJS.


Javascript Engine
------------------

- SlimerJS' javascript engine implements most of ES6 features
- The property ``name`` on JS functions is read only in Gecko.
- Error message for a ``ReferenceError`` is not strictly equal between Gecko and Webkit.
- The name of an exception for a syntax error is ``"SyntaxError"`` in gecko, and ``"SYNTAX_ERR"``
  for Webkit
- PhantomJS has hacked the ``Error`` object in QTWebkit, to add a ``stackArray`` property.
  Of course, this property does not exist in the SpiderMonkey implementation, but it
  has a `stack property <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack>`_.
  So you should use it if ``stackArray`` is not present.

DOM
----

- In Gecko, the value of a ``<input type=file>`` is only the filename.
  PhantomJS generates a path starting with ``c:\\fakepath\\``.
- Contrary to PhantomJs/Webkit, Gecko does not support the non-standard property
  ``innerText`` on DOM elements.
- Using ``typeof`` on a window object returns ``"window"`` with PhantomJS/Webkit,
  and ``"domwindow"`` in Gecko.
- ``"javascript:"`` links are executed asynchronously in Gecko
- Gecko does not support these non-standard properties on events: ``x`` and ``y``
  The equivalent standard properties are ``clientX`` and ``clientY``.
- Changing the viewport is done asynchronously in Gecko, so ``webpage.viewportSize``
  is done asynchronously in SlimerJS
- A ``content`` variable exists in SlimerJS, in scripts, because of `window.content <https://developer.mozilla.org/en-US/docs/Web/API/Window.content>`.
  Remember that a script is executed in the context of a ``about:blank`` page.

Network
--------

- It seems that Gecko has a different behavior than Phantomjs's webkit
  on some HTTP response with code 102, 118 and 408. It response.status is null, it is probably
  because of one of this response code.
- PhantomJS doesn't do redirections, whereas SlimerJS does.
- When PhantomJS receives a redirection as HTTP response, it doesn't call the
  ``onResponseReceive`` with the ``start`` status. SlimerJS calls it.
- When doing manual redirections (by calling ``changeUrl()`` on the request object),
  SlimerJS (Gecko) create a request, then cancels it and create a second request, so
  your ``onResponseReceive`` is called for the two requests.. PhantomJS just reuse the
  same request.
- If the url given to webpage.open() is malformed, PhantomJS calls the callback
  with "success" whereas SlimerJS calls it with "fail"

In the API
-----------

- The main script is considered as a module, for more security and to be compatible with Mozilla modules. So ``this`` is not ``window`` and there is an ``exports``
  object.
- ``webpage.sendEvent()`` for key events is more consistent. In PhantomJS, there are `several issues <https://github.com/ariya/phantomjs/issues/11094>`_.
- ``webpage.open()`` returns `a promise <https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/core/promise.html>`_.
  It's easier to chain things executed asynchronously
- The call of ``webpage.open()`` (or ``openUrl()``), in PhantomJS, ends when the load is
  starting. But in SlimerJS it ends almost immediately because it should open a real window
  before the loading and it is done asynchronously. So probably some properties will not
  be available immediately after the call of ``open()`` in SlimerJS.
- It seems that the call of listeners during the page loading is not done at the same step
  between PhantomJS and SlimerJS. Implementation in PhantomJS is a bit obscure.
- ``webpage.open()`` and ``openUrl()`` support only "GET" and "POST" operation in SlimerJS, no "PUT" nor "DELETE" operations. 
- The webserver object has more methods to configure it easily
- ``toString()`` on a webpage object returns "qtruntimeobject" in PhantomJS
  and "Object" in SlimerJS. There are no way to change this behavior in SlimerJS
  (it is developped in pure Javascript). So to test if a given object is a
  ``webpage`` object in SlimerJS, you should test a specific property ``__type``.
  Its value is then "qtruntimeobject" (to mimic PhantomJS).
- PhantomJS has a strange behavior on ``fs.read()`` : it seems it reads
  files always as binary files. However SlimerJS's ``fs.read()`` strictly
  respect the 'b' flag parameter.
- The module system has a different behavior than PhantomJS's one
   - global variables declared in the main script are not accessible in
     modules loaded with ``require``
   - Modules are completely impervious. They are executed in a truly javascript
     sandbox
   - Modules must be files, not folders.
   - SlimerJS provides ``require.paths``
- ``phantom.exit()`` or ``slimer.exit()`` is done asynchronously. Your script may continue after
   the call of these methods. You can use ``slimer.isExiting()`` to control your processing.
- The callback ``webpage.onNavigationRequest`` receives bad parameters.
  Don't rely on the ``navigationType`` and the ``isMainFrame`` values (because of
  some limitations in the Gecko API).
- Callbacks ``webpage.onLoadStarted`` and ``webpage.onLoadFinished`` receive additional
  parameters in SlimerJS (the url, a boolean indicated if it is in a frame...)
- You can output binary content on the standard output stream (weither with
  ``fs.open('/dev/stdout')``, ``webpage.render('/dev/stdout')`` or ``system.stdout``)

Some few PhantomJS features are still missing in SlimerJS. See release notes.

