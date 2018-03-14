/*
First test file in the history of SlimerJS, used to tests very basic things before the use
of a true framework, to not depend of features that didn't exist at that time
*/
console.log('Initial tests');

function assertExists(arg, title) {
    if (arg) {
        console.log(title+"\tOK");
    }
    else
        console.log(title+"\t\t-----> FAIL!!!");
}

function assertEquals(expected, result, title) {
    if (expected == result) {
        console.log(title+"\tOK");
    }
    else{
        console.log(title+"\t\t-----> FAIL!!! given result: "+result+"");
    }
}
function assertNotEquals(expected, result, title) {
    if (expected != result) {
        console.log(title+"\tOK");
    }
    else{
        console.log(title+"\t\t-----> FAIL!!! given result: "+result);
    }
}

assertExists(window, "has window object? ");
assertExists(document, "has document object? ");
assertExists(window.document, "has window.document object? ");
assertExists(console, "has console object? ");
assertExists(alert, "has alert object? ");
assertExists(confirm, "has alert object? ");
console.log('Message console should be "log ok": ');
console.log('log ok');

assertExists(phantom, "has phantom object? ");

if ("slimer" in this) {
    assertExists(slimer, "has slimer object? ");
    assertExists(slimer.version, "has slimer.version object? ");
    assertEquals("1", slimer.version.major, "slimer has the good major version");
    assertEquals("0", slimer.version.minor, "slimer has the good minor version");
    assertEquals("0", slimer.version.patch, "slimer has the good patch version");
    assertEquals("rc.1", slimer.version.prerelease, "slimer has the good prerelease version");
    assertExists(slimer.version, "has slimer.version object? ");
    assertNotEquals(undefined, slimer.geckoVersion.major, "slimer has major gecko version: "+ slimer.geckoVersion.major);
    assertNotEquals(undefined, slimer.geckoVersion.minor, "slimer has minor gecko version: "+ slimer.geckoVersion.minor);
    assertNotEquals(undefined, slimer.geckoVersion.patch, "slimer has patch gecko version: "+ slimer.geckoVersion.patch);
    assertNotEquals(undefined, slimer.version.prerelease, "slimer has prerelease gecko version: "+ slimer.geckoVersion.prerelease);
}
else {
    console.warn("==> No slimer object!");
}
assertEquals("1", phantom.version.major, "phantom has the good major version");
assertEquals("9", phantom.version.minor, "phantom has the good minor version");
assertEquals("8", phantom.version.patch, "phantom has the good patch version");

assertEquals(true, "require" in this, "there is a require object");
assertEquals("function", typeof require, "require is a function");

if ("module" in this) {
    assertEquals(true, "module" in this, "there is a module property");
    assertNotEquals("", module.uri, "module uri");
    assertEquals("main", module.id, "module id");
}
else
    console.warn("==> No 'module' object!")

var ex = require('./requiredexample');
assertExists(ex, "is 'ex' defined? ");
assertEquals("foo", ex.myExample, "value of ex.myExample");
assertEquals(5, ex.myCalcFunc(2), "value of ex.myCalcFunc(2)");

assertEquals(true, ex.hasWindowObject , "the loaded module has a window object");
assertEquals(true, ex.hasDocumentObject , "the loaded module has a document object");
assertEquals(true, ex.hasConsoleObject , "the loaded module has a console object");
assertEquals(true, ex.hasAlertFunction , "the loaded module has a alert function");
assertEquals(true, ex.hasConfirmFunction , "the loaded module has a confirm function");
assertEquals(true, ex.hasPhantomObject , "the loaded module has a phantom object");

var m = require('./a/b');
assertEquals("Laurent", m.identity.firstName, "value of m.identity.firstName");

var injectedValue = '';
phantom.injectJs('wwwfile/injectslimer.js');
assertEquals("myvalue", injectedValue, "value of injectedValue");
assertEquals("yes!", newinjectedvalue, "value of newinjectedvalue");

var fs = require("fs");

var system = require("system");

console.log("\n------ you should see the output of system.stdout\noutput:")

system.stdout.write("Hello");
system.stdout.write(" World - character with accent: ąćęłńśóźż");
system.stderr.write(" message from system.stderr");
console.log("\n------ check yourself if following values are ok")

console.log("os.architecture="+system.os.architecture);
console.log("os.name="+system.os.name);
console.log("os.version="+system.os.version);


console.log("--- Environment variable:")
console.log("  HOME="+system.env['HOME']);
console.log("  LOGNAME="+system.env['LOGNAME']);

console.log("--- Command line arguments:")
system.args.forEach(function(arg, i){
    console.log("   "+i+": "+arg);
});

console.log('\n------ test webserver');

var webserver = require("webserver").create();

var service = webserver.listen(8082, function(request, response) {
    response.statusCode = 200;
    var str = '<html><head><meta charset="utf-8"><title>hello world</title>';
    str += '<script type="text/javascript">var foo="bar";</script></head>';
    str += '<body>Hello! <script type="text/javascript">document.write("world")</script></body></html>'
    response.write(str);
    response.close();
});

var webserver2 = require("webserver").create();
var service = webserver2.listen(8083, function(request, response) {
    response.statusCode = 200;
    response.write('<html><head><title>Inject test</title></head>');
    response.write('<body><p id="test">example</p></body></html>');
    response.close();
});


var webpage = require("webpage").create();
var url = "http://127.0.0.1:8082/";

setTimeout(function(){ // wait after the webserver init process

    webpage.open(url, function(success){
        console.log('\n------ tests on webpage:');
        assertEquals("success", success, "Webpage loaded");
        assertEquals(url, webpage.url, "browser should have the right url");
        assertEquals("Hello! document.write(\"world\")world", webpage.evaluate(function(){
                        return document.body.textContent;
                    }), "retrieve body content");

        assertEquals("title: hello world bar", webpage.evaluate(function(prefix){
                        return prefix+document.title+" "+foo;
                    }, "title: "), "retrieve title page");

        webpage.close();
        webserver.close();
        
        
        var webpage2 = require("webpage").create();
        webpage2.libraryPath += '/wwwfile';
        url = "http://127.0.0.1:8083/";
        webpage2.open(url, function(success){
            console.log('\n------ tests on webpage2:');
            webpage2.injectJs('inject.js');
            assertEquals("foo", webpage2.evaluate(function(){
                            return document.getElementById("test").getAttribute('class');
                        }), "retrieve change after injection")
            webpage2.close();
            webserver2.close();

            console.log('\n------------------- END of tests\n');
            phantom.exit()
        })
    })
}, 200);

console.log('\n------ tests on onerror support');

phantom.onError = function(msg, stack) {
    assertEquals("Test onerror listener", msg, "message of the exception")
    assertEquals(3, stack.length, "length of the stack");
    assertNotEquals(-1, stack[0].sourceURL.indexOf('requiredexample.js'), "filename is requiredexample.js")
    assertEquals(9, stack[0].line, "line in requiredexample.js")
    assertEquals("", stack[0].function, "function in stack")
    assertNotEquals(-1, stack[1].sourceURL.indexOf('requiredexample.js'), "filename is requiredexample.js")
    assertEquals(9, stack[1].line, "line in requiredexample.js")
    assertEquals("exports.throwExcept", stack[1].function, "function in stack")
    assertNotEquals(-1, stack[2].sourceURL.indexOf('initial-tests.js'), "filename is initial-tests.js")
    assertEquals(196, stack[2].line, "line in initial-tests.js")
    assertEquals("", stack[2].function, "function in stack")
}

ex.throwExcept();
