#!/usr/bin/env slimerjs
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
phantom.injectJs("./jasmine/jasmine-tap.js");
phantom.injectJs("./jasmine/jasmine.async.min.js");

var slimerEnv = this;
var fs = require("fs");
var system = require("system");
var onlywebserver = false;
var URLUtils = null;
if ("slimer" in this) {
    URLUtils = require("sdk/url");
}

if (system.args.length == 2) {
    if (system.args[1] == '--only-web-servers' || system.args[1] == '--only-web-server') {
        onlywebserver = true;
    }
    else {
        phantom.injectJs("./network-utils.js");
        phantom.injectJs("./test-"+system.args[1]+".js");
    }
}
else {
    phantom.injectJs("./network-utils.js");
    phantom.injectJs("./test-fs.js");
    phantom.injectJs("./test-environment.js");
    phantom.injectJs("./test-require.js");
    phantom.injectJs("./test-system.js");
    phantom.injectJs("./test-webserver.js");
    phantom.injectJs("./test-proxy.js");
    phantom.injectJs("./test-webpage.js");
    phantom.injectJs("./test-webpage-listeners.js");
    phantom.injectJs("./test-webpage-loading-files.js");
    phantom.injectJs("./test-webpage-net-httpcodes.js");
    phantom.injectJs("./test-webpage-net-redirections.js");
    phantom.injectJs("./test-webpage-keyevent.js");
    phantom.injectJs("./test-webpage-keyevent2.js");
    phantom.injectJs("./test-webpage-mouseevent.js");
    phantom.injectJs("./test-webpage-callbacks.js");
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
    phantom.injectJs("./test-webpage-httpauth.js");
    phantom.injectJs("./test-webpage-request-abort.js");
    phantom.injectJs("./test-webpage-longrunningscript.js");
}

phantom.injectJs("./webserver-for-tests.js");


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
    jEnv.addReporter(new jasmine.TAPReporter("test_reports/main-tests.tap"));
    jEnv.updateInterval = 1000;
    jEnv.defaultTimeoutInterval = 15000; // for DNS check: it can be long on some systems
    jEnv.execute();
}
