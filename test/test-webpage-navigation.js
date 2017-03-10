
describe("WebPage.onNavigationRequested", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/navigation.html";

    beforeEach(function() {
        if (webpage) {
            webpage.close();
        }
        webpage = require("webpage").create();
    });

    it("is called when a click is made on a link",function() {
        var loaded = false;
        var navCall = [];
 
        webpage.onNavigationRequested = function(url, navigationType, willNavigate, isMainFrame) {
            navCall.push([url, navigationType, willNavigate, isMainFrame]);
        }
        //webpage.onConsoleMessage = function(msg) {
        //    dump("console:"+msg+"\n")
        //}
        runs(function() {
            webpage.open(url, function(success){
                // click on a js link
                webpage.sendEvent("click",5,35, 'left', 0);
                //dump(".... jsclick1 done\n")
                var result = webpage.evaluate(function(){
                    return jsclick1
                });
                //dump(".... jsclick1 retrieved\n")
                expect(result).toBeTruthy();

                // click on a js link
                webpage.sendEvent("click",5,55, 'left', 0);
                //dump(".... jsclick2 done\n")
                result = webpage.evaluate(function(){
                    return jsclick2
                });
                //dump(".... jsclick2 retrieved\n")
                expect(result).toBeTruthy();
                // click on an html link
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
            if (slimer.geckoVersion.major >= 52) {
                expect(navCall.length).toEqual(7);
            }
            else {
                //in fx 51-, don't know why, (nsIContentPolicy) Navigation.shouldLoad is called twice for consolemessage.html
                expect(navCall.length).toEqual(8);
            }
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


    it("is called when submitting a form",function() {
        var loaded = false;
        var navCall = [];
        var formData = null;
        var formMethod = null;
 
        webpage.onNavigationRequested = function(url, navigationType, willNavigate, isMainFrame) {
            navCall.push([url, navigationType, willNavigate, isMainFrame]);
        }

        webpage.onResourceRequested = function(resource, request){
            if (resource.url == "http://127.0.0.1:8083/getHeaders") {
                formData = resource.postData;
                formMethod = resource.method;
            }
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
            expect(nav[0]).toEqual("http://127.0.0.1:8083/getHeaders");
            //expect(nav[1]).toEqual("FormSubmitted")
            expect(nav[2]).toBeTruthy()
            expect(nav[3]).toBeTruthy()
            expect(formMethod).toEqual("POST");
            expect(formData).toEqual("foo=bar&hello=world")

            var received = null;
            try {
                received = JSON.parse(webpage.plainText);
            }
            catch(e){}

            expect(received).not.toBeNull();
            expect(received.method).toEqual('POST');
            expect(received.body).toEqual("foo=bar&hello=world");
            expect(received.headers["Content-Type"]).toEqual("application/x-www-form-urlencoded");
            expect(received.headers["Content-Length"]).toEqual("19");
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
            webpage.close();
        });
    });

    it("is called during page.open even if navigation is locked",function() {
        var loaded = false;
        var openCallbackCalled = false;
        var navCall = [];
        webpage.navigationLocked = true;
        webpage.onNavigationRequested = function(url, navigationType, willNavigate, isMainFrame) {
            navCall.push([url, navigationType, willNavigate, isMainFrame]);
        }
        runs(function() {
            webpage.open(url, function(success){
                openCallbackCalled = true;
                loaded = true
            });
            setTimeout(function(){ 
                loaded = true;
            }, 1500);
        });

        waitsFor(function(){ return loaded;}, 3000);

        runs(function(){
            expect(navCall.length).toEqual(1);
            expect(openCallbackCalled).toBeFalsy();
            var nav = navCall[0]
            expect(nav[0]).toEqual("http://127.0.0.1:8083/navigation.html");
            //expect(nav[1]).toEqual("Other")
            expect(nav[2]).toBeFalsy()
            expect(nav[3]).toBeTruthy()
        });
    });

    it("has no more tests",function() {
        if (webpage) {
            webpage.close();
        }
    });
});
