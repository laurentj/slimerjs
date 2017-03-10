.. index:: configuration

=============
Configuration
=============

SlimerJS has several options, that can be indicated on the command line or modified
during the execution of the script.

It has also a "profile" system, the same as Firefox, which allows you to launch SlimerJS
with different execution context.


Command line options
====================

.. index:: options

SlimerJS accepts a number of options on the command line. It accepts the same options
as PhantomJS, plus some others. Indicate them before the script filename.

However, all options are not supported yet. And some of them won't be supported because
they don't make sens with the existing profile system.

For Windows users: if an option does not work, remove the equal sign and the first
dash. For example, ``--proxy=localhost`` becomes ``-proxy localhost``. You should
note also that the command line parsing is done by Firefox, not by SlimerJS.


====================================================  ===================  ====================================================
PhantomJS options
====================================================  ===================  ====================================================
``--config=/path/to/config.json``                     Supported (0.9)      indicate a config file
``--cookies-file=/path/to/cookies.txt``               N/A. see profiles
``--debug=[yes|no|true|false]``                       supported            Displays debug messages. Supports also other values
``--disk-cache=[yes|no|true|false]``                  Supported (0.9)      Enable the disk cache or not. By default: disabled
``--help`` or ``-h``                                  Supported            Displays help about options
``--ignore-ssl-errors=[yes|no|true|false]``
``--load-images=[yes|no|true|false]``                 Supported
``--local-storage-path=/path/to/file``                N/A. see profiles
``--local-storage-quota=number``                      Supported            number in Bytes
``--local-to-remote-url-access=[yes|no|true|false]``
``--max-disk-cache-size=size``                        Supported (0.9)      Limits the size of the disk cache (in KB)
``--output-encoding=encoding``
``--proxy=[address:port|url]``                        Supported (0.9)      See below for possible values
``--proxy-auth=username:password``                    Supported (0.9)
``--proxy-type=[http|socks5|none]``                   Supported (0.9)      See below other possible values
``--remote-debugger-port=number``
``--remote-debugger-autorun=[yes|no|true|false]``
``--ssl-protocol=[ssl protocol name]``                Supported (0.9.5)    Indicates the SSL protocol to use. See notes about it below. Default is TLS.
``--ssl-certificates-path=/path/to/dir``              N/A. see profiles
``--version`` or ``-v``                               Supported            Displays the version of SlimerJS
``--webdriver`` or ``--wd`` or ``-w``                 Supported            launch SlimerJS as a driver for Selenium (experimental)
``--webdriver=ip:port``                               Supported            launch SlimerJS as a driver for Selenium, by indicating the ip and a port (experimental)
``--webdriver-logfile=/path/to/logfile``              Supported            sets the log file for webdriver
``--webdriver-loglevel=[ERROR|WARN|INFO|DEBUG]``      Supported            sets the log level for webdriver
``--webdriver-selenium-grid-hub=url``                 Supported            sets the url to the Selenium grid hub
``--web-security=[yes|no|true|false]``
====================================================  ===================  ====================================================

SlimerJS has some specific options. Some of them are `options of Firefox <https://developer.mozilla.org/en-US/docs/Mozilla/Command_Line_Options>`_

=============================================  ==============  ========================================================================
Options specific to SlimerJS
=============================================  ==============  ========================================================================
``--error-log-file=file``                       Supported        stores all JS errors in the given log file
``-jsconsole``                                  Supported        Open `the error console <https://developer.mozilla.org/en-US/docs/Error_Console>`_ that displays all javascript errors, warning, notices...
``-P name``                                     Supported        Use the indicated profile
``-CreateProfile name``                         Supported        Create a new profile
``-profile path``                               Supported        Use the given directory as a profile
``--user-agent=string``                         Supported        Set the default value of `webpage.settings.userAgent <api/webpage.html#settings>`_
``--viewport-width=number``                     Supported        Set the default value of `webpage.viewportSize.width <api/webpage.html#viewportsize>`_
``--viewport-height=number``                    Supported        Set the default value of `webpage.viewportSize.height <api/webpage.html#viewportsize>`_
=============================================  ==============  ========================================================================

About debug
-----------

With the ``--debug`` option, SlimerJS displays many messages about what happened during
the execution of your script: network events, page loading, ``sendEvent`` calls, configuration
values, command line parameters..

SlimerJS accepts a value other than true/false/yes/no for ``--debug``. You can indicate what to display.

Example: ``--debug=pageloading,netprogress``.

