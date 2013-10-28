

describe("Webserver", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("handle asynchronous response",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url+"asynchronousResponse", function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(webpage.plainText).toEqual("done");
            webpage.close();
        });
    });

    it("is able to return UTF-8 content correctly",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url+"misc_chars", function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(webpage.plainText).toEqual("Hello World! 你好 ! çàéè");
            webpage.close();
        });
    });
});