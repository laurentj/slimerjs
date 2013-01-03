/*
* This file is part of the SlimerJS project from Innophi.
* https://github.com/laurentj/slimerjs
*
* Copyright (c) 2012 Laurent Jouanneau
*
* Permission is hereby granted, free of charge, to any person obtaining a
* copy of this software and associated documentation files (the "Software"),
* to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense,
* and/or sell copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included
* in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
* OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
* THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
* DEALINGS IN THE SOFTWARE.
*/

var EXPORTED_SYMBOLS = ["create"];
Components.utils.import("resource://gre/modules/Services.jsm");


function create() {
    var server = Components.classes["@mozilla.org/server/jshttp;1"]
                           .createInstance(Components.interfaces.nsIHttpServer);
    var handlerCallback = null;

    var requestHandler = {
        handle : function (request, response) {
            var req = new HttpRequest(request);
            var resp = new HttpResponse(response);
            handlerCallback(req, resp);
        },
        QueryInterface: function(iid) {
          if (iid.equals(Components.interfaces.nsIHttpRequestHandler) || iid.equals(Components.interfaces.nsISupports))
            return this;
          throw Components.results.NS_ERROR_NO_INTERFACE;
        }
    }
    server.registerPrefixHandler("/", requestHandler);

    return {
        listen: function(port, callback) {
            handlerCallback = callback;

            if (typeof port === "string" && port.indexOf(':') != -1){
                let host;
                [host, port] = port.split(':');
                port = parseInt(port);
                server.identity.add('http', host, port);
            }
            server.start(port);
        },
        close: function(){
            server.stop(function(){});
        }
    }
}

function HttpRequest(request) {
    this._request = request;

    let BinaryInputStream = Components.Constructor(
         "@mozilla.org/binaryinputstream;1",
         "nsIBinaryInputStream",
         "setInputStream");
    let count = request.bodyInputStream.available();
 
    this._rawbody = this._body = new BinaryInputStream(request.bodyInputStream).readBytes(count);
    try {
        let type = request.getHeader("content-type");
        if (type == 'application/x-www-form-urlencoded') {
            this._body = {}
            for( let param in this._rawbody.split('&')) {
                let [name, value] = param.split('=');
                this._body[name] = decodeURIComponent(value);
            }
        }
    }catch(e) {
    }
}

HttpRequest.prototype = {
    get method () {
        return this._request.method;
    },
    get url () {
        let u = this._request.scheme+'://'+this._request.host;
        if (this._request.port != 80) {
            u += ':'+this._request.port;
        }
        u += this._request.path;
        if (this._request.queryString != '')
            u += '?'+this._request.queryString;
        return u;
    },
    get httpVersion() {
        return this._request.httpVersion;
    },
    get headers() {
        let henum = this._request.headers;
        let harr = {}
        while(henum.hasMoreElements()) {
            let h = henum.getNext().QueryInterface(Components.interfaces.nsISupportsString).data;
            harr[h] = this._request.getHeader(h);
        }
        return harr;
    },
    get post() {
        return this._body;
    },
    get postRaw() {
        return this._rawbody;
    }
}

function HttpResponse(response) {
    this.headers = {}
    this.statusCode = 200;
    this._response = response;
    this._headersSent = false;
}

HttpResponse.prototype = {

    write : function(data) {
        if (!this._headersSent) {
            sendHeaders(this);
            this._headersSent = true;
            this._response.processAsync();
        }
        this._response.write(data);
    },
    writeHead: function(statusCode, headers) {
        if (this._headersSent)
            throw "Header already sent";
        this.statusCode = statusCode;
        this.headers = headers;
        sendHeaders(this);
        this._headersSent = true;
    },
    close : function() {
        if (!this._headersSent) {
            sendHeaders(this);
            this._headersSent = true;
            this._response.processAsync();
            this._response.write('');
        }
        this._response.finish();
    }
}


function sendHeaders(response) {
    let r = response._response;
    let desc = httpCode[response.statusCode] || '';
    r.setStatusLine('1.1', response.statusCode, desc);
    for (let h in response.headers) {
        r.setHeader(h, response.headers[h], false);
    }
}
var httpCode = {
'100': "Continue",
'101':'Switching Protocols',
'200': 'OK',
'201':'Created',
'202':'Accepted',
'203':'Non-Authoritative Information',
'204':'No Content',
'205':'Reset Content',
'206':'Partial Content',
'300':'Multiple Choices',
'301':'Moved Permanently',
'302':'Found',
'303':'See Other',
'304':'Not Modified',
'305':'Use Proxy',
'307':'Temporary Redirect',
'400': "Bad Request",
'401': "Unauthorized",
'402': "Payment Required",
'403': "Forbidden",
'404': "Not Found",
'405': "Method Not Allowed",
'406': "Not Acceptable",
'407': "Proxy Authentication Required",
'408': "Request Timeout",
'409': "Conflict",
'410': "Gone",
'411': "Length Required",
'412': "Precondition Failed",
'413': "Request Entity Too Large",
'414': "Request-URI Too Long",
'415': "Unsupported Media Type",
'417': "Expectation Failed",
'500': "Internal Server Error",
'501': "Not Implemented",
'502': "Bad Gateway",
'503': "Service Unavailable",
'504': "Gateway Timeout",
'505': "HTTP Version Not Supported"
}
