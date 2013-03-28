
describe("WebPage.onPageCreated", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8083/windowopen.html";

    it("is called when window.open",function() {
        var loaded = false;
        var childPage = null;
        var childLoaded = false;
        webpage.onPageCreated = function(aChildPage) {
            childPage = aChildPage;
            childPage.onLoadFinished = function(){
                childLoaded = true;
            }
        }
        // load the main page
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        // open a child page
        runs(function(){
            var result = webpage.evaluate(function(){
                return launchWindow(); 
                /*var evt = document.createEvent("MouseEvents");
                evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                var cb = document.getElementById("btn"); 
                cb.dispatchEvent(evt);*/
            })
            expect(result).toEqual("OK");
        });
        // wait after the page loading
        waitsFor(function(){ return childLoaded;}, 2000);
        runs(function(){
            expect(childPage.title).toEqual("hello in frame");
            childPage.close();
            webpage.close();
        });
    });

});

describe("WebPage.onClosing", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8083/windowclose.html";

    it("is called when window.close",function() {
        var loaded = false;
        var childClosing = false;
        webpage.onClosing = function(aPage) {
            childClosing = true;
        }
        // load the main page
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        // close the page
        runs(function(){
            var result = webpage.evaluate(function(){
                return tryCloseWindow(); 
            })
            expect(result).toEqual("OK");
        });
        // wait after the page closing
        waitsFor(function(){ return childClosing;}, 2000);
        runs(function(){
            expect(childClosing).toBeTruthy();
        });
    });

});

