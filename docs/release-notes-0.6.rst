.. index:: Release notes


=============================
Release Notes of SlimerJS 0.6
=============================

version 0.6.1
=============

SlimerJS 0.6.1 has been released on May 13, 2013.

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

Missing APIS in SlimerJS 0.6
----------------------------

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
- CommonJS modules: you cannot alter objects (they are `freezed <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze>`_ )
  returned by the ``require()`` function. This is a "feature" of the CommonJS
  modules system of the Mozilla Addons SDK (used by SlimerJS).

