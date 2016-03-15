


describe("webpage.sendEvent", function() {

    var modifier = {
            shift:  0x02000000,
            ctrl:   0x04000000,
            alt:    0x08000000,
            meta:   0x10000000,
            keypad: 0x20000000
        };

    var left = 0;
    var right = 2;
    var middle = 1;
        
    var webpage;
    var url = "http://127.0.0.1:8083/mouseevent.html";
    

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });


    /*webpage.onConsoleMessage = function(message, l, s) {
        console.log(message);
    }*/
    
    function retrieveMouseInfo(){
        return result;
    }

    function resetMouseInfo(){
       clearM();
    }

    var r, key, input;

    function readResult() {
        r = webpage.evaluate(retrieveMouseInfo);
    }

    it("tests wait after page loading",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            readResult()
            expect(r.mousedown).toEqual(-1);
            expect(r.mouseup).toEqual(-1);
            expect(r.mousemove).toEqual(-1);
            expect(r.click).toEqual(-1);
            expect(r.dblclick).toEqual(-1);
        })
    });

/*
        expect(r.mousedown.clientX).toEqual(20);
        expect(r.mousedown.clientY).toEqual(20);
        expect(r.mousedown.ctrlKey).toEqual(false);
        expect(r.mousedown.shiftKey).toEqual(false);
        expect(r.mousedown.metaKey).toEqual(false);
        expect(r.mousedown.altKey).toEqual(false);
        expect(r.mousedown.button).toEqual(0);

        expect(r.mouseup.clientX).toEqual(20);
        expect(r.mouseup.clientY).toEqual(20);
        expect(r.mouseup.ctrlKey).toEqual(false);
        expect(r.mouseup.shiftKey).toEqual(false);
        expect(r.mouseup.metaKey).toEqual(false);
        expect(r.mouseup.altKey).toEqual(false);
        expect(r.mouseup.button).toEqual(0);

        expect(r.mousemove.clientX).toEqual(20);
        expect(r.mousemove.clientY).toEqual(20);
        expect(r.mousemove.ctrlKey).toEqual(false);
        expect(r.mousemove.shiftKey).toEqual(false);
        expect(r.mousemove.metaKey).toEqual(false);
        expect(r.mousemove.altKey).toEqual(false);
        expect(r.mousemove.button).toEqual(0);
*/

    it("send mouse events outside the target",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("mousedown", 5, 5, 'left', 0);
        readResult();
        expect(r.mousedown).toEqual(-1);
        expect(r.mouseup).toEqual(-1);
        expect(r.mousemove).toEqual(-1);
        expect(r.click).toEqual(-1);
        expect(r.dblclick).toEqual(-1);

        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("mouseup", 5, 5, 'left', 0);
        readResult();
        expect(r.mousedown).toEqual(-1);
        expect(r.mouseup).toEqual(-1);
        expect(r.mousemove).toEqual(-1);
        expect(r.click).toEqual(-1);
        expect(r.dblclick).toEqual(-1);

        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("mousemove", 5, 5, 'left', 0);
        readResult();
        expect(r.mousedown).toEqual(-1);
        expect(r.mouseup).toEqual(-1);
        expect(r.mousemove).toEqual(-1);
        expect(r.click).toEqual(-1);
        expect(r.dblclick).toEqual(-1);

        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("mousedoubleclick", 5, 5, 'left', 0);
        readResult();
        expect(r.mousedown).toEqual(-1);
        expect(r.mouseup).toEqual(-1);
        expect(r.mousemove).toEqual(-1);
        expect(r.click).toEqual(-1);
        expect(r.dblclick).toEqual(-1);

        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("doubleclick", 5, 5, 'left', 0);
        readResult();
        expect(r.mousedown).toEqual(-1);
        expect(r.mouseup).toEqual(-1);
        expect(r.mousemove).toEqual(-1);
        expect(r.click).toEqual(-1);
        expect(r.dblclick).toEqual(-1);

        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("click", 5, 5, 'left', 0);
        readResult();
        expect(r.mousedown).toEqual(-1);
        expect(r.mouseup).toEqual(-1);
        expect(r.mousemove).toEqual(-1);
        expect(r.click).toEqual(-1);
        expect(r.dblclick).toEqual(-1);
    });

    
    it("send mousedown event",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("mousedown", 20, 20, 'left', 0);
        readResult();

        expect(r.mousedown.clientX).toEqual(20);
        expect(r.mousedown.clientY).toEqual(20);
        expect(r.mousedown.ctrlKey).toEqual(false);
        expect(r.mousedown.shiftKey).toEqual(false);
        expect(r.mousedown.metaKey).toEqual(false);
        expect(r.mousedown.altKey).toEqual(false);
        expect(r.mousedown.button).toEqual(0);

        expect(r.mouseup).toEqual(-1);
        expect(r.mousemove).toEqual(-1);
        expect(r.click).toEqual(-1);
        expect(r.dblclick).toEqual(-1);
    });

    it("send mousedown+ctrl+right event",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("mousedown", 20, 20, 'right', modifier.ctrl);
        readResult();

        expect(r.mousedown.clientX).toEqual(20);
        expect(r.mousedown.clientY).toEqual(20);
        expect(r.mousedown.ctrlKey).toEqual(true);
        expect(r.mousedown.shiftKey).toEqual(false);
        expect(r.mousedown.metaKey).toEqual(false);
        expect(r.mousedown.altKey).toEqual(false);
        expect(r.mousedown.button).toEqual(right);

        expect(r.mouseup).toEqual(-1);
        expect(r.mousemove).toEqual(-1);
        expect(r.click).toEqual(-1);
        expect(r.dblclick).toEqual(-1);
    });
    
    
    it("send mouseup event",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("mouseup", 20, 20, 'left', 0);
        readResult();

        expect(r.mouseup.clientX).toEqual(20);
        expect(r.mouseup.clientY).toEqual(20);
        expect(r.mouseup.ctrlKey).toEqual(false);
        expect(r.mouseup.shiftKey).toEqual(false);
        expect(r.mouseup.metaKey).toEqual(false);
        expect(r.mouseup.altKey).toEqual(false);
        expect(r.mouseup.button).toEqual(0);

        expect(r.mousedown).toEqual(-1);
        expect(r.mousemove).toEqual(-1);
        expect(r.click.clientX).toEqual(20);
        expect(r.click.clientY).toEqual(20);
        expect(r.click.ctrlKey).toEqual(false);
        expect(r.click.shiftKey).toEqual(false);
        expect(r.click.metaKey).toEqual(false);
        expect(r.click.altKey).toEqual(false);
        expect(r.click.button).toEqual(0);
        expect(r.dblclick).toEqual(-1);
    });

    it("send mousemove event",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("mousemove", 20, 20, 'left', 0);
        readResult();

        expect(r.mousemove.clientX).toEqual(20);
        expect(r.mousemove.clientY).toEqual(20);
        expect(r.mousemove.ctrlKey).toEqual(false);
        expect(r.mousemove.shiftKey).toEqual(false);
        expect(r.mousemove.metaKey).toEqual(false);
        expect(r.mousemove.altKey).toEqual(false);
        expect(r.mousemove.button).toEqual(0);

        expect(r.mouseup).toEqual(-1);
        expect(r.mousedown).toEqual(-1);
        expect(r.click).toEqual(-1);
        expect(r.dblclick).toEqual(-1);
    });

    it("send mousedoubleclick event",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("mousedoubleclick", 20, 20, 'left', 0);
        readResult();

        expect(r.mousedown.clientX).toEqual(20);
        expect(r.mousedown.clientY).toEqual(20);
        expect(r.mousedown.ctrlKey).toEqual(false);
        expect(r.mousedown.shiftKey).toEqual(false);
        expect(r.mousedown.metaKey).toEqual(false);
        expect(r.mousedown.altKey).toEqual(false);
        expect(r.mousedown.button).toEqual(0);

        expect(r.mouseup).toEqual(-1);
        expect(r.mousemove).toEqual(-1);
        expect(r.click).toEqual(-1);
        expect(r.dblclick).toEqual(-1);
    });

    it("send mousedoubleclick+ctrl+right event",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("mousedoubleclick", 20, 20, 'right', modifier.ctrl);
        readResult();

        expect(r.mousedown.clientX).toEqual(20);
        expect(r.mousedown.clientY).toEqual(20);
        expect(r.mousedown.ctrlKey).toEqual(true);
        expect(r.mousedown.shiftKey).toEqual(false);
        expect(r.mousedown.metaKey).toEqual(false);
        expect(r.mousedown.altKey).toEqual(false);
        expect(r.mousedown.button).toEqual(right);

        expect(r.mouseup).toEqual(-1);
        expect(r.mousemove).toEqual(-1);
        expect(r.click).toEqual(-1);
        expect(r.dblclick).toEqual(-1);
    });

    it("send doubleclick event",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("doubleclick", 20, 20, 'left', 0);
        readResult();
        expect(r.mousedown.length).toEqual(2)
        expect(r.mousedown[0].clientX).toEqual(20);
        expect(r.mousedown[0].clientY).toEqual(20);
        expect(r.mousedown[0].ctrlKey).toEqual(false);
        expect(r.mousedown[0].shiftKey).toEqual(false);
        expect(r.mousedown[0].metaKey).toEqual(false);
        expect(r.mousedown[0].altKey).toEqual(false);
        expect(r.mousedown[0].button).toEqual(0);
        expect(r.mousedown[1].clientX).toEqual(20);
        expect(r.mousedown[1].clientY).toEqual(20);
        expect(r.mousedown[1].ctrlKey).toEqual(false);
        expect(r.mousedown[1].shiftKey).toEqual(false);
        expect(r.mousedown[1].metaKey).toEqual(false);
        expect(r.mousedown[1].altKey).toEqual(false);
        expect(r.mousedown[1].button).toEqual(0);

        expect(r.mouseup.length).toEqual(2)
        expect(r.mouseup[0].clientX).toEqual(20);
        expect(r.mouseup[0].clientY).toEqual(20);
        expect(r.mouseup[0].ctrlKey).toEqual(false);
        expect(r.mouseup[0].shiftKey).toEqual(false);
        expect(r.mouseup[0].metaKey).toEqual(false);
        expect(r.mouseup[0].altKey).toEqual(false);
        expect(r.mouseup[0].button).toEqual(0);
        expect(r.mouseup[1].clientX).toEqual(20);
        expect(r.mouseup[1].clientY).toEqual(20);
        expect(r.mouseup[1].ctrlKey).toEqual(false);
        expect(r.mouseup[1].shiftKey).toEqual(false);
        expect(r.mouseup[1].metaKey).toEqual(false);
        expect(r.mouseup[1].altKey).toEqual(false);
        expect(r.mouseup[1].button).toEqual(0);

        expect(r.mousemove).toEqual(-1);

        expect(r.click.length).toEqual(2)
        expect(r.click[0].clientX).toEqual(20);
        expect(r.click[0].clientY).toEqual(20);
        expect(r.click[0].ctrlKey).toEqual(false);
        expect(r.click[0].shiftKey).toEqual(false);
        expect(r.click[0].metaKey).toEqual(false);
        expect(r.click[0].altKey).toEqual(false);
        expect(r.click[0].button).toEqual(0);
        expect(r.click[1].clientX).toEqual(20);
        expect(r.click[1].clientY).toEqual(20);
        expect(r.click[1].ctrlKey).toEqual(false);
        expect(r.click[1].shiftKey).toEqual(false);
        expect(r.click[1].metaKey).toEqual(false);
        expect(r.click[1].altKey).toEqual(false);
        expect(r.click[1].button).toEqual(0);

        expect(r.dblclick.clientX).toEqual(20);
        expect(r.dblclick.clientY).toEqual(20);
        expect(r.dblclick.ctrlKey).toEqual(false);
        expect(r.dblclick.shiftKey).toEqual(false);
        expect(r.dblclick.metaKey).toEqual(false);
        expect(r.dblclick.altKey).toEqual(false);
        expect(r.dblclick.button).toEqual(0);
    });

    it("send doubleclick+ctrl event",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("doubleclick", 20, 20, 'left', modifier.ctrl);
        // note that modifier is ignored for doubleclick in phantomjs
        readResult();
        expect(r.mousedown.length).toEqual(2)
        expect(r.mousedown[0].clientX).toEqual(20);
        expect(r.mousedown[0].clientY).toEqual(20);
        expect(r.mousedown[0].ctrlKey).toEqual(true);
        expect(r.mousedown[0].shiftKey).toEqual(false);
        expect(r.mousedown[0].metaKey).toEqual(false);
        expect(r.mousedown[0].altKey).toEqual(false);
        expect(r.mousedown[0].button).toEqual(0);
        expect(r.mousedown[1].clientX).toEqual(20);
        expect(r.mousedown[1].clientY).toEqual(20);
        expect(r.mousedown[1].ctrlKey).toEqual(true);
        expect(r.mousedown[1].shiftKey).toEqual(false);
        expect(r.mousedown[1].metaKey).toEqual(false);
        expect(r.mousedown[1].altKey).toEqual(false);
        expect(r.mousedown[1].button).toEqual(0);

        expect(r.mouseup.length).toEqual(2)
        expect(r.mouseup[0].clientX).toEqual(20);
        expect(r.mouseup[0].clientY).toEqual(20);
        expect(r.mouseup[0].ctrlKey).toEqual(true);
        expect(r.mouseup[0].shiftKey).toEqual(false);
        expect(r.mouseup[0].metaKey).toEqual(false);
        expect(r.mouseup[0].altKey).toEqual(false);
        expect(r.mouseup[0].button).toEqual(0);
        expect(r.mouseup[1].clientX).toEqual(20);
        expect(r.mouseup[1].clientY).toEqual(20);
        expect(r.mouseup[1].ctrlKey).toEqual(true);
        expect(r.mouseup[1].shiftKey).toEqual(false);
        expect(r.mouseup[1].metaKey).toEqual(false);
        expect(r.mouseup[1].altKey).toEqual(false);
        expect(r.mouseup[1].button).toEqual(0);

        expect(r.mousemove).toEqual(-1);

        expect(r.click.length).toEqual(2)
        expect(r.click[0].clientX).toEqual(20);
        expect(r.click[0].clientY).toEqual(20);
        expect(r.click[0].ctrlKey).toEqual(true);
        expect(r.click[0].shiftKey).toEqual(false);
        expect(r.click[0].metaKey).toEqual(false);
        expect(r.click[0].altKey).toEqual(false);
        expect(r.click[0].button).toEqual(0);
        expect(r.click[1].clientX).toEqual(20);
        expect(r.click[1].clientY).toEqual(20);
        expect(r.click[1].ctrlKey).toEqual(true);
        expect(r.click[1].shiftKey).toEqual(false);
        expect(r.click[1].metaKey).toEqual(false);
        expect(r.click[1].altKey).toEqual(false);
        expect(r.click[1].button).toEqual(0);

        expect(r.dblclick.clientX).toEqual(20);
        expect(r.dblclick.clientY).toEqual(20);
        expect(r.dblclick.ctrlKey).toEqual(true);
        expect(r.dblclick.shiftKey).toEqual(false);
        expect(r.dblclick.metaKey).toEqual(false);
        expect(r.dblclick.altKey).toEqual(false);
        expect(r.dblclick.button).toEqual(0);
    });

    it("send click event",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("click", 20, 20, 'left', 0);
        readResult();
        expect(r.mousedown.clientX).toEqual(20);
        expect(r.mousedown.clientY).toEqual(20);
        expect(r.mousedown.ctrlKey).toEqual(false);
        expect(r.mousedown.shiftKey).toEqual(false);
        expect(r.mousedown.metaKey).toEqual(false);
        expect(r.mousedown.altKey).toEqual(false);
        expect(r.mousedown.button).toEqual(left);

        expect(r.mouseup.clientX).toEqual(20);
        expect(r.mouseup.clientY).toEqual(20);
        expect(r.mouseup.ctrlKey).toEqual(false);
        expect(r.mouseup.shiftKey).toEqual(false);
        expect(r.mouseup.metaKey).toEqual(false);
        expect(r.mouseup.altKey).toEqual(false);
        expect(r.mouseup.button).toEqual(0);

        expect(r.mousemove).toEqual(-1);
        expect(r.click.clientX).toEqual(20);
        expect(r.click.clientY).toEqual(20);
        expect(r.click.ctrlKey).toEqual(false);
        expect(r.click.shiftKey).toEqual(false);
        expect(r.click.metaKey).toEqual(false);
        expect(r.click.altKey).toEqual(false);
        expect(r.click.button).toEqual(0);
        expect(r.dblclick).toEqual(-1);
    });

    it("send click+right event",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("click", 20, 20, 'right', 0);
        readResult();
        expect(r.mousedown.clientX).toEqual(20);
        expect(r.mousedown.clientY).toEqual(20);
        expect(r.mousedown.ctrlKey).toEqual(false);
        expect(r.mousedown.shiftKey).toEqual(false);
        expect(r.mousedown.metaKey).toEqual(false);
        expect(r.mousedown.altKey).toEqual(false);
        expect(r.mousedown.button).toEqual(right);

        expect(r.mouseup.clientX).toEqual(20);
        expect(r.mouseup.clientY).toEqual(20);
        expect(r.mouseup.ctrlKey).toEqual(false);
        expect(r.mouseup.shiftKey).toEqual(false);
        expect(r.mouseup.metaKey).toEqual(false);
        expect(r.mouseup.altKey).toEqual(false);
        expect(r.mouseup.button).toEqual(right);

        expect(r.mousemove).toEqual(-1);
        
        // FIXME with the right button : no DOM click event :-/
        expect(r.click).toEqual(-1);
        //expect(r.click.clientX).toEqual(20);
        //expect(r.click.clientY).toEqual(20);
        //expect(r.click.ctrlKey).toEqual(false);
        //expect(r.click.shiftKey).toEqual(false);
        //expect(r.click.metaKey).toEqual(false);
        //expect(r.click.altKey).toEqual(false);
        //expect(r.click.button).toEqual(right);
        expect(r.dblclick).toEqual(-1);
    });

    it("send click+middle event",function() {
        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("click", 20, 20, 'middle', 0);
        readResult();
        expect(r.mousedown.clientX).toEqual(20);
        expect(r.mousedown.clientY).toEqual(20);
        expect(r.mousedown.ctrlKey).toEqual(false);
        expect(r.mousedown.shiftKey).toEqual(false);
        expect(r.mousedown.metaKey).toEqual(false);
        expect(r.mousedown.altKey).toEqual(false);
        expect(r.mousedown.button).toEqual(middle);

        expect(r.mouseup.clientX).toEqual(20);
        expect(r.mouseup.clientY).toEqual(20);
        expect(r.mouseup.ctrlKey).toEqual(false);
        expect(r.mouseup.shiftKey).toEqual(false);
        expect(r.mouseup.metaKey).toEqual(false);
        expect(r.mouseup.altKey).toEqual(false);
        expect(r.mouseup.button).toEqual(middle);

        expect(r.mousemove).toEqual(-1);
        
        // FIXME with the middle button : no DOM click event :-/
        expect(r.click).toEqual(-1);
        //expect(r.click.clientX).toEqual(20);
        //expect(r.click.clientY).toEqual(20);
        //expect(r.click.ctrlKey).toEqual(false);
        //expect(r.click.shiftKey).toEqual(false);
        //expect(r.click.metaKey).toEqual(false);
        //expect(r.click.altKey).toEqual(false);
        //expect(r.click.button).toEqual(middle);
        expect(r.dblclick).toEqual(-1);
    });

    it("send click+shift+alt+middle event",function() {

        webpage.evaluate(resetMouseInfo);
        webpage.sendEvent("click", 20, 20, 'middle', modifier.shift | modifier.alt);

        readResult();

        expect(r.mousedown.clientX).toEqual(20);
        expect(r.mousedown.clientY).toEqual(20);
        expect(r.mousedown.ctrlKey).toEqual(false);
        expect(r.mousedown.shiftKey).toEqual(true);
        expect(r.mousedown.metaKey).toEqual(false);
        expect(r.mousedown.altKey).toEqual(true);
        expect(r.mousedown.button).toEqual(middle);

        expect(r.mouseup.clientX).toEqual(20);
        expect(r.mouseup.clientY).toEqual(20);
        expect(r.mouseup.ctrlKey).toEqual(false);
        expect(r.mouseup.shiftKey).toEqual(true);
        expect(r.mouseup.metaKey).toEqual(false);
        expect(r.mouseup.altKey).toEqual(true);
        expect(r.mouseup.button).toEqual(middle);

        expect(r.mousemove).toEqual(-1);

        // FIXME with the middle or right button + alt + shift : no DOM click event
        expect(r.click).toEqual(-1);
        //expect(r.click.clientX).toEqual(20);
        //expect(r.click.clientY).toEqual(20);
        //expect(r.click.ctrlKey).toEqual(false);
        //expect(r.click.shiftKey).toEqual(true);
        //expect(r.click.metaKey).toEqual(false);
        //expect(r.click.altKey).toEqual(true);
        //expect(r.click.button).toEqual(middle);
        //expect(r.dblclick).toEqual(-1);

        expect(r.dblclick).toEqual(-1);
    });

    var url2 = "http://127.0.0.1:8083/callbackclick.html";

    it("tests click via callphantom",function() {
        var loaded = false;
        var html = null;
        var receivedCallback = false;
        runs(function() {
            webpage.onCallback= function(data) {
                if (data.sendEvent) {
                    receivedCallback = true;
                    webpage.sendEvent(data.sendEvent[0], data.sendEvent[1], data.sendEvent[2], 'left', 0);
                }
                else if (data.html) {
                    html = data.html;
                }
            };
            webpage.open(url2, function(success){
                webpage.evaluate(function() {launchClick()})
                slimer.wait(500);
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(receivedCallback).toBeTruthy();
            expect(html).toEqual('button clicked');
            webpage.onCallback = null;
        })
    });
    
    
    it("test end",function() {
        webpage.close();
    });
});


