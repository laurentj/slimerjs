
describe("WebPage.viewportSize", function(){
    var webpage;
    var url = "http://127.0.0.1:8082/hello.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("can change the size of the window",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            if (!system.os.isWindows()) {
                expect(webpage.viewportSize.width).toEqual(400);
                expect(webpage.viewportSize.height).toEqual(300);
            }
            webpage.viewportSize = { width:650, height:320 };
            var result = webpage.evaluate(function(){
                return window.innerWidth +"-"+window.innerHeight;
            })
            expect(result).toEqual("650-320");
            expect(webpage.viewportSize.width).toEqual(650);
            expect(webpage.viewportSize.height).toEqual(320);
            webpage.close();
        });
    });
});

describe("WebPage.renderBase64()", function(){
    var webpage;
    var url = "http://127.0.0.1:8082/hello.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("can capture and return a base64 content",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                webpage.viewportSize = { width:300, height:210 };
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var capture = webpage.renderBase64();
            expect(typeof capture).toEqual("string");
            expect(capture.length > 1300).toBeTruthy();

            var capture = webpage.renderBase64({format:'jpg', quality:0.5});
            expect(typeof capture).toEqual("string");
            expect(capture.length > 2500).toBeTruthy();
        });
    });

    it("supports clipRect property",function() {
        expect(webpage.clipRect).toEqual({top:0, left:0, width:0, height:0});
        webpage.clipRect = {top:10, left:10, width:50, height:40};
        var capture = webpage.renderBase64();
        expect(typeof capture).toEqual("string");
        expect(capture.length > 300).toBeTruthy();
        webpage.close();
    });

});


describe("WebPage.render()", function(){
    var webpage;
    var url = "http://127.0.0.1:8082/hello.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

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
            if (fs.exists('slimerjs_capture.png'))
                fs.remove('slimerjs_capture.png');
            webpage.close();
        });
    });
});
