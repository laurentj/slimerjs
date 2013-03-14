
describe("WebPage.renderBase64()", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8082/hello.html";

    it("can capture and return a base64 content",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var capture = webpage.renderBase64();
            expect(typeof capture).toEqual("string");
            expect(capture.length > 0).toBeTruthy();
        });
    });

    it("supports clipRect property",function() {
        webpage.clipRect = {top:10, left:10, width:50, height:40};
        var capture = webpage.renderBase64();
        expect(typeof capture).toEqual("string");
        expect(capture.length > 0).toBeTruthy();
    });

});


describe("WebPage.render()", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8082/hello.html";

    it("can capture and save it into a file",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            if (fs.exists('slimerjs_capture.png'))
                fs.remove('slimerjs_capture.png');
            webpage.render('slimerjs_capture.png');
            expect(fs.exists('slimerjs_capture.png')).toBeTruthy();
        });
    });
});
