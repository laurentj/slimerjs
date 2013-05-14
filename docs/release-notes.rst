.. index:: Release notes


==================
Release Notes v0.7
==================

SlimerJS 0.7 has not been released yet.

It is usable, although its API is not yet 100% compatible with PhantomJS.

Improvements
------------

- Implementation of ``require.paths``, a list of paths where modules can be found (CommonJS modules 1.1 specification)

Fixed bugs
----------

Fixed PhantomJS conformance issues
----------------------------------

- Modules have now access to global objects like window, phantom, document...



Missing APIS
------------

Here are the PhantomJS APIs that are missing in SlimerJS 0.7. Of course, their
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

- See the github page...

