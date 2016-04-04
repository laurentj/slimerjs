/*
* This file is part of the SlimerJS project from Innophi.
* https://github.com/laurentj/slimerjs
*
* Copyright (c) 2014 Laurent Jouanneau
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


var webServerFactory = require("webserver");
var webserverTest = webServerFactory.create();
webserverTest.listen(8083, function(request, response) {

    if (request.url == '/redirectToSimpleHello') {
        response.statusCode = 301;
        response.headers['Location'] = 'http://localhost:8083/simplehello.html';
        response.headers['foo'] = 'bar';
        response.write('');
        response.close();
        return;
    }

    if (request.url == '/redirectToRoot') {
        response.statusCode = 301;
        response.headers['Location'] = 'http://localhost:8083';
        response.write('');
        response.close();
        return;
    }

    if (request.url == '/redirectToSimpleHello2') {
        response.statusCode = 302;
        response.headers['Location'] = '/simplehello.html';
        response.headers['foo'] = 'bar';
        response.write('');
        response.close();
        return;
    }

    if (request.url == '/getHeaders') {
        response.statusCode = 200;
        response.headers = { "Content-Type": "text/plain;charset=UTF-8"}
        try {
            var data = {
                method: request.method,
                headers: request.headers,
                body: request.postRaw
            };
            response.write(JSON.stringify(data));
        }
        catch(e) {
            response.write("Error:"+e)
        }
        response.close();
        return;
    }

    if (request.url == '/getCookies') {
        response.statusCode = 200;
        response.headers = {
            "Content-Type": "text/plain;charset=UTF-8",
            "Set-Cookie": "UserID=JohnDoe; Max-Age=3600;"
        }
        try {
            response.write(JSON.stringify(request.headers));
        }
        catch(e) {
            response.write("Error:"+e)
        }
        response.close();
        return;
    }

    if (request.url == '/needauth') {
        var headers = { "Content-Type": "text/plain;charset=UTF-8"}
        var message = '';
        if (! ('Authorization' in request.headers)
            || request.headers['Authorization'] != 'Basic bGF1cmVudDoxMjM0') {
            headers['WWW-Authenticate'] = 'Basic realm="Slimer auth test"';
            message = 'auth is needed';
            response.statusCode = 401;
        }
        else {
            message = "authentication is ok";
            response.statusCode = 200;
        }

        response.headers = headers;
        response.write(message);
        response.close();
        return;
    }

    if (request.url == '/asynchronousResponse') {
        window.setTimeout(function () {
            response.write('done'); // response is generated asynchronously
            response.close();
        }, 200);
        return;
    }

    if (request.url == '/timeouttest') {
        window.setTimeout(function () {
            response.write('done');
            response.close();
        }, 10000);
        return;
    }

    if (request.url == '/posturlencodeddata') {
        response.statusCode = 200;
        response.headers = { "Content-Type": "text/plain;charset=UTF-8"}
        try {
            var data = {
                method: request.method,
                headers: request.headers,
                body: request.postRaw,
                bodyData : request.post,
            };
            response.write(JSON.stringify(data));
        }
        catch(e) {
            response.write("Error:"+e)
        }
        response.close();
        return;
    }

    if (request.url == '/misc_chars') {
        response.statusCode = 200;
        response.headers = {
            "Content-Type": "text/plain;charset=UTF-8",
        }
        try {
            //response.setEncoding('UTF-8');
            response.write("Hello World! 你好 ! çàéè");
        }
        catch(e) {
            response.write("Error:"+e)
        }
        response.close();
        return;
    }

    if (/^\/statuscode\//.test(request.url)) {
        response.statusCode = parseInt(/\/(\d+)$/.exec(request.url)[1], 10);
        if (response.statusCode != 204 && response.statusCode != 304) {
            response.headers = {
                "Content-Type": "text/plain;charset=UTF-8",
            }
            response.write("A response");
        }
        else
            response.write("");

        response.close();
        return;
    }

    if (/^\/downloadzipfile/.test(request.url)) {
        let content = fs.read(phantom.libraryPath+'/www/example.zip', "b");
        response.statusCode = 200;
        let headers = { "Content-Type": "application/zip"}
        headers['Content-Length'] = content.length;
        if (request.url == '/downloadzipfile?dispo') {
            headers['Content-Disposition'] = 'attachment; filename="super.zip"';
            headers['Content-Description'] = 'File download';
            headers['Content-Transfer-Encoding'] = 'binary';
        }
        response.headers = headers;
        response.write(content);
        response.close();
        return;
    }

    var filepath = phantom.libraryPath+'/www'+request.url;
    if (fs.exists(filepath)){
        if (fs.isFile(filepath)) {
            response.statusCode = 200;
            var str = ''
            var h = {};
            var enc = '';
            var binfile = false;
            if (filepath.match(/\.(png)$/)) {
                //response.setEncoding("binary");
                //h['Content-Type'] = 'image/png';
                binfile = true;
            }
            else if (filepath.match(/\.css$/)) {
                h['Content-Type'] = 'text/css';
            }
            else if (filepath.match(/\.js$/)) {
                h['Content-Type'] = 'text/javascript';
            }
            else if (filepath.match(/\.txt$/)) {
               h['Content-Type'] = 'text/plain;charset=UTF-8';
            }
            else if (filepath.match(/\.json$/)) {
               h['Content-Type'] = 'application/json';
            }
            else if (filepath.match(/\.zip$/)) {
               h['Content-Type'] = 'application/zip';
               binfile = true;
            }
            else if (filepath.match(/\.pdf$/)) {
               h['Content-Type'] = 'application/pdf';
               binfile = true;
            }
            else {
                h['Content-Type'] = 'text/html;charset=UTF-8';
            }

            if (binfile) {
                str = fs.read(filepath, "b")
            }
            else {
                str = fs.read(filepath)
            }

            h['Content-Length'] = str.length;
            response.headers = h;
            response.write(str);
            response.close();
        }
        else {
            response.statusCode = 200;
            response.headers['Content-type'] = 'text/html';
            response.write('<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>directory</title></head><body>directory</body></html>');
            response.close();
        }
    }
    else {
        response.statusCode = 404;
        response.headers['Content-type'] = 'text/html';
        response.write('<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>error</title></head><body>File Not Found</body></html>');
        response.close();
    }
});

var webserverTestWebPage = webServerFactory.create();
webserverTestWebPage.listen(8082, function(request, response) {
    response.statusCode = 200;
    response.write('<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>hello world</title></head><body>Hello!</body></html>');
    response.close();
});
