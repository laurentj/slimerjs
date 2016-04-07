.. index:: webserver, web server, http response, http request

=========
webserver
=========

This module allows you to run a web server. The module has a single function, ``create()``
which returns a ``webserver`` object. Then you can register callback to handle some
specific url request (with ``register*`` methods or with ``listen()``), then you just
have to call ``listen``: a web server is listening incoming requests on the given port.

Here is a simple example:

.. code-block:: javascript

    var webserverTest = require("webserver").create();
    webserverTest.listen(8083, function(request, response) {
        if (request.url == '/hello.html') {
            response.statusCode = 200;
            response.write('<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>hello world</title></head><body>Hello!</body></html>');
            response.close();
        }
        //...
    });

See `tests for SlimerJS <https://github.com/laurentj/slimerjs/blob/master/test/webserver-for-tests.js#L61>`_
to have a complex example.

Callbacks receive two object: a :ref:`Request <request>` object and a :ref:`Response <response>` object. You have
to modify the response object to send a response to the client browser. You always
must call the ``close()`` method of the response object in order to
send definitively all the content to the client.


Webserver object
================

.. index:: webserver

.. _webserver-registerDirectory:

registerDirectory(urlpath, directoryPath)
-----------------------------------------

Maps an URL path to a directory.
For example, if you do:

.. code-block:: javascript

    server.registerDirectory('/foo/', '/home/me/somewhere')

A request ``http://localhost/foo/bar.html`` will return the content
of the file ``/home/me/somewhere/bar.html`` (if it exists, else a 404 error is returned
as an http response).

SlimerJS only.

.. _webserver-registerFile:

registerFile(urlpath, filePath)
-----------------------------------------

Maps an URL path to a file.
For example, if you do:

.. code-block:: javascript

    server.registerFile('/foo.html', '/home/me/somewhere/bar.html')

A request ``http://localhost/foo.html`` will return the content
of the file ``/home/me/somewhere/bar.html`` (if it exists, else a 404 error is returned
as an http response).

SlimerJS only.

.. _webserver-registerPathHandler:

registerPathHandler(urlpath, handlerCallback)
----------------------------------------------

Maps an URL path to an handler. When a request url match the given URL path, your
handler will be called.

.. code-block:: javascript

    server.registerPathHandler('/foo/bar', function(request, response){
        // here build your response
        response.statusCode = 200;
        response.write('something');
        if (a_test)
            response.write('hello');
        response.close();
    });

SlimerJS only.

.. _webserver-registerPrefixHandler:

registerPrefixHandler(urlprefix, handlerCallback)
-------------------------------------------------


Maps an URL prefix to an handler. When a request url starts with the given URL prefix, your
handler will be called.

.. code-block:: javascript

    server.registerPathHandler('/foo/', function(request, response){
        // here build your response
        response.statusCode = 200;
        if (request.url == '/foo/something')
            response.write('hello');
        else
            response.write('something');
        response.close();
    });

Here, all URL starting with ``http://localhost/foo/`` will be handle by the given handler.
You have to return a response according to the full request url.

SlimerJS only.

.. _webserver-listen:

listen(port, callback) or listen(port, options, callback)
---------------------------------------------------------

This is the main method, that starts the server. You have to give a port, 80 or 8080 for example,
and an optional callback (it is required if you didn't call a ``register*`` method before).
The callback is a function that receives :ref:`Request <request>` object and
a :ref:`Response <response>` object.

.. code-block:: javascript

   server.listen(8080, function(request, response) {
       //...
   })

Note: by default, the web server binds to 127.0.0.1. If you want to bind with an other
IP (the public ip of the machine for example), give the hostname or the ip (plus the port)
to the method as a string:

.. code-block:: javascript

   server.listen("192.168.0.1:8080", function(request, response) {
       //...
   })

Note: the Mozilla http server implementation does not like binding to 0.0.0.0.

To be compatible with PhantomJS 1.9.7, an ``options`` object is allowed
as second parameter. However SlimerJS ignores it.

.. _webserver-close:

close()
-----------------------------------------
 
 It stops the server.

.. _webserver-port:

port
-----------------------------------------

Read only. Returns the port indicated to ``listen()``.


.. _request:

Request object
================

.. index:: http request

This is an object given to handlers, when the server receives a request from a browser.

.. _request-method:

method
-----------------------------------------

The http method of the request


.. _request-url:

url
-----------------------------------------

The requested URL, without the host and the scheme.
So it contains the path + the query string.

See path and querystring properties to have specific parts of the URL.

.. _request-httpVersion:

httpVersion
-----------------------------------------

The HTTP version indicated in the HTTP request

.. _request-headers:

headers
-----------------------------------------

Headers set in the HTTP request. This is a simple object: properties names are headers names,
and properties values are headers values.

.. _request-post:

post
-----------------------------------------

If the request is a POST http request, with content of mime-type
``application/x-www-form-urlencoded``, this property is an object containing all POST data
elements.

.. _request-postRaw:

postRaw
-----------------------------------------

The body content of the HTTP request

.. _request-path:

path
-----------------------------------------

The path part of the URL. 

SlimerJS only.

.. _request-queryString:

queryString
-----------------------------------------

The queryString part of the URL. 

SlimerJS only.


.. _response:

Response object
================

.. index:: http response

This object represents the response you'll return to the browser.
You have to indicate the status code, the content of the response if needed etc..

You **must** always call the ``close()`` method when you finish to build the response.

.. _response-statusCode:

statusCode
-----------------------------------------

You should set it to `an HTTP response code <http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html>`_.

.. _response-headers:

headers
-----------------------------------------

This is an object on which you set HTTP headers: properties names are headers names,
and properties values are headers values.


.. _response-setHeader:

setHeader(name, value)
-----------------------------------------

Convenient way to set an HTTP header


.. _response-header:

header(name)
-----------------------------------------

returns the value of the corresponding header. The search of the given name is aware of the
case of the name.

.. _response-setEncoding:

setEncoding(encoding)
-----------------------------------------

Allows to indicate the encoding of the response content (``UTF-8`` etc).

The special value "binary" allows output of binary data without corruption,
e.g. from a binary array.

.. _response-writeHead:

writeHead(statusCode, headers)
-----------------------------------------

You can set the status code and headers at the same time.

headers are then sent to the browser. You cannot set other headers after the call of this
function.

.. _response-write:

write(data)
-----------------------------------------

It adds content to the response. You can call this method several times.
If headers are not already sent, this method sends headers and it is not possible to
send other headers after this call.

.. _response-close:

close()
-----------------------------------------

Indicate that the response is complete, and the connection with the browser is closed. It
is not possible to send other data (header or content) after this method.

