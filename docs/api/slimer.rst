
======
slimer
======


``slimer`` is an object available automatically in scripts.


.. _slimer-exit:

exit()
-----------------------------------------


It stops the script and SlimerJS exit.

It accepts an optional exit code but it is ignored
because of a limitation in Firefox/XulRunner.

.. code-block:: javascript

    slimer.exit();


.. _slimer-version:

version
-----------------------------------------

Contain the version of SlimerJS (read-only). This is an object
containing three properties, ``major``, ``minor``, ``patch``:

.. code-block:: javascript

    var v = slimer.version;
    console.log('version: ' + v.major + '.' + v.minor + '.' + v.patch);

.. _slimer-wait:

wait(milliseconds)
------------------------------------------

SlimerJS do a pause during the given amount of time (in milliseconds).
It can be useful in some case to wait after a reflow or something like that.
Note that it does not freeze the browser.
