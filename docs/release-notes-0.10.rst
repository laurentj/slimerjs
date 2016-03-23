.. index:: Release notes


==============================
Release Notes of SlimerJS 0.10
==============================

version 0.10.0
==============

Still in development

New features and API
---------------------

- Experimental support of Webdriver, by using GhostDriver like phantomjs, to control SlimerJS from Selenium.
- ``webpage.render()`` can now generates PDF, BMP and ICO.
- ``webpage.paperSize`` is supported (except its header and footer properties).
- ``webpage.onLongRunningScript`` and ``webpage.stopJavascript()`` to allow to be informed of
   webpage having long running scripts (compatible with Phantomjs 2)
- ``phantom.webdriverMode``
- Implementation of ``system.stdin`` and ``system.stderr``. And ``system.stdout``
  is now a true output stream.
- Implementation of ``stream.atEnd`` and ``stream.readLine()``

Improvements
------------

- Exit code is now supported with ``slimer.exit()`` and ``phantom.exit()`` (except with slimerjs.bat)
- ``require`` supports node modules (it searches into node_modules directories)
- ``webpage.onConsoleMessage`` can receive additionnal parameters : level, function name and timestamp
- Improved error handling that may appear in webpage listeners

Fixed bugs
----------

- Fixed configuration reading for script handlers (internal stuff)
- Callback given to ``webpage.open()`` is now really called after the page loading:
  it allows to call ``render()`` without a delay (``setTimeout``...)

- Fix error NS_ERROR_FACTORY_NOT_REGISTERED on navigator object (issue #373)
- Fix webpage.render() on SVG document (issue #283)
- Fix support of webpage.captureContent (issue #397)
- fs.extension() did not return the extension for simple filename (#447)
- fs.extension() did return the extension without a dot: that didn't respect
  the CommonJS Filesystem specification. An optional second parameter is supported:
  set it to true to returns the extension without a dot, like in previous SlimerJS
  version.


Fixed PhantomJS conformance issues
----------------------------------

- a module should be able to call the ``return`` keyword
- support additionnals arguments on ``webpage.evaluateAsync()``
- Callback given to ``webpage.open()`` is now called when the url is invalid
- Like in PhantomJS 2.0, ``phantom.args`` and ``phantom.scriptName`` are deprecated
- webpage.viewportSize should accept strings as values (#313)
- webpage.clipRect should accept object with missing properties (#314)
- On windows, system.os.version matches now public version number, not internal
  version number (#344)

Other informations about this release
-------------------------------------

- Compatibility with Firefox 40 to Firefox 45.
- Compatibility is no more guaranteed on Firefox having version lower than 38.
- There are no anymore packages including XulRunner, the Firefox runtime, since
  Mozilla has killed the XulRunner project. So you need to install Firefox
  in order to run SlimerJS.


Missing features in SlimerJS 0.10
---------------------------------

Some few options for the command line  and settings on the webpage object
are not supported yet. Some of them are the possibility to deactivate
SSL verification and Web security (CORS etc)

You can read the `compatibility table <https://github.com/laurentj/slimerjs/blob/master/API_COMPAT.md>`_
to know details.

See also :doc:`the differences in APIs and behaviors <differences-with-phantomjs>` between
SlimerJS and PhantomJS.

Known issues
------------

- See `the github page <https://github.com/laurentj/slimerjs/issues>`_ ...

Contributors for this release
-----------------------------

- Rémi Emonet (webpage.paperSize)
- Dimitar Angelov (webpage.paperSize and other pdf options for webpage.render())
- 

Previous release notes
======================

.. toctree::
   :maxdepth: 1

   release-notes-0.9
   release-notes-0.8
   release-notes-0.7
   release-notes-0.6

