
var webserverTestWebPage = webServerFactory.create();
webserverTestWebPage.listen(8082, function(request, response) {
    response.statusCode = 200;
    response.write('<html><head><title>hello world</title></head><body>Hello!</body></html>');
    response.close();
});

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


describe("WebPage.injectJs", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8083/inject.html";

    it("can modifiy the page content",function() {
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
            var attrValue = webpage.evaluate(function(){
                return document.getElementById("test").getAttribute('class');
            })
            expect(attrValue).toEqual("foo")

            var pageVariableValue = webpage.evaluate(function(){
                try {
                    return pageVariable;
                }catch(e) {
                    return 'not found';
                }
            })
            expect(pageVariableValue).toEqual("changed it")

            var injectedVariableValue = webpage.evaluate(function(){
                try {
                    return injectedVariable;
                }catch(e) {
                    return 'not found';
                }
            })
            expect(injectedVariableValue).toEqual("I am here")
        })
    });
});
