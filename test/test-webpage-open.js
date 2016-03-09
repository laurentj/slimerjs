
describe("WebPage.onPageCreated", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/windowopen.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

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
            expect(webpage.pages.length).toEqual(0)
            expect(webpage.pagesWindowName.length).toEqual(0)
            expect(webpage.getPage('plop')).toEqual(null);
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
            expect(webpage.pages.length).toEqual(1);
            expect(webpage.pages[0]).toEqual(childPage);
            expect(webpage.getPage('plop')).toEqual(childPage);
            expect(webpage.pagesWindowName.length).toEqual(1);
            expect(webpage.pagesWindowName[0]).toEqual('plop');

            expect(childPage.title).toEqual("hello in frame");
            expect(childPage.windowName).toEqual("plop");
            // fix me, see issue https://github.com/laurentj/slimerjs/issues/383
            //expect(childPage.evaluateJavaScript('window.name')).toEqual("plop");
            childPage.close();
            expect(webpage.pages.length).toEqual(0)
            expect(webpage.pagesWindowName.length).toEqual(0)
            expect(webpage.getPage('plop')).toEqual(null);
            webpage.close();
        });
    });

});

describe("WebPage.onClosing", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/windowclose.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

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

    it("is called when webpage.close",function() {
        var loaded = false;
        var childClosing = 0;
        webpage.onClosing = function(aPage) {
            childClosing++;
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
            window.setTimeout(function(){ loaded = false;}, 500);
            webpage.close();
        });
        // wait after the page closing
        waitsFor(function(){ return (!loaded);}, 2000);
        runs(function(){
            expect(childClosing).toEqual(1);
        });
    });

});
