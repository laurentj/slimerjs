/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var EXPORTED_SYMBOLS = ["create"];
Components.utils.import("resource://gre/modules/Services.jsm");

function create() {
    var server = Components.classes["@mozilla.org/server/jshttp;1"]
                           .createInstance(Components.interfaces.nsIHttpServer);
    return {
        get objectName () {
            return "WebServer";
        },

        /**
         * @param integer|string port    port or "host:port"
         * @param object opt            optional options. (not supported)
         * @param function callback     optional callback
         */
        listen: function(port, opt, callback) {
            if (arguments.length == 2 && "function" == typeof opt) {
                callback = opt;
            }
            if (callback) {
                this.registerPrefixHandler("/", callback);
            }
            let host = "localhost";
            // FIXME: we cannot bind to 0.0.0.0 by default because we should
            // then add identity of every network interface, in order
            // to avoid 400 error. See httpd.js:1609 -> var scheme = identity.getScheme(host, port);
            // and added an identity with host=0.0.0.0 does not work: many errors in httpd
            // during a request.
            if (typeof port === "string") {
                let pos = port.lastIndexOf(':');
                if (pos != -1){
                    host = port.substring(0, pos);
                    port = parseInt(port.substring(pos+1));
                    server.identity.add('http', host, port);
                }
            }
            server.wrappedJSObject._start(port, host);
            return true;
        },

        registerFile: function(path, filePath) {
            var file = Components.classes['@mozilla.org/file/local;1']
                            .createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(filePath);
            return server.registerFile(path, file);
        },

        registerDirectory : function(path, directoryPath) {
            var file = Components.classes['@mozilla.org/file/local;1']
                            .createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(directoryPath);
            return server.registerDirectory(path, file);
        },

        registerPathHandler: function(path, handlerCallback) {
            server.registerPathHandler(path, function (request, response) {
                    var req = createHttpRequest(request);
                    var resp = new HttpResponse(response);
                    handlerCallback(req, resp);
            });
        },

        registerPrefixHandler: function(prefix, handlerCallback) {
            server.registerPrefixHandler(prefix, function (request, response) {
                    var req = createHttpRequest(request);
                    var resp = new HttpResponse(response);
                    handlerCallback(req, resp);
                });
        },

        close: function(){
            server.stop(function(){});
        },
        get port() {
            return server.identity.primaryPort
        }
    }
}

function parseQueryString(qs) {
    if (qs == "")
        return {}
    let listparam;
    if (qs.indexOf('&') == -1) {
        listparam = [qs];
    }
    else {
        listparam = qs.split('&');
    }
    let result = {}
    listparam.forEach(function(element, index, arr) {
        let [name, value] = element.split('=');
        result[name] = decodeURIComponent(value);
    });
    return result;
}

function guessContentType(data) {
    var stringStream = Components.classes["@mozilla.org/io/string-input-stream;1"]
                            .createInstance(Components.interfaces.nsIStringInputStream);
    stringStream.setData(data, data.length);

    let binInput = Components.classes["@mozilla.org/binaryinputstream;1"].
                    createInstance(Components.interfaces.nsIBinaryInputStream);
    binInput.setInputStream(stringStream);

    let first = binInput.read8();
    let second = binInput.read8();
    let third = binInput.read8();
    let fourth = binInput.read8();
    if (first == 0xFF && second == 0xD8 && third == 0xFF
        && (fourth == 0xE0 || fourth == 0xE1)) {
        return ['image/jpg', true];
    }
    else if (first == 0x49 && second == 0x48 && third == 0x2A) {
        return ['image/tiff', true];
    }
    else if (first == 0x4D && second == 0x4D && third == 0x2A) {
        return ['image/tiff', true];
    }
    else if (first == 0x49 && second == 0x47 && second == 0x46) {
        return ['image/gif', true];
    }
    else if (first == 0x42 && second == 0x4d) {
        return ['image/bmp', true];
    }
    else if (first == 0x89 && second == 0x50 && third == 0x4E
             && fourth == 0x47) {
        return ['image/png', true];
    }
    return ['', false];
}

