.. index:: Release notes


=============================
Release Notes of SlimerJS 0.8
=============================

version 0.8.5
=============

SlimerJS 0.8.5 has been released on November 24th, 2013.

Fixed bugs
----------

- Http response object of the embedded webserver did not take care correctly of unicode
  characters (issue #106)
- Fixed output on Windows: console messages are now output in real time, not any more at the
  end of the execution of the script. (issue #105 and issue #7)
- Fixed an error when the virtual file picker is called by the web page
- Fixed an issue in network listeners: onResourceResponse may not called with Gecko 24
- Fixed an exception when opening a page whereas navigation is locked (issue #114)
- Should supports scripts starting with a shebang (issue #121)


version 0.8.4
=============

SlimerJS 0.8.4 has been released on October 23th, 2013.

Fixed bugs
----------

- Fix slimerjs.bat that did not work anymore (issue #84)
- redirection were not well supported when the requested URL is changed by the server
  by adding a trailing slash (issue #90)
- fixed ``webpage.plainText``: content of invisible and script elements should not be return (issue #97)
  A flag ``plainTextAllContent`` in settings allow to have the previous behavior.
- The webserver supports now asynchronous responses. **warning**: be sure to call the ``close()`` method
  on the response when you finished to write data, **in any case** (synchronous or asynchronous
  response processing) (issue #91)

version 0.8.3
=============

SlimerJS 0.8.3 has been released on September 17th, 2013.

Improvements
------------

- new method ``slimer.wait()``
- Improve performance of ``webpage.render()``
- ``--debug=true`` now displays arguments of the script and SlimerJS's configuration

Fixed bugs
----------
- ``require.paths`` should accept relative paths (issue #73)
- zoom and scroll issues in ``webpage.render()`` (issue #75)
- ``webpage.viewportSize`` should be applied when reopening the webpage (issue #82)


version 0.8.2
=============

SlimerJS 0.8.2 has been released on August 18th, 2013.

Fixed bugs
----------

- There was no error when trying to execute a file that is not a JS file (issue #67)
- Errors appearing during the execution of the callback of ``webpage.open()`` are now displayed
- On website with a redirection to a relative URL (without domain), redirection was not taken
  account and ``onLoadFinished`` was never called (#68).

Fixed PhantomJS conformance issues
----------------------------------

- webpage.clipRect should not be null by default.
- ``webpage.render()`` now generates screenshot of the full webpage, instead of the
  viewport area and take care about scrolling.
- scrollbars have been removed from the window.

Improvements
------------

- new option for ``webpage.render()``: ``onlyViewport``. You can then take a screenshot
  only of the viewport.
- support of the command ligne arguments ``--debug=true``. It does not display yet everything.


version 0.8.1
=============

SlimerJS 0.8.1 has been released on August 1st, 2013.

Fixed bugs
----------

- ``webpage.render()`` should create directories indicated in the given path (issue #51)
- Fixed many issues appearing when running SlimerJS under windows
    - Fixed some errors in ``slimerjs.bat``
    - Fixed module loading with path containing slashes (#61)
    - Fixed issue with ``phantom.libraryPath`` and ``webpage.libraryPath`` with path containing slashes
    - Fixed other path issues (#65)
    - Fixed issues with Cygwin (#4)
    - Fixed some unit tests
- Improved documentation

version 0.8
===========

SlimerJS 0.8.0 has been released on July 7st, 2013.

The compatibility with PhantomJS has been strongly increased and
some tools like CasperJS (version 1.1beta1 or higher) work almost
perfectly with SlimerJS 0.8.

Some packages of SlimerJS 0.8 embed directly XulRunner 22 (Gecko 22):
you don't have to install XulRunner or Firefox separately, nor
to set a SLIMERJSLAUNCHER environment variable. Unless you want to
use a different version of Gecko.

SlimerJS 0.8 should be also compatible with Firefox/XulRunner/Gecko 23
and 24.

New API
-------

- Implementation of ``webpage.uploadFile()`` and support of ``webpage.onFilePicker``
- Implementation of the cookie API on the ``phantom`` object
- Implementation of the cookie API on the ``webpage`` object
- support of the ``--load-images`` option on the command line
- support of the ``--local-storage-quota`` option on the command line
- support of ``javascriptEnabled`` and ``loadImages`` in settings
- Implementation of ``webpage.ownsPage``, ``webpage.getPage()``, ``webpage.pages``, ``webpage.pagesWindowName``
- Implementation of ``webpage.scrollPosition``
- Implementation of ``webpage.offlineStoragePath`` and  ``webpage.offlineStorageQuota``

Fixed bugs
----------

- ``webpage.evaluate()``: functions as arguments for the function to evaluate,
  were not passed correctly to it.
- Fixed conformance to CommonJS filesystem/A module in ``fs.directory()``
- Fixed ``webpage.render()`` and ``webpage.renderBase64()``: default screenshot
  size were not well calculated.
- Fixed bad encoding of responses sent by the http server

Fixed PhantomJS conformance issues
----------------------------------

- ``webpage.evaluate()`` should return null when the result of the
  given javascript function is undefined.
- Added ``webpage.objectName`` and ``webserver.objectName``.
- ``phantom.injectJs()`` supports now CoffeeScripts scripts.
- ``window.callPhantom()`` can now be called during page loading.
- Changed ``webpage.event.modifiers`` to ``webpage.event.modifier``.
- After creating a ``webpage``, evaluating javascript should be possible.
  The window is now opened immediately with about:blank when calling create().
- ``webpage.onResourceRequested`` should receive a request object as second parameter
- ``webpage.setContent()`` should be able to receive a DOM element, not only a string
- ``webpage.onResourceRequested`` and ``webpage.onResourceReceived`` should
  be called for 'file://' url.
- Fixed ``webpage.render()`` and ``webpage.renderBase64()``: support of options parameters


Missing APIS in SlimerJS 0.8
----------------------------

Here are the PhantomJS APIs that are missing in SlimerJS 0.8 but planed in future releases.

- most of options for the command line are not supported
- no support of all settings on the webpage object, so no support of HTTP authentication...
- no support of Ghost Driver (Selenium web driver)

You can read the `compatibility table <https://github.com/laurentj/slimerjs/blob/master/API_COMPAT.md>`_ to know details.

See also :doc:`the differences in APIs and behaviors <differences-with-phantomjs>` between
SlimerJS and PhantomJS.

Known issues
------------

- See `the github page <https://github.com/laurentj/slimerjs/issues>`_ ...


Previous release notes
======================

.. toctree::
   :maxdepth: 1
   
   release-notes-0.7
   release-notes-0.6

