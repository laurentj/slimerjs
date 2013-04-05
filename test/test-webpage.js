
describe("WebPage object on hello world", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8082/";

    var async = new AsyncSpec(this);
    async.it("should be opened",function(done) {
        webpage.open(url, function(success){
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should have right url", function(done){
        expect(webpage.url).toEqual(url);
        done();
    });

    async.it("should be able to evaluate code", function(done){
        var result = webpage.evaluate(function(prefix){
                        return prefix+document.title;
        }, "title: ")
        expect(result).toEqual("title: hello world");
        done();
    });

    async.it("should be able to be closed", function(done) {
        webpage.close();
        done()
    })
});


describe("WebPage object", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8083/";


    it("can open a page and a promise can be used",function() {
        var loaded = false;
        var foo = '';
        var loadedResult1 = '';
        var loadedResult2 = '';
        runs(function() {
            var promise = webpage.open(url, function(success){
                loadedResult1 = success;
            });
            promise.then(function(success){
                loadedResult2 = success;
                foo='bar';
                var deferred = require("sdk/core/promise").defer();
                setTimeout(deferred.resolve, 200, "hello");
                return deferred.promise;
            })
            .then(function(val){
                foo += val;
                loaded = true;
            })
        });
        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(foo).toEqual("barhello");
            expect(loadedResult1).toEqual("success");
            expect(loadedResult2).toEqual("success");
            webpage.close();
        });
    });

    it("can chain two openings of page with a promise",function() {
        var loaded = false;
        var titles = '';
        var loadedResult1 = '';
        var loadedResult2 = '';
        runs(function() {
            webpage.open(url+"simplehello.html")
            .then(function(){
                titles+=' '+webpage.title;
                return webpage.open(url+"helloframe.html");
            })
            .then(function(){
                titles+=' '+webpage.title;
                loaded = true;
            })
        });
        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(titles).toEqual(" simple hello world hello in frame");
            webpage.close();
        });
    });
});



describe("WebPage.evaluate()", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8083/inject.html";

    it("can evaluate a given function",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var r = webpage.evaluate(function(){
                pageVariable = "hello";
                window.pageVariable2 = "slimer";
                window.injectedVariable = "bob";
                modifyPageVariable();
                modifyInjectedVariable();
                return "okeval";
            });
            expect(r).toEqual("okeval");
        });
    });
    
    // FIXME: modifying a variable in a sandbox
    // that inherits of the context of a window,
    // does not propagate the modification into
    // this context. We have same
    // issue that https://bugzilla.mozilla.org/show_bug.cgi?id=783499
    xit("can modify a global variable", function(){

        var pageVariableValue = webpage.evaluate(function(){
            try {
                return getPageVariable();
            }catch(e) {
                return 'not found';
            }
        })
        expect(pageVariableValue).toEqual("hellochange by modify")
    });
    
    it("can modify a window variable", function(){
        var pageVariableValue2 = webpage.evaluate(function(){
            try {
                return getPageVariable2();
            }catch(e) {
                return 'not found';
            }
        })
        expect(pageVariableValue2).toEqual("slimerchange by modify")
    });
    
    it("can create a window variable", function(){
        var injectedVariableValue = webpage.evaluate(function(){
            try {
                return injectedVariable;
            }catch(e) {
                return 'not found';
            }
        })
        expect(injectedVariableValue).toEqual("bobchange by modify")
        webpage.close();
    });
});


describe("WebPage.injectJs()", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8083/inject.html";

    it("can injects js",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            webpage.libraryPath += '/wwwfile';
            webpage.injectJs('inject.js');
        });
    });

    it("can modify DOM content",function() {
        var attrValue = webpage.evaluate(function(){
            return document.getElementById("test").getAttribute('class');
        })
        expect(attrValue).toEqual("foo")
    });

    it("can modify an existing variable",function() {
        var pageVariableValue = webpage.evaluate(function(){
            try {
                return pageVariable;
            }catch(e) {
                return 'not found';
            }
        })
        expect(pageVariableValue).toEqual("changed it")
    });

    it("can create new variable in the window context",function() {
        var injectedVariableValue = webpage.evaluate(function(){
            try {
                return injectedVariable;
            }catch(e) {
                return 'not found';
            }
        })
        expect(injectedVariableValue).toEqual("I am here")
    });

    // FIXME: modifying a variable in a sandbox
    // that inherits of the context of a window,
    // does not propagate the modification into
    // this context. We have same
    // issue that https://bugzilla.mozilla.org/show_bug.cgi?id=783499
    xit("can modify an existing variable and the new value is accessible from the window context",function() {
        webpage.evaluate(function(){ modifyPageVariable();});
        pageVariableValue = webpage.evaluate(function(){
            try {
                return pageVariable;
            }catch(e) {
                return 'not found';
            }
        })
        expect(pageVariableValue).toEqual("changed itchange by modify")
    });

    // FIXME: modifying a variable in a sandbox
    // that inherits of the context of a window,
    // does not propagate the modification into
    // this context. We have same
    // issue that https://bugzilla.mozilla.org/show_bug.cgi?id=783499
    xit("can modify an injected variable and the new value is accessible from the window context",function() {
        webpage.evaluate(function(){ modifyInjectedVariable();});
        injectedVariableValue = webpage.evaluate(function(){
            try {
                return injectedVariable;
            }catch(e) {
                return 'not found';
            }
        })
        expect(injectedVariableValue).toEqual("I am herechange by modify");
    });
    it("test end", function(){
        webpage.close();
    })
});


describe("WebPage.title", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8082/hello.html";

    it("can be retrieved",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(webpage.title).toEqual("hello world");
            webpage.close();
        });
    });
});

describe("WebPage.zoomFactor", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8082/hello.html";

    it("can be retrieved",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(webpage.zoomFactor).toEqual(1);
            webpage.zoomFactor = 1.5;
            expect(webpage.zoomFactor).toEqual(1.5);
            webpage.close();
        });
    });
});
