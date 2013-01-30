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

phantom.injectJs("./test-environment.js");
phantom.injectJs("./test-require.js");
phantom.injectJs("./test-system.js");
phantom.injectJs("./test-webpage.js");
phantom.injectJs("./test-webpage-listeners.js");

var webserver = webServerFactory.create();
webserver.registerDirectory("/", phantom.libraryPath+'/www/')
webserver.listen(8083);


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
