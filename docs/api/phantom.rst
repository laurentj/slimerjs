
=======
phantom
=======


Documentation soon. Please help us to fill this page :-)



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


.. _phantom-defaultErrorHandler:

defaultErrorHandler
-----------------------------------------


.. _phantom-defaultPageSettings:

defaultPageSettings
-----------------------------------------


.. _phantom-deleteCookie:

deleteCookie(cookiename)
-----------------------------------------

It deletes all cookies that have the given name, in any domain.

It returns true if some cookies have been deleted.
It works only if cookies are enabled.

.. _phantom-exit:

exit()
-----------------------------------------


.. _phantom-injectJs:

injectJs(filename)
-----------------------------------------

Use it if you want to "include" a javascript script into the main script, in
other words, if you want to evaluate the given javascript file into the context
of the main script.

Note that the file can be a Javascript script or a CoffeeScript script.

The method returns ``true`` if the injection is successful, or ``false``
if not (the file is not found for example).

.. _phantom-libraryPath:

libraryPath
-----------------------------------------


.. _phantom-onError:

onError
-----------------------------------------


.. _phantom-scriptName:

scriptName
-----------------------------------------


.. _phantom-version:

version
-----------------------------------------

