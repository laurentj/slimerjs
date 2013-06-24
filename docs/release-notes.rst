.. index:: Release notes


=============
Release Notes
=============

version 0.8
===========

This version is in development.

This version can be used with Firefox 24.

Fixed PhantomJS conformance issues
----------------------------------

- ``webpage.evaluate()`` should return null when the result of the
  given javascript function is undefined.
- Added ``webpage.objectName`` and ``webserver.objectName``
- ``phantom.injectJs()`` supports now CoffeeScripts scripts.
- ``window.callPhantom()`` can now be called during page loading
- Changed ``webpage.event.modifiers`` to ``webpage.event.modifier``


version 0.7
===========

SlimerJS 0.7 has been released on June 10, 2013.

Many improvements have been made to have a better compatibility with
PhantomJS, although it is not 100% compatible yet.

New API
-------

- Implementation of ``require.paths``, a list of paths where modules can be found (CommonJS modules 1.1 specification)
- Implementation of ``require.globals``, an object which can contain properties that will be
  shared between modules as global variables/functions/objects.
- Implementation of ``require.extensions``, to declare specific loaders corresponding to some file extensions
- Implementation of ``phantom.defaultPageSettings``. Note that settings are not supported
  yet by the webpage module.
- callbacks ``webpage.onLoadStarted`` and  ``webpage.onLoadFinished`` receive two additionnal
  parameters: the url that is loaded, and a boolean true if the loaded page is in a frame.
- Support of ``webpage.onCallback`` and ``window.callPhantom()``
- Support of ``webpage.onError``
- Support of ``webpage.onNavigationRequested`` and ``webpage.navigationLocked``
- Support of ``webpage.customHeaders``
- Support of ``webpage.settings.userAgent``
- Support of ``webpage.openUrl()``
- Implementation of setters of ``webpage.content`` and ``webpage.frameContent``
- Implementation of ``webpage.setContent()``
- Implementation of ``webpage.release()`` (deprecated method in PhantomJS, replaced by ``webpage.close()``.

Improvements
------------

- Issue #36: Support of scripts and modules written with the Coffee-Script language
- Support of JSON modules
- Issue #32: a new profile is created each time we launch SlimerJS, to not have preferences,
  cookies or other data created by a previous launch. It is still possible to use a
  permanent profile to keep data between two launchs.
- new option on the commande line: --error-log-file=filename to log errors in a file

Fixed bugs
----------

- when we launched SlimerJS from a symbolic link, there was an error "application.ini path not recognized"
- issue #15: Slimerjs freezed on JS errors, when calling ``webpage.evaluate()``. A default error handler
  is used now.
- issue #36: Exit code of Firefox/Xulrunner should be used as exit code of the slimerjs shell script

Fixed PhantomJS conformance issues
----------------------------------

- Modules have now access to global objects like window, phantom, document...
- Changed fs.workingDirectory from a method to a property, even if it violates the
  CommonsJS filesystem specification.
- ``webpage.injectJs()`` and ``phantom.injectJs()`` now return a boolean and try to
  load the given file from the current working dir before from the library path, like
  PhantomJS does.
- callbacks ``webpage.onLoadStarted`` and  ``webpage.onLoadFinished`` are called when
  a frame is loading a new document inside the web page.
- Issue #11: support of all possible arguments on webpage.open()
- The webserver guesses now the content type of some files (images..)

Missing APIS
------------

Here are the PhantomJS APIs that are missing in SlimerJS 0.7. Of course, their
implementation is planed in future releases.

- most of options for the command line are not supported
- no API to manage HTTP cookies, although cookies are supported (they are stored
  automatically)
- no support of the ``webpage.offlineStorage*`` properties, although offlineStorage
  is supported natively and usable by a web page
- no API to manage child windows
- no support of settings on the webpage object
- no support of file uploading in web page (``webpage.uploadFile()``, ``webpage.onFilePicker``..)
- no support of Ghost Driver

You can read the `compatibility table <https://github.com/laurentj/slimerjs/blob/master/API_COMPAT.md>`_ to know details.


Known issues
------------

- See `the github page <https://github.com/laurentj/slimerjs/issues>`_ ...


version 0.6.1
=============

SlimerJS 0.6.1  has been released on May 13, 2013.

Improvements
------------

- Implements phantom.args and phantom.scriptName

Fixed bugs
----------

- The leading "-" of command line options were troncated and loose their values
- Some functions of the fs module should verify if the given path is empty
- Fixed issue with node-phantom: bad XUL address of webpage.xul (Vincent Meurisse - issue #16)
- Callback of webpage.open was not called after a redirection (issue #22)
- Multiple instance of SlimerJS could not launch at the same time (issue #18)
- On MacOS the relative path of the JS script couldn't be given on the command line (issue #45)

Fixed PhantomJS conformance issues
----------------------------------

- webpage.evaluate should accepts strings (Vincent Meurisse - issue #20)
- Incorrect case for webpage.evaluateJavaScript (Vincent Meurisse - issue #19)
- Resource id on request/response object should start at 1, not 0 (issue #17)

version 0.6
===========

SlimerJS 0.6 has been released on May 03, 2013. This is the first public stable
release of SlimerJS.

It is usable, although its API is not still 100% compatible with PhantomJS.

Missing APIS
------------

Here are the PhantomJS APIs that are missing in SlimerJS 0.6. Of course, their
implementation is planed in future releases.

- most of options for the command line are not supported
- no API to manage HTTP cookies, although cookies are supported (they are stored
  automatically)
- no API to manage HTTP headers
- no support of the ``window.callPhantom()`` function in web pages
- no support of the navigation locking
- no support of the ``webpage.offlineStorage*`` properties, although offlineStorage
  is supported natively and usable by a web page
- no API to manage child windows
- no support of settings on the webpage and phantomjs object
- ``webpage.open()`` only supports an url and a callback as parameter
- no support of file uploading in web page (``webpage.uploadFile()``, ``webpage.onFilePicker``..)

You can read the `compatibility table <https://github.com/laurentj/slimerjs/blob/master/API_COMPAT.md>`_ to know details.


Known issues
------------

- On MacOS: you must indicate the full path of your JS script on the command line (fixed in 0.6.1)
- CommonJS modules: you cannot alter objects (they are `freezed <https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/freeze>`_ )
  returned by the ``require()`` function. This is a "feature" of the CommonJS
  modules system of the Mozilla Addons SDK (used by SlimerJS).

