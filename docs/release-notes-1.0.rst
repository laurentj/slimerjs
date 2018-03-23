.. index:: Release notes


==============================
Release Notes of SlimerJS 1.0
==============================

version 1.0
===========

Released on March 23, 2018.

New features and API
---------------------

- ``loading`` and ``loadingProgress`` properties on webpage
- ``onResourceError`` parameter contains now always ``status`` and ``statusText`` properties
- ``proxy()`` and ``setProxy()`` methods
- ``slimer.version`` and ``slimer.geckoVersion`` have a new ``prerelease`` property.
- With Firefox 56 and more, SlimerJS can be trully headless by adding the ``--headless`` option on the command line
- Proxy config: support https URI for pac
- new ``fs.isSpecial()``
- ``onResourceRequested``: support of requestData.postData when http method is "patch"

Improvements
------------

* implements ``system.pid`` (#473)
* implements ``phantom.proxy()`` and ``phantom.setProxy()`` methods (#436, #444, #445)
* Compatibility with Firefox 53 to 59

Fixed bugs
----------

* Fix error "ReferenceError: reference to undefined property this._stopCallback"
* On Windows: instances launched at the same time don't share anymore the same profile
* On Windows: fix exit code file name
* Remove the error message about "NS_BINDING_ABORTED"
* fix bug in ``fs.isLink()`` and ``fs.readLink()``
* fix exit code on errors like "script is missing"


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
- the possibility to set a specific cookieJar to each web page object
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

- Avadh Patel
- Brian Birtles
- Brendan Dahl
- Nagy Attila Gabor
- Justin Klemm
- Shannon Little
- Wojciech Skorodecki (Proxy API)

Previous release notes
======================

.. toctree::
   :maxdepth: 1

   release-notes-0.10
   release-notes-0.9
   release-notes-0.8
   release-notes-0.7
   release-notes-0.6

