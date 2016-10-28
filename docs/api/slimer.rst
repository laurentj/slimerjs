
======
slimer
======


``slimer`` is an object available automatically in scripts.



.. _slimer-clearHttpAuth:

clearHttpAuth()
-----------------------------------------

It clears all HTTP authentication that have been made. Then, when
a webpage needs an HTTP auth, username and password will be asked again.

See :doc:`doc about http authentication with SlimerJS <../manual/http-authentication>`.

Introduced: SlimerJS 0.9

.. _slimer-exit:

exit()
-----------------------------------------


It stops the script and SlimerJS exit.

It accepts an optional exit code. Default is 0. 

.. code-block:: javascript

    slimer.exit();


Note: your script may continue to be executed after the call of this method, because of
the asynchronous behavior of this function.

.. _slimer-isexiting:

isExiting()
-----------------------------------------

Indicate if ``exit()`` has been called. Since the exiting process is asynchronous,
scripts may continues to be executed after exit(). So the script may interrupts its
processing by checking this status

Introduced: SlimerJS 0.9.4

.. _slimer-hasfeature:

hasFeature(featureName)
-----------------------------------------

Returns ``true`` if the given feature is implemented **and** enabled.

It can indicate the state of these features:

- ``"coffeescript"``: indicates if CoffeeScript is available. It may be
  disabled in some case (during GhostDriver execution for example)

False is returned for all other feature unknown by this method.


.. _slimer-version:

version
-----------------------------------------

Contain the version of SlimerJS (read-only). This is an object
containing four properties, ``major``, ``minor``, ``patch`` and ``prerelease``:

.. code-block:: javascript

    var v = slimer.version;
    if (v.prerelease)
        console.log('version: ' + v.major + '.' + v.minor + '.' + v.patch + '-' + v.prerelease);
    else
        console.log('version: ' + v.major + '.' + v.minor + '.' + v.patch);


.. _slimer-geckoversion:

geckoVersion
-----------------------------------------

Contain the version of Gecko, the core of Firefox. In fact, this is also
the version of Firefox.

This is an object containing four properties, ``major``, ``minor``, ``patch`` and ``prerelease``:

.. code-block:: javascript

    var v = slimer.geckoVersion;
    console.log('version: ' + v.major + '.' + v.minor + '.' + v.patch);

Introduced: SlimerJS 0.9

.. _slimer-wait:

wait(milliseconds)
------------------------------------------

SlimerJS do a pause during the given amount of time (in milliseconds).
It can be useful in some case to wait after a reflow or something like that.
Note that it does not freeze the browser.
