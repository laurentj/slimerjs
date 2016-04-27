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
- Support of ``webpage.onResourceTimeout`` and ``webpage.settings.resourceTimeout``
- ``phantom.webdriverMode``
- Implementation of ``system.stdin`` and ``system.stderr``. And ``system.stdout``
  is now a true output stream.
- Implementation of ``stream.atEnd`` and ``stream.readLine()``
- Implementation of ``phantom.aboutToExit``

Improvements
------------

- Exit code is now supported with ``slimer.exit()`` and ``phantom.exit()`` (except with slimerjs.bat)
- ``require`` supports node modules (it searches into node_modules directories)
- ``webpage.onConsoleMessage`` can receive additionnal parameters : level, function name and timestamp
- Improved error handling that may appear in webpage listeners
- ``fs.open()`` now supports special files (/dev/std*, fifo files...)
- Support of ``--debug=net`` and ``--debug=network`` which are aliases for ``--debug=netprogress``

Fixed bugs
----------

- Fixed configuration reading for script handlers (internal stuff)
- Callback given to ``webpage.open()`` is now really called after the page loading:
  it allows to call ``render()`` without a delay (``setTimeout``...)

- Fix error NS_ERROR_FACTORY_NOT_REGISTERED on navigator object (issue #373)
- Fix ``webpage.render()`` on SVG document (issue #283)
- Fix support of ``webpage.captureContent`` (issue #397)
- ``fs.extension()`` did not return the extension for simple filename (#447)
- ``fs.extension()`` did return the extension without a dot: that didn't respect
  the CommonJS Filesystem specification. An optional second parameter is supported:
  set it to true to returns the extension without a dot, like in previous SlimerJS
  version.
- Fix ``fs.absolute()`` with relative path containing ".." on Windows (#347)
- Fix support of multiple file for ``<input type=file>`` with ``webpage.uploadFile``
  and ``webpage.onFilePicker``
- ``webpage.onError`` did not receive a full stack in some case. This is not the
  case anymore since some improvements have been made into Gecko.


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
- ``cookie.expires`` is not anymore an integer, but a date formated as string

Other informations about this release
-------------------------------------

- Compatibility with Firefox 40 to Firefox 46.
- Compatibility is no more guaranteed on Firefox having version lower than 38.
- There are no anymore packages including XulRunner, the Firefox runtime, since
  Mozilla has killed the XulRunner project. So you need to install Firefox
  in order to run SlimerJS.
- Compatibility with CasperJS 1.1 has been fixed


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

- Dimitar Angelov (webpage.paperSize and other pdf options for webpage.render())
- Rémi Emonet (webpage.paperSize)
- Will Hilton (--user-agent=string, --viewport-width and --viewport-height options)
- Sergey Kogan (fix issues about exit code)
- Quentin Le Calvez (Fix console.log so it can take multiple arguments)
- Jerry Lundström (Fix support with Gecko 40.*)
- Kevin Petit (fix slimerjs.bat about spaces in folders)
- Delta React User (Remove call to legacy API setCSSViewport)
- Mark Robson (Api doc, test on webpage.renderBytes, Tests generate perl-style TAP output)
- Wojciech Skorodecki (Hiding one debug message when debug mode is turned off)
- René Wagner (doc about addons)

Previous release notes
======================

.. toctree::
   :maxdepth: 1

   release-notes-0.9
   release-notes-0.8
   release-notes-0.7
   release-notes-0.6

