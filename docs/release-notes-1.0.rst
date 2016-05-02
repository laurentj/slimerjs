.. index:: Release notes


==============================
Release Notes of SlimerJS 1.0
==============================

version 1.0
==============

Not released yet.

New features and API
---------------------

Improvements
------------

Fixed bugs
----------


Fixed PhantomJS conformance issues
----------------------------------



Other informations about this release
-------------------------------------


Missing features in SlimerJS 1.0
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


Previous release notes
======================

.. toctree::
   :maxdepth: 1

   release-notes-0.10
   release-notes-0.9
   release-notes-0.8
   release-notes-0.7
   release-notes-0.6

