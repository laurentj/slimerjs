.. index:: Release notes


==============================
Release Notes of SlimerJS 0.10
==============================

version 0.10.0
==============

Still in development

New features
------------

- Experimental support of Webdriver, by using GhostDriver like phantomjs, to control SlimerJS from Selenium.

New API
-------

- ``webpage.render()`` can now generates PDF, BMP and ICO.
- ``webpage.paperSize`` is supported (except its header and footer properties).
- ``webpage.onLongRunningScript`` and ``webpage.stopJavascript()`` to allow to be informed of
   webpage having long running scripts (compatible with Phantomjs 2)
- ``phantom.webdriverMode``

Improvements
------------

- Exit code is now supported with ``slimer.exit()`` and ``phantom.exit()`` (except with slimerjs.bat)

Fixed bugs
----------

- Fixed configuration reading for script handlers (internal stuff)
- Callback given to ``webpage.open()`` is now really called after the page loading:
  it allows to call ``render()`` without a delay (``setTimeout``...)

Fixed PhantomJS conformance issues
----------------------------------

- a module should be able to call the ``return`` keyword

Other informations about this release
-------------------------------------

- XulRunner 40 is bundled into packages


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


Previous release notes
======================

.. toctree::
   :maxdepth: 1

   release-notes-0.9
   release-notes-0.8
   release-notes-0.7
   release-notes-0.6

