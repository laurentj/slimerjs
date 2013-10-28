/*
* This file is part of the SlimerJS project from Innophi.
* https://github.com/laurentj/slimerjs
*
* Copyright (c) 2013 Laurent Jouanneau
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

phantom.injectJs("./jasmine/jasmine.js");
phantom.injectJs("./jasmine/jasmine-console.js");
phantom.injectJs("./jasmine/jasmine.async.min.js");

var slimerEnv = this;
var webServerFactory = require("webserver");
var fs = require("fs");
var system = require("system");
var onlywebserver = false;

if (system.args.length == 2) {
    if (system.args[1] == '--only-web-servers' || system.args[1] == '--only-web-server') {
        onlywebserver = true;
    }
    else
        phantom.injectJs("./test-"+system.args[1]+".js");
}
else {
    phantom.injectJs("./test-environment.js");
    phantom.injectJs("./test-require.js");
    phantom.injectJs("./test-system.js");
    phantom.injectJs("./test-webserver.js");
    phantom.injectJs("./test-webpage.js");
    phantom.injectJs("./test-webpage-listeners.js");
    phantom.injectJs("./test-webpage-keyevent.js");
    phantom.injectJs("./test-webpage-keyevent2.js");
    phantom.injectJs("./test-webpage-mouseevent.js");
    phantom.injectJs("./test-webpage-callbacks.js");
    phantom.injectJs("./test-webpage-render.js");
    phantom.injectJs("./test-webpage-prompt.js");
    phantom.injectJs("./test-webpage-open.js");
    phantom.injectJs("./test-webpage-frames.js");
    phantom.injectJs("./test-webpage-callPhantom.js");
    phantom.injectJs("./test-webpage-onerror.js");
    phantom.injectJs("./test-webpage-navigation.js");
    phantom.injectJs("./test-webpage-headers.js");
    phantom.injectJs("./test-webpage-filepicker.js");
    phantom.injectJs("./test-phantom-cookies.js");
    phantom.injectJs("./test-webpage-cookies.js");
}

var webserverTest = webServerFactory.create();
webserverTest.listen(8083, function(request, response) {

    if (request.url == '/redirectToSimpleHello') {
        response.statusCode = 301;
        response.headers['Location'] = 'http://localhost:8083/simplehello.html';
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

    if (request.url == '/asynchronousResponse') {
        window.setTimeout(function () {
            response.write('done'); // response is generated asynchronously
            response.close();
        }, 200);
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

    var filepath = phantom.libraryPath+'/www'+request.url;
    if (fs.exists(filepath)){
        if (fs.isFile(filepath)) {
            response.statusCode = 200;
            var str = ''
            var h = {};
            var enc = '';
            var binfile = false;
            if (filepath.match(/\.png$/)) {
                //response.setEncoding("binary");
                //h['Content-Type'] = 'image/png';
                binfile = true;
            }
            else if (filepath.match(/\.css$/))
                h['Content-Type'] = 'text/css';
            else if (filepath.match(/\.js$/))
                h['Content-Type'] = 'text/javascript';
            else if (filepath.match(/\.txt$/))
               h['Content-Type'] = 'text/plain;charset=UTF-8';
            else {
                h['Content-Type'] = 'text/html;charset=UTF-8';
            }

            if (binfile)
                str = fs.read(filepath, "b")
            else
                str = fs.read(filepath)

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

if (onlywebserver) {
    console.log("Web servers are started. listen on http://localhost:8083 and http://localhost:8082")
}
else {
    // Launch tests
    var jEnv = jasmine.getEnv();
    var reporter = new jasmine.ConsoleReporter(
                                    function(msg){
                                        console.log(msg.replace('\n', ''));
                                    },
                                    function(rep){
                                        phantom.exit();
                                    },
                                    true);
    jEnv.addReporter(reporter);
    jEnv.updateInterval = 1000;
    jEnv.defaultTimeoutInterval = 15000; // for DNS check: it can be long on some systems
    jEnv.execute();
}