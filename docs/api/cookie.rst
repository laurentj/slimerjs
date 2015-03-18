
========
Cookie
========

Some properties and methods of the ``webpage`` and the ``phantom`` object
need a cookie object.

A cookie object is an object that have these properties:

- ``name``: the name of the cookie (string)
- ``value``: the value of the cookie (string)
- ``domain``: the domain name on which the cookie is attached
- ``path``: the path in URLs on which the cookie is valid
- ``httponly``: true if the cookie should only be sent to, and can
  only be modified by, an HTTP connection (i.e: cannot be read into document.cookie). default: false.
- ``secure``: true if the cookie should only be sent over a secure connection.
- ``expires``: Holds the expiration date, formated in ISO format (for example  "2014-10-23" or "2014-10-23T14:48:00").
  This property should be null for cookies existing only during a session.
- ``expiry``: : Holds the expiration date, in milliseconds since the epoch.
  This property should be null or 0 for cookies existing only during a session.

.. _expires:

Note: there is an inconsistency in PhantomJS 1.9.x. When you set a cookie, ``expiry``
should be in *milliseconds* since the epoch (1970-01-01), but when you read a cookie, its value
is in *seconds* since the epoch! SlimerJs follows this bad behavior to not break
existing PhantomJs scripts.

See `webpage.cookies <webpage.html#webpage-cookies>`_, `webpage.addCookie() <webpage.html#webpage-addCookie>`_,
`webpage.clearCookies() <webpage.html#webpage-clearCookies>`_, `webpage.deleteCookie() <webpage.html#webpage-deleteCookie>`_,
`phantom.addCookie() <phantom.html#phantom-addCookie>`_, `phantom.clearCookies() <phantom.html#phantom-clearCookies>`_, 
`phantom.cookies <phantom.html#phantom-cookies>`_, `phantom.cookiesEnabled <phantom.html#phantom-cookiesEnabled>`_, 
`phantom.deleteCookie() <phantom.html#phantom-deleteCookie>`_ .

Storage
-------

Cookies are stored in a sqlite database in the mozilla profile. If you want to have
persistent cookies, you cannot indicate a file like for PhantomJS, but you should
create a permanent profile. See `profiles <../configuration.html#profiles>`_.