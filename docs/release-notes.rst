.. index:: Release notes


=============
Release Notes
=============


version 0.9.1
=============

SlimerJS 0.9.0 has been released on March 20, 2014

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
  for the main script. It needs at least XulRunner/Firefox 25 to use this API.
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

- SlimerJS will not support the ``--ssl-protocol`` option because Gecko only supports SSL3
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

