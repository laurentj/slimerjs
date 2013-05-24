
describe("WebPage.onError", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8083/onerror.html";

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
                }, 200);
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(errorMessage).toEqual("Error: error on click");
            expect(errorStack.length).toEqual(1)
            expect(errorStack[0].file).toEqual("http://127.0.0.1:8083/onerror.html")
            expect(errorStack[0].line).toEqual(8)
            //expect(errorStack[0]["function"]).toEqual("doError")
            expect(errorStack[0]["function"]).toEqual(null)
            //expect(errorStack[1].file).toEqual("http://127.0.0.1:8083/onerror.html")
            //expect(errorStack[1].line).toEqual(15)
            //expect(errorStack[1]["function"]).toEqual("onclick")
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
            expect(errorStack.length).toEqual(2)
            expect(errorStack[0].file).toEqual("phantomjs://webpage.evaluate()")
            expect(errorStack[0].line).toEqual(2)
            expect(errorStack[0]["function"]).toEqual("")
            expect(errorStack[1].file).toEqual("phantomjs://webpage.evaluate()")
            expect(errorStack[1].line).toEqual(3)
            expect(errorStack[1]["function"]).toEqual("")
            //expect(errorStack[2].file).toEqual("phantomjs://webpage.evaluate()")
            //expect(errorStack[2].line).toEqual(3)
            //expect(errorStack[2]["function"]).toEqual("")

            errorMessage = null;
            errorStack = null;
            webpage.evaluateJavaScript('(function(){throw new Error("error from evaluateJavascript");})()');
            expect(errorMessage).toEqual("Error: error from evaluateJavascript");
            expect(errorStack.length).toEqual(2)
            expect(errorStack[0].file).toEqual("phantomjs://webpage.evaluate()")
            expect(errorStack[0].line).toEqual(1)
            expect(errorStack[0]["function"]).toEqual("")
            expect(errorStack[1].file).toEqual("phantomjs://webpage.evaluate()")
            expect(errorStack[1].line).toEqual(1)
            expect(errorStack[1]["function"]).toEqual("")

            errorMessage = null;
            errorStack = null;
            webpage.libraryPath += '/wwwfile';
            webpage.injectJs('injectdoerror.js');
            expect(errorMessage).toEqual("Error: error from injectdoerror.js");
            expect(errorStack.length).toEqual(2)
            expect(errorStack[0].file).toEqual("injectdoerror.js")
            expect(errorStack[0].line).toEqual(2)
            expect(errorStack[0]["function"]).toEqual("doInjectError")
            expect(errorStack[1].file).toEqual("injectdoerror.js")
            expect(errorStack[1].line).toEqual(5)
            expect(errorStack[1]["function"]).toEqual("")
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
            expect(errorMessage).toEqual("Error: error from doerror.js");
            expect(errorStack.length).toEqual(1)
            expect(errorStack[0].file).toEqual("http://127.0.0.1:8083/doerror.js")
            expect(errorStack[0].line).toEqual(2)
            //expect(errorStack[0]["function"]).toEqual("arrrrrg")
            expect(errorStack[0]["function"]).toEqual(null)
            //expect(errorStack[1].file).toEqual("http://127.0.0.1:8083/doerror.js")
            //expect(errorStack[1].line).toEqual(5)
            //expect(errorStack[1]["function"]).toEqual("")
        });
    });
});
