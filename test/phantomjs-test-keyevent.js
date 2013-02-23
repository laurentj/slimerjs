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

var webServerFactory = require("webserver");
var fs = require("fs");


phantom.injectJs("./test-webpage-keyevent.js");
phantom.injectJs("./test-webpage-keyevent2.js");
//phantom.injectJs("./test-webpage-keyevent-phantom.js");


var webserverTest = webServerFactory.create();
webserverTest.listen(8083, function(request, response) {

    var filepath = phantom.libraryPath+'/www'+request.url;
    if (fs.exists(filepath)){
        if (fs.isFile(filepath)) {
            response.statusCode = 200;
            var str = fs.read(filepath, "b")
            var h = {};
            var enc = '';
            if (filepath.match(/\.png$/)) {
                response.setEncoding("binary");
                h['Content-Type'] = 'image/png';
            }
            else if (filepath.match(/\.css$/))
                h['Content-Type'] = 'text/css';
            else if (filepath.match(/\.js$/))
                h['Content-Type'] = 'text/javascript';
            else {
                h['Content-Type'] = 'text/html';
            }
            h['Content-Length'] = str.length;
            response.headers = h;
            response.write(str);
            response.close();
        }
        else {
            response.statusCode = 200;
            response.headers['Content-type'] = 'text/html';
            response.write('<html><head><title>directory</title></head><body>directory</body></html>');
            response.close();
        }
    }
    else {
        response.statusCode = 404;
        response.headers['Content-type'] = 'text/html';
        response.write('<html><head><title>error</title></head><body>File Not Found</body></html>');
        response.close();
    }
});


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
jEnv.execute();
