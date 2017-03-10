.. index:: Release notes


=============================
Release Notes of SlimerJS 0.9
=============================

version 0.9.6
=============

SlimerJS 0.9.6 has been released on June 8th, 2015.

Contributors: Ivan Enderlin, Jerry Lundström, Hallvord R. M. Steen

Improvements
------------

    * Compatibility with XulRunner/Firefox 38 and 39beta
    * packages: default Xulrunner version is now 38
    * improved information displayed in the console for some javascript error messages occuring into the web page

Fixed PhantomJS conformance issues
----------------------------------

    * webpage should be able to accept file path (without file://) (#265)

Fixed bugs
----------

    * Fix SSL support. Only support sslv3 was activated whereas it should be disabled (#335, #304)
    * Fix ``HIDE_ERRORS`` switcher ( #356)
    * Fix error "Permission denied to access property CoffeeScript" with Gecko 37+ (#350)
    * Fix issues in the .bat file (windows) (#348)

version 0.9.5
=============

SlimerJS 0.9.5 has been released on January 25th, 2015.

Contributors: Asen Bozhilov, Marco Castelluccio, Darren Cook, Emmanuel ROECKER, Maciej
Brencz, Artem Sapegin, Ian McGowan

Improvements
------------

    * access to the chrome module
    * the window has now an icon, appearing in the task bar of the desktop
    * Compatibility with XulRunner/Firefox 35 and 36b1
    * packages: default Xulrunner version is now 35
    * support of the ``--ssl-protocol`` command line parameter (#264, #26)

Fixed PhantomJS conformance issues
----------------------------------

   * req.abort() did not trigger onResourceError at the right time
   * when a resource request is aborted, onLoadFinished was called for each other
     resource requests.

Fixed bugs
----------

   * when a resource request is aborted, it doesn't abort anymore other requests (#130)
   * Callback given to ``webpage.open()`` is now really called after the page loading:
     it allows to call ``render()`` without a delay (``setTimeout``...).
     It avoids "pending is null" exception in some case...
   * taking screenshot may crashed because of flash plugin crash. Plugins are now loaded
     into their own process.
   * fix error when argument values on the command line began with a "s"
   * fix: sendEvent hang with mouse click on a <a> element without href attribute (#287)
   * fix error gecko pages loaded with the error "XML Parsing Error: undefined entity"
   * fix typo and idioms on the website

version 0.9.4
=============

SlimerJS 0.9.4 has been released on November 17th, 2014

Improvements
------------

   * New method ``slimer.isExiting()`` to check if ``slimer.exit()`` or ``phantom.exit()``
     have been called.
   * Compatibility with XulRunner/Firefox 33 and 34
   * packages: default Xulrunner version is now 33

Fixed PhantomJS conformance issues
----------------------------------

   * quality option for ``webpage.render()`` should be between 0 and 100, not between 0 and 1.

Fixed bugs
----------

   * Two calls of webpage.close() may trigger an exception.
   * Webserver: request.post was not filled correctly (not an object) when the
     content is application/x-www-form-urlencoded (#228)
   * Cookies: cookies set with ``phantom`` or ``webpage`` were not visible by default
     in the loaded document.cookie because of their httpOnly property setted with true
     by default. Not httpOnly is set to false by default.
   * Linux: Shell wrapper "slimerjs" breaks if run in a whitespace containing directory (#234)


version 0.9.3
=============

SlimerJS 0.9.3 has been released on September 11th, 2014

Improvements
------------

  * Compatibility with XulRunner/Firefox 32

Fixed bugs
----------

    * The cookie manager of SlimerJS ignored session cookies (#216)
    * webpage.frameContent should use the same code as webpage.content (#218)
    * Fixed a regression after fixing #198: webpage.close() was called twice.
    * fix error at startup about cache, with Gecko 32 (#208)

Fixed PhantomJS conformance issues
----------------------------------
    * Request object given by WebServer is now writable
    * WebServer.listen accepts now an "options" parameter, even if it is ignored for the moment.

version 0.9.2
=============

SlimerJS 0.9.2 has been released on August 11th, 2014

Improvements
------------

  * Compatibility with XulRunner/Firefox 30 and 31
  * packages: default Xulrunner version is now 31
  * setting only with or height of viewportSize is now taking account (#133)
  * support of "virtual" dialog box appearing for a window.onbeforeunload:
    ``webpage.onConfirm()`` is now called for this event (#198)

Fixed bugs
----------

  * Fixed #194: ``webpage.onConsoleMessage()`` receives now all arguments given to
    ``console.log()`` as a single string.
  * Fixed the support of the ip argument for ``webserver.listen()``
  * Fixed the support relative path given to require (bug appearing with CasperJS or in injected scripts ) #147
  * Headers and redirectURL were missing in resources about redirection (#153, #144)
  * Fixed issues with ``webpage.setContent()`` : location url was not set correctly
    and resources were not loaded with the right url (#201)
  * Fixed navigator.userAgent: it did not reflect the value of webpage.settings.userAgent (#166)
  * webpage.onError had not been triggered for errors appearing during the load of the page (#190)

version 0.9.1
=============

SlimerJS 0.9.1 has been released on March 20, 2014

Improvements
------------

  * Compatibility with XulRunner/Firefox 28 and 29
  * Support of JSON responses in webpage.plainText

Fixed bugs
----------

  * Fix SSL proxies: Proxy should be used for HTTPS and HTTP connections
  * Fixes #158: correctly deal with env vars containing spaces
  * Fixed #163: High CPU utilization while script is idle. The CSS animation
    on the SlimerJS window has just been removed.
  * Fixed #135: fixed crash on MacOS
  * Fixed #143: some listeners calls were missing when setting content on a webpage

New API
-------

  * ``system.stdout``


Contributors to 0.9.1
---------------------

- Jens Nockert
- Arpad Borsos

version 0.9.0
=============

SlimerJS 0.9.0 has been released on Dec 11, 2013

New API
-------

- New callback ``webpage.onAuthPrompt`` (not compatible with PhantomJS)
- New method ``slimer.clearHttpAuth()`` to clear http authentication from the network cache.
- Support of `navigator.mozTCPSocket <https://developer.mozilla.org/en-US/docs/WebAPI/TCP_Socket>`_ is enabled
  for the main script. Experimental feature that needs XulRunner/Firefox from 25 to 49. Support has gone since Firefox 50.
- New property ``slimer.geckoVersion``
- Compatible with Firefox/XulRunner 25.0
- Key shortcut ctrl+w on windows to quit SlimerJS (main window) or just close the window.
  (useful when the scripts ends without exit)
- support of ``--debug=errors`` to output errors with Firefox/XulRunner 25+

Fixed bugs
----------

- Fixed output on Windows: console messages are now output in real time, not any more at the
  end of the execution of the script. (issue #105 and issue #7)
- Fixed an internal error appearing during the call of ``webpage.close()``
- Fixed the HTTP redirection handling.

Fixed PhantomJS conformance issues
----------------------------------
- Support of ``--config`` on the command line, to indicate a configuration file
- Support of ``--disk-cache`` and ``--max-disk-cache-size`` on the command line
- Support of ``--proxy``, ``--proxy-auth`` and ``--proxy-type`` options on the command line
- Support of ``setHeader()`` on the  second parameter of the ``webpage.onResourceRequested`` callback
- Support of ``resource.postData`` in callback ``webpage.onResourceRequested``.
- Support of the callback ``webpage.onResourceError``
- Better support of some HTTP response (some callbacks were not called in some case)
- Support of ``webpage.settings.userName``, ``webpage.settings.password`` and ``webpage.settings.maxAuthAttemps``
- Compatible version of Phantomjs is now 1.9.2

Other informations about this release
-------------------------------------

- New experimental startup script, ``slimerjs.py`` in python, which is a plateform independant script
- Reworked the code of the module resolver to be more efficient
- Some internal changes have been done to embed GhostDriver in the future. Some issues
  are still preventing to use GhostDriver.

Missing APIS in SlimerJS 0.9
----------------------------

Here are the PhantomJS 1.9 APIs that are missing in SlimerJS 0.9 but planed in future releases.

- some few options for the command line  and settings on the webpage object
  are not supported yet. Some of them are the possibility to deactivate
  SSL verification and Web security (CORS etc)
- no support of Ghost Driver (Selenium web driver)
- page rendering into PDF

You can read the `compatibility table <https://github.com/laurentj/slimerjs/blob/master/API_COMPAT.md>`_
to know details.

See also :doc:`the differences in APIs and behaviors <differences-with-phantomjs>` between
SlimerJS and PhantomJS.

Known issues
------------

- See `the github page <https://github.com/laurentj/slimerjs/issues>`_ ...

Contributors
------------

- Niek van der Maas (Support of ``resource.postData``)
- Jaime Iniesta (typo in documentation)
- Boris Staal (typo in documentation)
- fumitoito (bug fix in slimerjs.bat)
- Bartvds (bug fix in slimerjs.bat)



Previous release notes
======================

.. toctree::
   :maxdepth: 1

   release-notes-0.8
   release-notes-0.7
   release-notes-0.6

