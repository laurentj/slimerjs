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

=============================================  =================== =============================================
PhantomJS options
=============================================  =================== =============================================
--config=/path/to/config.json        
--cookies-file=/path/to/cookies.txt             N/A. see profiles
--debug=[yes|no]                     
--disk-cache=[yes|no]                
--help or -h                                    Supported           Displays help about options
--ignore-ssl-errors=[yes|no]         
--load-images=[yes|no]               
--local-storage-path=/path/to/file              N/A. see profiles
--local-storage-quota=number
--local-to-remote-url-access=[yes|no]
--max-disk-cache-size=size           
--output-encoding=encoding           
--proxy=address:port                 
--proxy-auth=username:password       
--proxy-type=[http|socks5|none]      
--remote-debugger-port=number        
--remote-debugger-autorun=[yes|no]   
--script-encoding=encoding           
--ssl-protocol=[SSLv3|SSLv2|TLSv1|any] 
--ssl-certificates-path=/path/to/dir            N/A. see profiles
--version or -v                                 Supported           Displays the version of SlimerJS
--webdriver or --wd or -w            
--webdriver=ip:port                  
--webdriver-logfile=/path/to/logfile 
--webdriver-loglevel=[ERROR|WARN|INFO|DEBUG]
--webdriver-selenium-grid-hub=url    
--web-security=[yes|no]              
=============================================  =================== =============================================

SlimerJS has some specific options. They are in fact `options of Firefox/Xulrunner <https://developer.mozilla.org/en-US/docs/Mozilla/Command_Line_Options>`_

=============================================  ==============  ========================================================================
Options specific to SlimerJS
=============================================  ==============  ========================================================================
-jsconsole                                     Supported        Open `the error console <https://developer.mozilla.org/en-US/docs/Error_Console>`_ that displays all javascript errors, warning, notices...
-P name                                        Supported        Use the indicated profile
-CreateProfile name                            Supported        Create a new profile
=============================================  ==============  ========================================================================


Configuration file
==================

Not supported for the moment.

A configuration file could be given with the ``--config`` option.


Options in your script
======================

Values of some options are available through the ``phantom`` object and the ``webpage`` object.

``phantom.defaultPageSettings`` is an object that contains this following properties :

.. code-block:: javascript

        {
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

Note that even if ``settings`` and ``phantom.defaultPageSettings`` are usable, settings
are not taken account yet by any webpage object.


Profiles
========

A profile is a directory where XulRunner/Firefox (and so SlimerJS), store many things:

- preferences (Mozilla options)
- cache files
- storage of data like localStorage or IndexedDb
- cookies
- etc...

There is always at least one profile, named "default", which is used each time you
launch SlimerJS. It means that you reuse same data, cookies etc at each execution.

This can be a issue, since it doesn't match the behavior of PhantomJS. In the future,
SlimerJS will create a temporary profile at each launch, to have a fresh configuration.

If you want to launch multiple instance of SlimerJS, or if you don't want to share same
preferences, cookies, data etc, you need to create new profiles.

Just do 

.. code-block:: bash

   slimerjs -CreateProfile myNewProfile

Then to use this new profile, use the ``-P`` parameter

.. code-block:: bash

   slimerjs -P myNewProfile  myscript.js


