
describe("WebPage with frames", function(){
    var webpage;
    var domain = "http://127.0.0.1:8083/";
    var url = domain+"frame_main.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("can be loaded",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(loaded).toBeTruthy();
        });
    });

    it("has the right frames count",function() {
        expect(webpage.framesCount).toEqual(3);
        expect(webpage.childFramesCount()).toEqual(3);
    });

    it("has the right frames list",function() {
        expect(webpage.framesName).toEqual(["frametop","frameleft","frameright"]);
        expect(webpage.childFramesName()).toEqual(["frametop","frameleft","frameright"]);
    });

    it("has the main window as the current frame",function() {
        expect(webpage.frameTitle).toEqual('window frames');
        expect(webpage.frameName).toEqual('');
        expect(webpage.currentFrameName()).toEqual('');
        expect(webpage.frameUrl).toEqual(url);
        expect(webpage.frameContent).toNotEqual('');
        expect(webpage.focusedFrameName).toEqual('');
    });


    it("has a frame that can be retrieved by name",function() {
        webpage.switchToFrame('frametop')
        expect(webpage.frameTitle).toEqual('frame top');
        expect(webpage.frameName).toEqual('frametop');
        expect(webpage.currentFrameName()).toEqual('frametop');
        expect(webpage.frameUrl).toEqual(domain+"frame_top.html");
        expect(webpage.frameContent).toNotEqual('');
        expect(webpage.framePlainText).toEqual(' top frame ');
        expect(webpage.title).toEqual('window frames');
        expect(webpage.url).toEqual(url);
        expect(webpage.windowName).toEqual('');
    });

    it("has a frame that can be retrieved by position",function() {
        webpage.switchToMainFrame()
        webpage.switchToFrame(0)
        expect(webpage.frameTitle).toEqual('frame top');
        expect(webpage.frameName).toEqual('frametop');
        expect(webpage.currentFrameName()).toEqual('frametop');
        expect(webpage.frameUrl).toEqual(domain+"frame_top.html");
        expect(webpage.frameContent).toNotEqual('');
        expect(webpage.framePlainText).toEqual(' top frame ');
    });

    it("has a sub frame that can be retrieved", function() {
        // verify that switchToFrame doesn't work here, so that we are still
        // in frametop
        expect(webpage.switchToFrame('frameright')).toEqual(false);
        expect(webpage.frameName).toEqual('frametop');

        // back to main frame
        webpage.switchToMainFrame()

        // go into a frame then a subframe
        webpage.switchToFrame('frameright');
        expect(webpage.framesName).toEqual(["subframetop","subframebottom"]);
        expect(webpage.framesCount).toEqual(2);
        webpage.switchToFrame('subframebottom')
        expect(webpage.frameTitle).toEqual('simple hello world');
        expect(webpage.frameName).toEqual('subframebottom');
        expect(webpage.currentFrameName()).toEqual('subframebottom');
        expect(webpage.frameUrl).toEqual(domain+"simplehello.html");
        expect(webpage.frameContent).toNotEqual('');
        expect(webpage.framePlainText).toEqual(' Hello World! ');

        // test switchToParentFrame
        webpage.switchToParentFrame();
        expect(webpage.frameName).toEqual('frameright');
    });

    it("has a sub frame that can be focused", function() {
        webpage.switchToMainFrame()
        webpage.switchToFrame('frameleft');
        expect(webpage.evaluate(function(){
            return setFocusInOtherFrame();
        })).toEqual("ok");
        expect(webpage.frameName).toEqual('frameleft');
        expect(webpage.focusedFrameName).toEqual('frametop');
        expect(webpage.switchToFocusedFrame()).toEqual(true);
        expect(webpage.frameName).toEqual('frametop');
    });

    it("has a sub frame that is unloaded", function() {
        webpage.switchToMainFrame()
        webpage.switchToFrame('frameright');
        webpage.switchToFrame('subframebottom')
        expect(webpage.frameTitle).toEqual('simple hello world');

        var loaded = false;
        runs(function() {
            expect(webpage.evaluate(function(){
                var win = window.parent.parent.frames[1];
                var url = win.location.href;
                var doc = win.document;
                var evt = doc.createEvent("MouseEvents");
                evt.initMouseEvent("click", true, true, win, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                var lk = doc.getElementById("linktoclick");
                if (!lk)
                    return "no";
                lk.dispatchEvent(evt);
                return "ok "+url;
            })).toEqual("ok "+domain+"frame_left.html");

            setTimeout(function(){
                loaded = true;
            },400);
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(webpage.frameTitle).toEqual('');
            webpage.switchToMainFrame();
            webpage.switchToFrame('frameright');
            expect(webpage.frameTitle).toEqual('test consolemessage');
            webpage.close();
        });
    });

        // webpage.frameTitle RO
        // webpage.frameContent RW
        // webpage.frameUrl RO
        // webpage.framePlainText RO
        // webpage.framesName RO

        // webpage.frameName RO
        // webpage.currentFrameName() D

        // webpage.framesCount RO
        // webpage.childFramesCount() D

        // webpage.focusedFrameName
        // webpage.childFramesName RO D

        // webpage.switchToFrame(frameName)
        // webpage.switchToChildFrame(frameName) D

        // webpage.switchToFrame(position)
        // webpage.switchToChildFrame(position) D

        // webpage.switchToMainFrame()
        // webpage.switchToParentFrame()
        // webpage.switchToFocusedFrame()
});

