.. index:: Release notes


=============
Release Notes
=============

version 0.9
===========

This version is in development.

New API
-------

- Support of ``--config`` on the command line, to indicate a configuration file
- Support of ``--disk-cache`` and ``--max-disk-cache-size`` on the command line
- Support of ``--proxy`` and ``--proxy-type`` options on the command line
- Support of ``webpage.settings.userName``, ``webpage.settings.password`` and ``webpage.settings.maxAuthAttemps``
- New callback ``webpage.onAuthPrompt`` (not compatible with PhantomJS)
- New method ``slimer.clearHttpAuth()`` to clear http authentication from the network cache.
- Support of `navigator.mozTCPSocket <https://developer.mozilla.org/en-US/docs/WebAPI/TCP_Socket>`_ is enabled
  for the main script. It needs at least XulRunner/Firefox 25 to use this API.
- New property ``slimer.geckoVersion``
- Compatible with Firefox/XulRunner 25.0
- Key shortcut ctrl+w on windows to quit SlimerJS (main window) or just close the window.
  (useful when the scripts ends without exit)

Fixed bugs
----------

- Fixed output on Windows: console messages are now output in real time, not any more at the
  end of the execution of the script. (issue #105 and issue #7)

Fixed PhantomJS conformance issues
----------------------------------
- Support of ``setHeader()`` on the  second parameter of the ``webpage.onResourceRequested`` callback
- Support of ``resource.postData`` in callback ``webpage.onResourceRequested``.


Missing APIS in SlimerJS 0.9
----------------------------

Here are the PhantomJS APIs that are missing in SlimerJS 0.9 but planed in future releases.

- many options for the command line are not supported
- few settings on the webpage object are not supported yet
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

   release-notes-0.8
   release-notes-0.7
   release-notes-0.6

