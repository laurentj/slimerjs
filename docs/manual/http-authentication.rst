

================================
Dealing with HTTP authentication
================================

The web site you browse may ask an HTTP authentication.
Traditionnal browsers display a dialog box where the user
has to type his login and his password.

However SlimerJS does not open a dialog box since your script
should not require user interactions. Thus, you should provide
username and password within your script.

By settings
-----------

The easiest way is to indicate these username and password into settings
of the webpage, before opening it.

.. code-block:: javascript
    
    webpage.settings.userName = "mylogin";
    webpage.settings.password = "mypassword";
    webpage.open(url, function(success){
        //...
    });


Then SlimerJS will give these credentials each time the web server
asks an authentication.

You can also set the username and the password in the settings of
the ``phantom`` object. They will be used for every web page object.

.. code-block:: javascript
    
    phantom.defaultPageSettings.userName = "mylogin";
    phantom.defaultPageSettings.password = "mypassword";


.. container:: warning

    These userName and password are given to all servers that ask an
    http authentication! Without knowing it, you can give these
    sensitive information to a web resource loading from an other
    domain than the main page and which asks http authentication (like
    an iframe, a css stylesheets etc..).
    If you want a better control of the authentication, use the ``httpConf`` parameter
    on the ``open()`` or ``openUrl()`` method, or use a callback
    (see below).


By a callback
-------------

Instead of indicating settings, you can create a callback
that will be called each time the browser needs credentials
(This is a feature that is not available in PhantomJS).

You set this callback to the ``webpage.onAuthPrompt`` property.

.. code-block:: javascript
    
    webpage.onAuthPrompt = function (type, url, realm, credentials) {
        if (url.startsWith('http://foo.com')) {
            credentials.username = "laurent";
            credentials.password = "1234";
            return true;
        }
        return false;
    }

As you see, using a callback allows to check who asks credentials, before
giving them.

The callback accepts four arguments:

- ``type``: its value is ``'http'``
- ``url``: the url of the page that needs authentication
- ``realm``: the message indicating the realm
- ``credentials``: an object containing two properties, ``username`` and
  ``password``. You should modify these properties to indicate the username
  and the password.

The callback should return ``true`` if it accepts to authenticate, else
``false``.

By http headers
---------------

Uername and password given by settings or by a callback will be used only
after an response having an ``HTTP 401 Unauthorized`` status. If you want to avoid
this response, according to the `http authentication <https://en.wikipedia.org/wiki/Basic_access_authentication>`_
you can send directly the username and the password , via
an http header you'll give to `webpage.open()`.


.. code-block:: javascript
    
    var hash = window.btoa(username + ':'+ password);
    webpage.open(url, { headers:
                    {
                      'Authorization': 'Basic '+hash
                    }
    })


See `webpage.open() <../api/webpage.html#webpage-open>`_  documentation for details about parameters.

In case of bad authentication
-----------------------------

If the authentication fails, the browser retries a number of time.
It recall ``webpage.onAuthPrompt`` at each time. The maximum number
of tries is 3 by default. But you can change this number
by changing ``webpage.settings.maxAuthAttemps``.

When the maximum of tries is reached, the browser stops the loading
of the page. You receive ``success`` in the callback given to the
``open()`` method, because it is not a network issue.
But you can verify if the authentication fails by checking the content
of the webpage, or by checking the code of the HTTP response (on the
``response`` object received by the ``onResourceReceived`` ).
The HTTP code is then equal to 401.


Clear HTTP authentications
--------------------------

When you give credentials to a webpage, their are used for the first page
of the domain that needs authentication. It the authentication succeed,
the browser is remembering these credentials and uses them in next
request for the same domain (it avoids to ask username and password
to the user at each page).

But sometimes you may want to clear this credentials "cache". Use then
``slimer.clearHttpAuth()``  (This is not available into PhantomJS).

