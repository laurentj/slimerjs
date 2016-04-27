
describe("WebPage.onError", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/onerror.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });


    it("is called when an error occured on a click in a webpage",function() {
        var loaded = false;
        var errorMessage = null;
        var errorStack = null;
 
        webpage.onError = function(msg, stack) {
            errorMessage = msg;
            errorStack = stack;
        }

        runs(function() {
            webpage.open(url, function(success){
                webpage.sendEvent("click", 15, 15, 'left', 0);
                setTimeout(function(){ // error message are received asynchronously, wait a bit
                    loaded = true;
                }, 300);
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(errorMessage).toEqual("Error: error on click");
            expect(errorStack.length).toEqual(11)
            expect(errorStack[0].file).toEqual("http://127.0.0.1:8083/onerror.html")
            expect(errorStack[0].line).toEqual(8)
            if (slimer.geckoVersion.major > 43) {
                expect(errorStack[0].column).toEqual(23)
            }
            else if (slimer.geckoVersion.major > 32) {
                expect(errorStack[0].column).toEqual(22)
            }
            else if (slimer.geckoVersion.major > 30) {
                expect(errorStack[0].column).toEqual(16)
            }
            expect(errorStack[0]["function"]).toEqual("doError")
            expect(errorStack[1].file).toEqual("http://127.0.0.1:8083/onerror.html")
            expect(errorStack[1].line).toEqual(1)
            expect(errorStack[1]["function"]).toEqual("onclick")
        });
    });

    it("is called when an error occured during js evaluation",function() {
        var loaded = false;
        var errorMessage = null;
        var errorStack = null;
 
        webpage.onError = function(msg, stack) {
            errorMessage = msg;
            errorStack = stack;
        }

        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            var result = webpage.evaluate(function(){
                throw new Error("error from evaluate");
            })
            expect(errorMessage).toEqual("Error: error from evaluate");
            expect(errorStack.length).toEqual(3);
            expect(errorStack[0].file).toEqual("phantomjs://webpage.evaluate()")
            expect(errorStack[0].line).toEqual(2)
            expect(errorStack[0]["function"]).toEqual("")
            expect(errorStack[1].file).toEqual("phantomjs://webpage.evaluate()")
            expect(errorStack[1].line).toEqual(2)
            expect(errorStack[1]["function"]).toEqual("")
            if (slimer.geckoVersion.major > 32) {
                expect(errorStack[2].file).toEqual("phantomjs://webpage.evaluate()")
                expect(errorStack[2].line).toEqual(1)
                expect(errorStack[2]["function"]).toEqual("")
            }
            else if (slimer.geckoVersion.major > 24) {
                expect(errorStack[2].file).toEqual("phantomjs://webpage.evaluate()")
                expect(errorStack[2].line).toEqual(3)
                expect(errorStack[2]["function"]).toEqual("")
            }

            if (slimer.geckoVersion.major > 43) {
                expect(errorStack[0].column).toEqual(23)
                expect(errorStack[1].column).toEqual(23)
                expect(errorStack[2].column).toEqual(2)
            }
            else if (slimer.geckoVersion.major > 32) {
                expect(errorStack[0].column).toEqual(22)
                expect(errorStack[1].column).toEqual(23)
                expect(errorStack[2].column).toEqual(1)
            }
            else if (slimer.geckoVersion.major > 29) {
                expect(errorStack[0].column).toEqual(16)
                expect(errorStack[1].column).toEqual(17)
                expect(errorStack[2].column).toEqual(1)
            }

            errorMessage = null;
            errorStack = null;
            webpage.evaluateJavaScript('(function(){throw new Error("error from evaluateJavascript");})()');
            expect(errorMessage).toEqual("Error: error from evaluateJavascript");
            expect(errorStack.length).toEqual(3);
            expect(errorStack[0].file).toEqual("phantomjs://webpage.evaluateJavaScript()")
            expect(errorStack[0].line).toEqual(1)
            expect(errorStack[0]["function"]).toEqual("")
            expect(errorStack[1].file).toEqual("phantomjs://webpage.evaluateJavaScript()")
            expect(errorStack[1].line).toEqual(1)
            expect(errorStack[1]["function"]).toEqual("")
            if (slimer.geckoVersion.major > 24) {
                expect(errorStack[2].file).toEqual("phantomjs://webpage.evaluateJavaScript()")
                expect(errorStack[2].line).toEqual(1)
                expect(errorStack[2]["function"]).toEqual("")
            }
            if (slimer.geckoVersion.major > 43) {
                expect(errorStack[0].column).toEqual(19)
                expect(errorStack[1].column).toEqual(19)
                expect(errorStack[2].column).toEqual(2)
            }
            else if (slimer.geckoVersion.major > 32) {
                expect(errorStack[0].column).toEqual(18)
                expect(errorStack[1].column).toEqual(19)
                expect(errorStack[2].column).toEqual(2)
            }
            else if (slimer.geckoVersion.major > 29) {
                expect(errorStack[0].column).toEqual(12)
                expect(errorStack[1].column).toEqual(13)
                expect(errorStack[2].column).toEqual(2)
            }
            errorMessage = null;
            errorStack = null;
            webpage.libraryPath += '/wwwfile';
            webpage.injectJs('injectdoerror.js');
            expect(errorMessage).toEqual("Error: error from injectdoerror.js");
            expect(errorStack.length).toEqual(3);
            expect(errorStack[0].file).toEqual("injectdoerror.js")
            expect(errorStack[0].line).toEqual(2)
            expect(errorStack[0]["function"]).toEqual("")
            expect(errorStack[1].file).toEqual("injectdoerror.js")
            expect(errorStack[1].line).toEqual(2)
            expect(errorStack[1]["function"]).toEqual("doInjectError")
            if (slimer.geckoVersion.major > 24) {
                expect(errorStack[2].file).toEqual("injectdoerror.js")
                expect(errorStack[2].line).toEqual(5)
                expect(errorStack[2]["function"]).toEqual("")
            }
            if (slimer.geckoVersion.major > 43) {
                expect(errorStack[0].column).toEqual(11)
                expect(errorStack[1].column).toEqual(11)
                expect(errorStack[2].column).toEqual(1)
            }
            else if (slimer.geckoVersion.major > 32) {
                expect(errorStack[0].column).toEqual(10)
                expect(errorStack[1].column).toEqual(11)
                expect(errorStack[2].column).toEqual(1)
            }
            else if (slimer.geckoVersion.major > 29) {
                expect(errorStack[0].column).toEqual(4)
                expect(errorStack[1].column).toEqual(5)
                expect(errorStack[2].column).toEqual(1)
            }
        });
    });

    it("is called when an error occured during js inclusion",function() {
        var loaded = false;
        var errorMessage = null;
        var errorStack = null;
 
        webpage.onError = function(msg, stack) {
            errorMessage = msg;
            errorStack = stack;
        }

        runs(function() {
            webpage.open(url, function(success){
                webpage.includeJs("http://127.0.0.1:8083/doerror.js", function() {
                    loaded = true;
                });
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(errorMessage).toEqual('Error: error from doerror.js');
            expect(errorStack.length).toEqual(3)
            expect(errorStack[0].file).toEqual("http://127.0.0.1:8083/doerror.js")
            expect(errorStack[0].line).toEqual(2)
            expect(errorStack[0]["function"]).toEqual("arrrrrg")
            expect(errorStack[1].file).toEqual("http://127.0.0.1:8083/doerror.js")
            expect(errorStack[1].line).toEqual(5)
            expect(errorStack[1]["function"]).toEqual("")

            webpage.close();
        });
    });

    it("is called during the load of a page",function() {
        var loaded = false;
        var errorMessage = null;
        var errorStack = null;
 
        webpage.onError = function(msg, stack) {
            errorMessage = msg;
            errorStack = stack;
        }

        runs(function() {
            webpage.open("http://127.0.0.1:8083/typeerror.html", function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(errorMessage).toEqual("TypeError: \"test\".match(...) is null");
            expect(errorStack.length).toEqual(1)
            expect(errorStack[0].file).toEqual("http://127.0.0.1:8083/typeerror.html");
            expect(errorStack[0].line).toEqual(6);
            webpage.close();
        });
    });
});
