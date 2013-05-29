.. index:: Release notes


==================
Release Notes v0.7
==================

SlimerJS 0.7 has not been released yet.

It is usable, although its API is not yet 100% compatible with PhantomJS.

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

Improvements
------------

- Issue #36: Support of scripts and modules written with the Coffee-Script language
- Support of JSON modules
- Issue #32: a new profile is created each time we launch SlimerJS, to not have preferences,
  cookies or other data created by a previous launch. It is still possible to use a
  permanent profile to keep data between two launchs.

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

Missing APIS
------------

Here are the PhantomJS APIs that are missing in SlimerJS 0.7. Of course, their
implementation is planed in future releases.

- most of options for the command line are not supported
- no API to manage HTTP cookies, although cookies are supported (they are stored
  automatically)
- no API to manage HTTP headers
- no support of the ``webpage.offlineStorage*`` properties, although offlineStorage
  is supported natively and usable by a web page
- no API to manage child windows
- no support of settings on the webpage object
- ``webpage.open()`` only supports an url and a callback as parameter
- no support of file uploading in web page (``webpage.uploadFile()``, ``webpage.onFilePicker``..)
- no support of Ghost Driver

You can read the `compatibility table <https://github.com/laurentj/slimerjs/blob/master/API_COMPAT.md>`_ to know details.


Known issues
------------

- See `the github page <https://github.com/laurentj/slimerjs/issues>`_ ...

