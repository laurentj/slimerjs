
============================
Javascript standard objects
============================

Most Javascript built-in objects are available and can be used as expected, for example,
``Date``, ``RegExp``,
``Math``, ``console``...

XMLHttpRequest
---------------

The normal XMLHttpRequest object is not very useful in SlimerJS 
because the script is executing from the origin of "about:blank". The
same-origin policy prevents XMLHttpRequest from being used with most 
servers.

To avoid this, we can use the Add-ons SDK version of XMLHttpRequest
which is bundled with SlimerJS, as follows:

.. code-block:: javascript

   var XMLHttpRequest = require('sdk/net/xhr').XMLHttpRequest;
   
This version of XMLHttpRequest is unrestricted; you should avoid using
it on untrusted input as it can fetch anything including local files.

Note that requests made with this XMLHttpRequest won't call any 
network callbacks, but AJAX requests from within loaded web pages will
do so.

