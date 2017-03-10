.. index:: Release notes


==============================
Release Notes of SlimerJS 0.10
==============================

version 0.10.3
==============

SlimerJS 0.10.3 has been released on March 9, 2017.

- Fix support of IPV6 notation in the ``--proxy`` and ``--webdriver`` command line parameters.
- Compatibility with Firefox 51 and 52
- Fix fs.copyTree() (Wojciech Skorodecki)
- Fix slimerjs-node under Windows (Charlie Hulcher)
- tar.bz2 packages are available

version 0.10.2
==============

SlimerJS 0.10.2 has been released on November 27, 2016.

- Compatibility with Firefox 50 (fix support of HTTP auth)
- Fix slimerjs.bat: it should not close cmd.exe when exiting 
- Official npm package

version 0.10.1
==============

SlimerJS 0.10.1 has been released on September 21, 2016.

Improvements
------------

- Improve message about version incompatibility
- Mozilla telemetry disabled (by Wojciech Skorodecki)
- Compatibility with Firefox 47, 48, 49
- Bash scripts: Use portable bash paths (by James Alastair McLaughlin)

Fixed bugs
----------

- Fixed "TypeError: browser.webpage is null" when closing a page while capturing a request (by Wojciech Skorodecki).
- Source code: replaced found Expression closures to Arrow functions (by Wojciech Skorodecki)
- Fixed wrong encoding of request.body in onResourceReceived() callback. (by Wojciech Skorodecki)
- Fixed various typo in the documentation and web site (by Brian Donovan, Thomas Grainger, Avindra Goolcharan, Alexander Tsirel, Eric White)
- Documentation: remove claim about xvfb support on Mac (by Matt McClure & Laurent)

version 0.10.0
==============

SlimerJS 0.10.0 has been released on May 2 2016.

New features and API
---------------------

- Experimental support of Webdriver, by using GhostDriver like phantomjs, to control SlimerJS from Selenium.
- ``webpage.render()`` can now generates PDF, BMP and ICO.
- ``webpage.paperSize`` is supported (except its header and footer properties).
- ``webpage.onLongRunningScript`` and ``webpage.stopJavascript()`` to allow to be informed of
   webpage having long running scripts (compatible with Phantomjs 2)
- Support of ``webpage.onResourceTimeout`` and ``webpage.settings.resourceTimeout``
- ``phantom.webdriverMode``
- Implementation of ``system.stdin``, ``system.stderr``, and ``system.stdout``
  is now a true output stream. It takes care about output encoding setting.
- Implementation of ``system.standardin``, ``system.standarderr``, and ``system.standardout``
  (Aliases of stdin, stdout, stderr properties...)  (compatible with Phantomjs 2)
- Support of command line option ``--output-encoding`` and ``phantom.outputEncoding``.
  It supports the value 'binary' to output binary content with system.stdout.
- Implementation of ``stream.atEnd`` and ``stream.readLine()``
- Implementation of ``phantom.aboutToExit``
- Implementation of ``phantom.resolveRelativeUrl(url, base)`` (compatible with Phantomjs 2.1)
- Implementation of ``phantom.fullyDecodeUrl(url)`` (compatible with Phantomjs 2.1)


Improvements
------------

- Exit code is now supported with ``slimer.exit()`` and ``phantom.exit()`` (except with slimerjs.bat)
- ``require`` supports node modules (it searches into node_modules directories)
- ``webpage.onConsoleMessage`` can receive additional parameters : level, function name and timestamp
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
- support additionals arguments on ``webpage.evaluateAsync()``
- Callback given to ``webpage.open()`` is now called when the url is invalid
- Like in PhantomJS 1.9 (and removed in PhantomJS 2.0), ``phantom.args`` and ``phantom.scriptName`` are deprecated
- webpage.viewportSize should accept strings as values (#313)
- webpage.clipRect should accept object with missing properties (#314)
- On windows, system.os.version matches now public version number, not internal
  version number (#344)
- ``cookie.expires`` is not anymore an integer, but a date formated as string
- ``fs.read()``, ``fs.write()`` and ``fs.open()`` can now accept an object
  as mode, to indicate both the mode and the charset.
- added ``setEncoding(encoding)`` and ``getEncoding()`` on file stream (Compatibility with PhantomJS 2.0)
- Compatible version of Phantomjs is now 1.9.8 (not 2.1, too many features are still missing,
  even if some 2.1 features are implemented)


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

Comparing to PhantomJS 2.1, some few options for the command line
and features on some object are missing. Among of them:

- the possibility to deactivate SSL verification and Web security (CORS etc)
- the possibility to set ssl client certificate
- offline storage settings
- some proxy methods
- the possibility to set a specific cookieJar to each web page object
- loading and loadingProgress booleans on webpage
- listener of repaint events on webpage
- the child_process module

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
- Will Hilton (``--user-agent=string``, ``--viewport-width`` and ``--viewport-height`` options)
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

