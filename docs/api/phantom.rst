
=======
phantom
=======

``phantom`` is an object available automatically in scripts.

.. _phantom-addCookie:

addCookie(cookie)
-----------------------------------------

Add a cookie in the cookies storage of the current profile. The parameter
is :doc:`a Cookie object <cookie>`. The cookie can be for any domains.

It returns true if the cookie has been really added. If cookies are
disabled, the cookie is not added into the cookie database.

Be careful about `the inconsistent behavior of the expiry property <cookies.html#expires>`_.


.. _phantom-args:

args
-----------------------------------------

This is an array containing all arguments given on the command line.

.. code-block:: javascript

    var firstarg = phantom.args[0];



.. _phantom-clearCookies:

clearCookies()
-----------------------------------------

Delete all cookies that are stored in the current profile.

.. _phantom-cookies:

cookies
-----------------------------------------

This is an array of all :doc:`Cookie objects <cookie>` stored in the current
profile.

Note: modifying an object in the array won't modify the cookie. You should
retrieve the array, modify it, and then set the ``cookies`` property with this array.
Probably you would prefer to use the ``addCookie()`` method to modify a cookie.

If cookies are disabled, modifying this property does nothing.


Be careful about `the inconsistent behavior of the expiry property <cookies.html#expires>`_.

.. _phantom-cookiesEnabled:

cookiesEnabled
-----------------------------------------

Indicates if the cookie manager is enabled (true) or disabled (false). You can
modify this property to enable or disable the cookie manager.

By default, it is enabled.

.. _phantom-defaultErrorHandler:

defaultErrorHandler(message, stack)
-----------------------------------------

This is the function used by default to handle errors appearing into your scripts or
in the web page. Read only. Useful to set the ``onError`` callback to its initial value.

.. _phantom-defaultPageSettings:

defaultPageSettings
-----------------------------------------

This is an object that contains this following properties:

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

This is a read-only property.
It contains default values for ``webpage.settings``.

.. _phantom-deleteCookie:

deleteCookie(cookiename)
-----------------------------------------

It deletes all cookies that have the given name, in any domain.

It returns true if some cookies have been deleted.
It works only if cookies are enabled.

.. _phantom-exit:

exit(code)
-----------------------------------------

It stops the script and SlimerJS exit.

To be compatible with PhantomJS, it accepts an exit code but it is ignored
because of a limitation in Firefox/XulRunner. This code is optional.

.. code-block:: javascript

    phantom.exit();

Note: your script may continue to be executed after the call of this method, because of
the asynchronous behavior of this function.

.. _phantom-injectJs:

injectJs(filename)
-----------------------------------------

Use it if you want to "include" a javascript script into the main script, in
other words, if you want to evaluate the given javascript file into the context
of the main script.

Note that the file can be a Javascript script or a CoffeeScript script.

The method returns ``true`` if the injection is successful, or ``false``
if not (the file is not found for example).

If the path is not an absolute path, it should be a relative path
to the ``libraryPath``.

.. _phantom-libraryPath:

libraryPath
-----------------------------------------

It represents the path of the directory where scripts indicated to ``injectJs()``
could be found. By default, this path is the directory of the main script, indicated
on the command line.

You can change this path. You must then give an absolute path.

.. _phantom-onError:

onError
-----------------------------------------

This is the function called when an error occured in a script or in a web page. You can
set this property to provide your own error handler. The function should accept
a message and a stack as parameters.

.. code-block:: javascript

    phantom.onError = function (msg, stack) {
        var msg = "\nScript Error: "+msg+"\n";
        if (stack && stack.length) {
            msg += "       Stack:\n";
            stack.forEach(function(t) {
                msg += '         -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : '')+"\n";
            })
        }
        console.error(msg+"\n");
    }


.. _phantom-scriptName:

scriptName
-----------------------------------------

Contains the script name given to the command line.

.. _phantom-version:

version
-----------------------------------------

Contain the version of PhantomJS to which SlimerJS is compatible (read-only). This is an object
containing three properties, ``major``, ``minor``, ``patch``:


.. code-block:: javascript

    var v = phantom.version;
    console.log('version: ' + v.major + '.' + v.minor + '.' + v.patch);






