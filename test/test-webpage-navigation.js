
describe("WebPage.onNavigationRequested", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8083/navigation.html";

    it("is called when a click is made on a link",function() {
        var loaded = false;
        var navCall = [];
 
        webpage.onNavigationRequested = function(url, navigationType, willNavigate, isMainFrame) {
            navCall.push([url, navigationType, willNavigate, isMainFrame]);
        }

        runs(function() {
            webpage.open(url, function(success){
                webpage.sendEvent("click", 5, 5, 'left', 0);
                setTimeout(function(){ // we should wait after the new page loading
                    loaded = true;
                }, 200);
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(navCall.length).toEqual(2);
            var nav = navCall[0]
            expect(nav[0]).toEqual("http://127.0.0.1:8083/navigation.html");
            //expect(nav[1]).toEqual("Other")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeTruthy()
            nav = navCall[1]
            expect(nav[0]).toEqual("http://127.0.0.1:8083/simplehello.html");
            //expect(nav[1]).toEqual("LinkClicked")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeTruthy()
        });
    });

    it("is called when a multi frame page is loaded and a click is made on a link",function() {
        var loaded = false;
        var navCall = [];
 
        webpage.onNavigationRequested = function(url, navigationType, willNavigate, isMainFrame) {
            navCall.push([url, navigationType, willNavigate, isMainFrame]);
        }

        runs(function() {
            webpage.open("http://127.0.0.1:8083/frame_main.html", function(success){
                webpage.sendEvent("click", 62, 163, 'left', 0);
                setTimeout(function(){ // we should wait after the new page loading
                    loaded = true;
                }, 200);
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            //expect(navCall.length).toEqual(7);
            //FIXME don't know why, Navigation.shouldLoad is called twice for consolemessage.html
            expect(navCall.length).toEqual(8);
            var nav = navCall[0] // 1
            expect(nav[0]).toEqual("http://127.0.0.1:8083/frame_main.html");
            //expect(nav[1]).toEqual("Other")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeTruthy()
            nav = navCall[1] //6
            expect(nav[0]).toEqual("http://127.0.0.1:8083/frame_top.html");
            //expect(nav[1]).toEqual("Other")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeFalsy()
            nav = navCall[2] //10
            expect(nav[0]).toEqual("http://127.0.0.1:8083/frame_left.html");
            //expect(nav[1]).toEqual("Other")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeFalsy()
            nav = navCall[3] //14
            expect(nav[0]).toEqual("http://127.0.0.1:8083/subframe_main.html");
            //expect(nav[1]).toEqual("Other")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeFalsy()
            nav = navCall[4] //18
            expect(nav[0]).toEqual("http://127.0.0.1:8083/subframe_top.html");
            //expect(nav[1]).toEqual("Other")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeFalsy()
            nav = navCall[5] //22
            expect(nav[0]).toEqual("http://127.0.0.1:8083/simplehello.html");
            //expect(nav[1]).toEqual("Other")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeFalsy()
            nav = navCall[6] //26
            // new page in a frame, after the click
            expect(nav[0]).toEqual("http://127.0.0.1:8083/consolemessage.html");
            //expect(nav[1]).toEqual("LinkClicked")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeFalsy()
        });
    });


    it("is called when a submitting a form",function() {
        var loaded = false;
        var navCall = [];
 
        webpage.onNavigationRequested = function(url, navigationType, willNavigate, isMainFrame) {
            navCall.push([url, navigationType, willNavigate, isMainFrame]);
        }

        runs(function() {
            webpage.open("http://127.0.0.1:8083/navigation_form.html", function(success){
                webpage.sendEvent("click", 5, 5, 'left', 0);
                setTimeout(function(){ // we should wait after the form submit loading
                    loaded = true;
                }, 200);
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(navCall.length).toEqual(2);
            var nav = navCall[0] // 1
            expect(nav[0]).toEqual("http://127.0.0.1:8083/navigation_form.html");
            //expect(nav[1]).toEqual("Other")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeTruthy()
            nav = navCall[1] //6
            expect(nav[0]).toEqual("http://127.0.0.1:8083/simplehello.html");
            //expect(nav[1]).toEqual("FormSubmitted")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeTruthy()
        });
    });

    it("is called when a click is made on a link even if navigation is locked",function() {
        var loaded = false;
        var navCall = [];

        webpage.onNavigationRequested = function(url, navigationType, willNavigate, isMainFrame) {
            navCall.push([url, navigationType, willNavigate, isMainFrame]);
        }

        runs(function() {
            webpage.open(url, function(success){
                webpage.navigationLocked = true;
                webpage.sendEvent("click", 5, 5, 'left', 0);
                setTimeout(function(){ // we should wait after the new page loading
                    loaded = true;
                }, 200);
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(navCall.length).toEqual(2);
            var nav = navCall[0]
            expect(nav[0]).toEqual("http://127.0.0.1:8083/navigation.html");
            //expect(nav[1]).toEqual("Other")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeTruthy()
            nav = navCall[1]
            expect(nav[0]).toEqual("http://127.0.0.1:8083/simplehello.html");
            //expect(nav[1]).toEqual("LinkClicked")
            expect(nav[2]).toBeFalsy()
            expect(nav[3]).toBeTruthy()
            expect(webpage.url).toEqual("http://127.0.0.1:8083/navigation.html");
            expect(webpage.title).toEqual("navigation")
        });
    });

});