Available keywords are:

- ``page``: show calls of some webpage API
- ``pageloading``: show calls of webpage listeners about resource loading and page loading
- ``netprogress`` or ``net`` or ``network``: show internals network events
- ``config``: show configuration values
- ``cli``: show command line parameters for the script
- ``errors``: show gecko errors (javascript errors ...). only for Firefox 25+

About proxy configuration
-------------------------

You can indicate an HTTP proxy configuration or a SOCKS proxy configuration:
``--proxy-type=socks5`` or ``--proxy-type=http``. For this both type, the host name and the
port should be indicated with the ``--proxy=`` option: ``--proxy=host:port``

SlimerJS supports also some specific values for ``--proxy-type``:

- ``auto``: SlimerJS tries to detect automatically proxies
- ``system``: SlimerJS uses the proxy configuration set into the operating
  system. Under linux, Firefox is using proxy configuration stored into Gnome
  settings or GConf. Note that the use of the ``http_proxy`` environment variable does not work.
- ``config-url``: SlimerJS uses the proxy configuration set into a file. The HTTP or file:// URL
   of this file should be indicated with the ``--proxy=`` option.

About SSL protocols
--------------------

Firefox does not support SSLv2 protocol. It supports only SSLv3 to latest
TLS version (v1.2 for Gecko 35). However, SSLv3 is deactivated because of a vulnerability
in the SSLv3 protocol ( `POODLE <http://en.wikipedia.org/wiki/POODLE>`_ ).

When you use the ``--ssl-protocol`` flag, you indicates to use the indicated protocol.
No other will be used. Except the value ``any``, to use SSLv3 to TLSv1.2, or ``TLS``
to use any TLS version. In these case, the browser will use the best protocol supported by
the web server.

Possible values are: ``SSLv3``, ``TLSv1``, ``TLSv1.1``, ``TLSv1.2``, ``TLS``, ``any``.

Configuration file
==================

A configuration file could be given with the ``--config`` option.

This file does contain a JSON object. Each of its properties correspond to
a configuration parameter with a de-dashed and camel-cased name.

.. code-block:: javascript

    {
        "loadImages":true,
        "errorLogFile":"error2.log",
        "maxDiskCacheSize": 123
    }

Some options are not supported in the configuration file, since they are processed before
the execution of the core of SlimerJS: ``--help``, ``--version``, ``-jsconsole``, ``-P``, ``-CreateProfile``, ``-profile``,

Options in your script
======================

Values of some options are available through the ``phantom`` object and the ``webpage`` object.

``phantom.defaultPageSettings`` is an object that contains this following properties:

.. code-block:: javascript

        {
            allowMedia: true,                       // value of --allow-media
            javascriptEnabled: true,
            loadImages: true,                       // value of --load-images
            localToRemoteUrlAccessEnabled: false,   // value of --local-to-remote-url-access
            XSSAuditingEnabled : false,
            webSecurityEnabled: true,               // value of --web-security
            javascriptCanOpenWindows: true, 
            javascriptCanCloseWindows: true,
            userAgent: 'SlimerJS',
            userName: undefined,
            password: undefined,
            maxAuthAttempts: undefined,
            resourceTimeout: undefined
        }

``phantom.defaultPageSettings`` cannot be modified by your script.

The property ``settings`` of a webpage object contains the same object, except that it
can be modified. The default value of ``settings`` is equal to ``phantom.defaultPageSettings``.

Note that even if ``settings`` and ``phantom.defaultPageSettings`` are usable, only few
settings are taken account by webpage objects: ``javascriptEnabled``, ``loadImages`` and
``userAgent``.


.. _profiles:

Profiles
========

A profile is a directory where Firefox (and so SlimerJS), store many things:

- preferences (Mozilla options)
- cache files
- storage of data like localStorage or IndexedDb
- cookies
- etc...

By default, SlimerJS create a temporary profile each time you launch it. This profile
is deleted at the end of the execution. It allows to launch several SlimerJS instances
at the same time: they don't share same profile files.

If you want to use a persistent profile (to reuse same preferences, same cookies, localstorage
etc stored during a navigation), you have to create a specific profile and to indicate it.

.. code-block:: bash

   slimerjs -CreateProfile myNewProfile

It will create a directory in ``$HOME/.innophi/slimerjs/``.
Then to use this new profile, use the ``-P`` parameter

.. code-block:: bash

   slimerjs -P myNewProfile  myscript.js