function createHttpRequest(request) {

    var req = {
        method : request.method,
        url : '',
        httpVersion: request.httpVersion,
        headers: {},
        post: '',
        postRaw : '',
         // not compatible with PhantomJS 1.8
        path: request.path,
         // not compatible with PhantomJS 1.8
        queryString: request.queryString
    }

    // url
    req.url = request.path;
    if (request.queryString != '') {
        req.url += '?'+request.queryString;
    }
   
    // content
    let BinaryInputStream = Components.Constructor(
         "@mozilla.org/binaryinputstream;1",
         "nsIBinaryInputStream",
         "setInputStream");
    let count = request.bodyInputStream.available();
 
    req.postRaw = req.post = new BinaryInputStream(request.bodyInputStream).readBytes(count);

    let type = '';
    if (request.hasHeader("Content-Type")){
        type = request.getHeader("Content-Type");
    }
    else if (request.hasHeader("content-type")){
        type = request.getHeader("content-type");
    }

    if (type == 'application/x-www-form-urlencoded') {
        req.post = parseQueryString(req.postRaw);
    }

    // headers
    let henum = request.headers;
    while(henum.hasMoreElements()) {
        let h = henum.getNext().QueryInterface(Components.interfaces.nsISupportsString).data;
        req.headers[h] = request.getHeader(h);
    }
    return req;
}


function HttpResponse(response) {
    this.headers = {}
    this.statusCode = 200;
    this._response = response;
    this._headersSent = false;
    this._encoding = null;
    this._bodySendingStarted = false;
}
const PR_UINT32_MAX = Math.pow(2, 32) - 1;
HttpResponse.prototype = {

    setEncoding: function(encoding) {
        this._encoding = encoding;
    },

    header:function(name) {
        let n = name.toLowerCase();
        for (let n2 in this.headers) {
            if (n2.toLowerCase() == n)
                return this.headers[n2];
        }
        return '';
    },

    setHeader:function(name, value) {
        this.headers[name] = value;
    },

    write : function(data) {
        if (!this._headersSent) {
            sendHeaders(this);
            this._headersSent = true;
        }

        let encoding = this._encoding;

        if (!this._bodySendingStarted) {
            if (this.header('Content-Type') == '' && data) {
                let [contentType, binaryEncoding] = guessContentType(data);
                if (contentType) {
                    this._response.setHeader('Content-Type', contentType, false);
                    if (binaryEncoding && !encoding) {
                        encoding = 'binary';
                    }
                }
            }
            this._bodySendingStarted = true;
            this._response.processAsync();
        }

        if (data == '') { // || !encoding) {
            this._response.write(data);
        }
        else if (encoding == 'binary') {
            let pipe = Components.classes["@mozilla.org/pipe;1"].createInstance(Components.interfaces.nsIPipe);
            pipe.init(true, false, 8192, PR_UINT32_MAX, null);
            let binOutput = Components.classes["@mozilla.org/binaryoutputstream;1"].
                           createInstance(Components.interfaces.nsIBinaryOutputStream);
            binOutput.setOutputStream(pipe.outputStream);
            binOutput.writeBytes(data, data.length);

            this._response.bodyOutputStream.writeFrom(pipe.inputStream, data.length)
        }
        else {
            var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                        .createInstance(Components.interfaces.nsIConverterOutputStream);
            os.init(this._response.bodyOutputStream, encoding || 'UTF-8', 0, 0x0000);
            os.writeString(data);
        }
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
        /*if (!this._headersSent) {
            sendHeaders(this);
            this._headersSent = true;
            this._response.processAsync();
            this._response.write('');
        }*/
        this._response.finish();
    },

    closeGracefully: function() {
        this.write('');
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
