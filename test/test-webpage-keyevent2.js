


describe("webpage.sendEvent() ", function() {

    var modifier = {
            shift:  0x02000000,
            ctrl:   0x04000000,
            alt:    0x08000000,
            meta:   0x10000000,
            keypad: 0x20000000
        };

    var webpage;
    var url = "http://127.0.0.1:8083/charcode.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    function retrieveKeyCode(){
        var r = [result,
                 document.getElementById('txt').value
                 ];
        return r;
    }

    function resetKeyCode(){
       clearK();
    }
    function resetKeyCodeAndInit(){
       clearK();
       var t = document.getElementById('txt')
       t.value='abc';
       t.focus();
       t.selectionStart = t.selectionEnd = 1;
    }

    var r, key, input;

    function readResult() {
        r = webpage.evaluate(retrieveKeyCode);
        key = r[0]
        input = r[1]
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
            expect(key.keydownK).toEqual(-1);
            expect(key.keydownC).toEqual(-1);
            expect(key.keypressK).toEqual(-1);
            expect(key.keypressC).toEqual(-1);
            expect(key.keyupK).toEqual(-1);
            expect(key.keyupC).toEqual(-1);
            
            expect(key.keypressAlt).toEqual(-1);
            expect(key.keypressShift).toEqual(-1);
            expect(key.keypressCtrl).toEqual(-1);
            expect(key.keypressMeta).toEqual(-1);
            expect(key.keyupAlt).toEqual(-1);
            expect(key.keyupShift).toEqual(-1);
            expect(key.keyupCtrl).toEqual(-1);
            expect(key.keyupMeta).toEqual(-1);
            expect(key.keydownAlt).toEqual(-1);
            expect(key.keydownShift).toEqual(-1);
            expect(key.keydownCtrl).toEqual(-1);
            expect(key.keydownMeta).toEqual(-1);

            expect(input).toEqual("");
        })
    });


    // -----------------------------------------------  single char: keydown

    it("send keydown event with a string of a printable char",function() {
        // -> phantomjs generates a keypress event when we send a keydown event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "a");
        readResult()
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 97
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 97
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");  // value with phantomjs is "a" because of the keypress event
        expect(key.keypressAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keypressShift).toEqual(-1);// value with phantomjs is false
        expect(key.keypressCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keypressMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with  shift + string of a printable char",function() {
        // -> phantomjs generates a keypress event when we send a keydown event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "a", null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 97
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 97
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");  // value with phantomjs is "a" because of the keypress event
        expect(key.keypressAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keypressShift).toEqual(-1);// value with phantomjs is true
        expect(key.keypressCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keypressMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(true);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with alt + string of a printable char",function() {
        // -> phantomjs generates a keypress event when we send a keydown event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "a", null, null, modifier.alt);
        readResult()
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 97
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 97
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");  
        expect(key.keypressAlt).toEqual(-1); // value with phantomjs is true
        expect(key.keypressShift).toEqual(-1);// value with phantomjs is false
        expect(key.keypressCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keypressMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(true);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with ctrl + string of a printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "a", null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(true);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with shift + ctrl + string of a printable char",function() {
        // -> phantomjs generates a keypress event when we send a keydown event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "a", null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 97
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 97
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");  // value with phantomjs is "a" because of the keypress event
        expect(key.keypressAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keypressShift).toEqual(-1);// value with phantomjs is true
        expect(key.keypressCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keypressMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(true);
        expect(key.keydownCtrl).toEqual(true);
        expect(key.keydownMeta).toEqual(false);
    });
    // -----------------------------------------------  single char: keypress

    it("send keypress event with a string of a printable char",function() {
        // -> phantomjs generates a keydown + keypress + keyup event when
        // we send a keypress event: inconsistent for a single char
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "a");
        readResult()
        expect(key.keydownK).toEqual(-1);  // value with phantomjs is 65
        expect(key.keydownC).toEqual(-1);   // value with phantomjs is 0
        expect(key.keypressK).toEqual(0); // value with phantomjs is 97
        expect(key.keypressC).toEqual(97);
        expect(key.keyupK).toEqual(-1); // value with phantomjs is 65 
        expect(key.keyupC).toEqual(-1); // value with phantomjs is 0
        expect(input).toEqual("a");
        expect(key.keypressAlt).toEqual(false);
        expect(key.keypressShift).toEqual(false);
        expect(key.keypressCtrl).toEqual(false);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keyupShift).toEqual(-1); // value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1); // value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1); // value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keydownShift).toEqual(-1); // value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1); // value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1); // value with phantomjs is false
    });

    it("send keypress event with  shift + string of a printable char",function() {
        // -> phantomjs generates a keydown + keypress + keyup event when
        // we send a keypress event: inconsistent for a single char
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "a", null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1);  // value with phantomjs is 65
        expect(key.keydownC).toEqual(-1);   // value with phantomjs is 0
        expect(key.keypressK).toEqual(0); // value with phantomjs is 97
        expect(key.keypressC).toEqual(97);
        expect(key.keyupK).toEqual(-1); // value with phantomjs is 65 
        expect(key.keyupC).toEqual(-1); // value with phantomjs is 0
        expect(input).toEqual("a");
        expect(key.keypressAlt).toEqual(false);
        expect(key.keypressShift).toEqual(true);
        expect(key.keypressCtrl).toEqual(false);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keyupShift).toEqual(-1); // value with phantomjs is true
        expect(key.keyupCtrl).toEqual(-1); // value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1); // value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keydownShift).toEqual(-1); // value with phantomjs is true
        expect(key.keydownCtrl).toEqual(-1); // value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1); // value with phantomjs is false
    });

    it("send keypress event with alt + string of a printable char",function() {
        // -> phantomjs generates a keydown + keypress + keyup event when
        // we send a keypress event: inconsistent for a single char
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "a", null, null, modifier.alt);
        readResult()

        expect(key.keydownK).toEqual(-1);  // value with phantomjs is 65
        expect(key.keydownC).toEqual(-1);   // value with phantomjs is 0
        expect(key.keypressK).toEqual(0); // value with phantomjs is 97
        expect(key.keypressC).toEqual(97);
        expect(key.keyupK).toEqual(-1); // value with phantomjs is 65 
        expect(key.keyupC).toEqual(-1); // value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(true);
        expect(key.keypressShift).toEqual(false);
        expect(key.keypressCtrl).toEqual(false);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1); // value with phantomjs is true
        expect(key.keyupShift).toEqual(-1); // value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1); // value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1); // value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1); // value with phantomjs is true
        expect(key.keydownShift).toEqual(-1); // value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1); // value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1); // value with phantomjs is false
    });

    it("send keypress event with ctrl + string of a printable char",function() {
        // -> phantomjs generates a keydown  + keyup event when
        // we send a keypress event, BUT NO KEYPRESS: inconsistent for a single char
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "a", null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(-1);  // value with phantomjs is 65
        expect(key.keydownC).toEqual(-1);   // value with phantomjs is 0
        expect(key.keypressK).toEqual(0); // value with phantomjs is -1
        expect(key.keypressC).toEqual(97); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1); // value with phantomjs is 65 
        expect(key.keyupC).toEqual(-1); // value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(false); // value with phantomjs is -1
        expect(key.keypressShift).toEqual(false); // value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(true); // value with phantomjs is -1
        expect(key.keypressMeta).toEqual(false); // value with phantomjs is -1
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1); // value with phantomjs is true
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1); // value with phantomjs is true
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });


    it("send keypress event with shift + ctrl + string of a printable char",function() {
        // -> phantomjs generates a keydown  + keyup event when
        // we send a keypress event: inconsistent for a single char
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "a", null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1);  // value with phantomjs is 65
        expect(key.keydownC).toEqual(-1);   // value with phantomjs is 0
        expect(key.keypressK).toEqual(0); // value with phantomjs is 97
        expect(key.keypressC).toEqual(97);
        expect(key.keyupK).toEqual(-1); // value with phantomjs is 65 
        expect(key.keyupC).toEqual(-1); // value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(false); 
        expect(key.keypressShift).toEqual(true);
        expect(key.keypressCtrl).toEqual(true); 
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is true
        expect(key.keyupCtrl).toEqual(-1); // value with phantomjs is true
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is true
        expect(key.keydownCtrl).toEqual(-1); // value with phantomjs is true
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    // -----------------------------------------------  single char: keyup

    it("send keyup event with a string of a printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "a");
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(65);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(false);
        expect(key.keyupCtrl).toEqual(false);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });

    it("send keyup event with  shift + string of a printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "a", null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(65);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(true);
        expect(key.keyupCtrl).toEqual(false);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });

    it("send keyup event with alt + string of a printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "a", null, null, modifier.alt);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(65);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(true);
        expect(key.keyupShift).toEqual(false);
        expect(key.keyupCtrl).toEqual(false);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });

    it("send keyup event with ctrl + string of a printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "a", null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(65);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(false);
        expect(key.keyupCtrl).toEqual(true);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });

    it("send keyup event with shift + ctrl + string of a printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "a", null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(65);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(true);
        expect(key.keyupCtrl).toEqual(true);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });

    // -----------------------------------------------  single accentuated char: keydown

    it("send keydown event with a string of an accentuated printable char",function() {
            // -> phantomjs generates a keypress event when we send a keydown
            // event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "é");
        readResult()
        expect(key.keydownK).toEqual(0); // it should equal to a keycode, depending of the keyboard layout
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 233
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 233
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual(""); // value with phantomjs is "é"
        expect(key.keypressAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keypressShift).toEqual(-1); // value with phantomjs is false
        expect(key.keypressCtrl).toEqual(-1); // value with phantomjs is false
        expect(key.keypressMeta).toEqual(-1); // value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with  shift + string of an accentuated printable char",function() {
        // -> phantomjs generates a keypress event when we send a keydown
        // event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "é", null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(0); // it should equal to a keycode, depending of the keyboard layout
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 233
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 233
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual(""); // value with phantomjs is "é"
        expect(key.keypressAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keypressShift).toEqual(-1); // value with phantomjs is true
        expect(key.keypressCtrl).toEqual(-1); // value with phantomjs is false
        expect(key.keypressMeta).toEqual(-1); // value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(true);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with alt + string of an accentuated printable char",function() {
        // -> phantomjs generates a keypress event when we send a keydown
        // event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "é", null, null, modifier.alt);
        readResult()
        expect(key.keydownK).toEqual(0); // it should equal to a keycode, depending of the keyboard layout
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 233
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 233
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1); // value with phantomjs is true
        expect(key.keypressShift).toEqual(-1); // value with phantomjs is false
        expect(key.keypressCtrl).toEqual(-1); // value with phantomjs is false
        expect(key.keypressMeta).toEqual(-1); // value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(true);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with ctrl + string of an accentuated printable char",function() {
        // -> phantomjs generates a keypress event when we send a keydown
        // event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "é", null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(0); // it should equal to a keycode, depending of the keyboard layout
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 233
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 233
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keypressShift).toEqual(-1); // value with phantomjs is false
        expect(key.keypressCtrl).toEqual(-1); // value with phantomjs is true
        expect(key.keypressMeta).toEqual(-1); // value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(true);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with shift + ctrl + string of an accentuated printable char",function() {
        // -> phantomjs generates a keypress event when we send a keydown
        // event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "é", null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(0); // it should equal to a keycode, depending of the keyboard layout
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 233
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 233
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keypressShift).toEqual(-1); // value with phantomjs is true
        expect(key.keypressCtrl).toEqual(-1); // value with phantomjs is true
        expect(key.keypressMeta).toEqual(-1); // value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(true);
        expect(key.keydownCtrl).toEqual(true);
        expect(key.keydownMeta).toEqual(false);
    });

    // -----------------------------------------------  single accentuated char: keypress

    it("send keypress event with a string of an accentuated printable char",function() {
        // -> phantomjs generates a keydown + keypress + keyup event when we send a keypress
        // event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "é");
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 0 
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(0);  // value with phantomjs is 233
        expect(key.keypressC).toEqual(233);
        expect(key.keyupK).toEqual(-1); // value with phantomjs is 0 
        expect(key.keyupC).toEqual(-1); // value with phantomjs is 0
        expect(input).toEqual("é");
        expect(key.keypressAlt).toEqual(false);
        expect(key.keypressShift).toEqual(false);
        expect(key.keypressCtrl).toEqual(false);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    it("send keypress event with  shift + string of an accentuated printable char",function() {
        // -> phantomjs generates a keydown + keypress + keyup event when we send a keypress
        // event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "é", null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 0 
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(0);  // value with phantomjs is 233
        expect(key.keypressC).toEqual(233);
        expect(key.keyupK).toEqual(-1); // value with phantomjs is 0 
        expect(key.keyupC).toEqual(-1); // value with phantomjs is 0
        expect(input).toEqual("é");
        expect(key.keypressAlt).toEqual(false);
        expect(key.keypressShift).toEqual(true);
        expect(key.keypressCtrl).toEqual(false);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is true
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is true
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    it("send keypress event with alt + string of an accentuated printable char",function() {
        // -> phantomjs generates a keydown + keypress + keyup event when we send a keypress
        // event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "é", null, null, modifier.alt);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 0 
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(0);  // value with phantomjs is 233
        expect(key.keypressC).toEqual(233);
        expect(key.keyupK).toEqual(-1); // value with phantomjs is 0 
        expect(key.keyupC).toEqual(-1); // value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(true);
        expect(key.keypressShift).toEqual(false);
        expect(key.keypressCtrl).toEqual(false);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1); // value with phantomjs is true
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is true
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    it("send keypress event with ctrl + string of an accentuated printable char",function() {
        // -> phantomjs generates a keydown + keypress + keyup event when we send a keypress
        // event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "é", null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 0 
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(0);  // value with phantomjs is 233
        expect(key.keypressC).toEqual(233);
        expect(key.keyupK).toEqual(-1); // value with phantomjs is 0 
        expect(key.keyupC).toEqual(-1); // value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(false);
        expect(key.keypressShift).toEqual(false);
        expect(key.keypressCtrl).toEqual(true);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    it("send keypress event with shift + ctrl + string of an accentuated printable char",function() {
        // -> phantomjs generates a keydown + keypress + keyup event when we send a keypress
        // event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "é", null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 0 
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(0);  // value with phantomjs is 233
        expect(key.keypressC).toEqual(233);
        expect(key.keyupK).toEqual(-1); // value with phantomjs is 0 
        expect(key.keyupC).toEqual(-1); // value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(false);
        expect(key.keypressShift).toEqual(true);
        expect(key.keypressCtrl).toEqual(true);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is true
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is true
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    // -----------------------------------------------  single accentuated char: keyup

    it("send keyup event with a string of an accentuated printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "é");
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(0);// it should equal to a keycode, depending of the keyboard layout
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(false);
        expect(key.keyupCtrl).toEqual(false);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });

    it("send keyup event with  shift + string of an accentuated printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "é", null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(0);// it should equal to a keycode, depending of the keyboard layout
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(true);
        expect(key.keyupCtrl).toEqual(false);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });

    it("send keyup event with alt + string of an accentuated printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "é", null, null, modifier.alt);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(0);// it should equal to a keycode, depending of the keyboard layout
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(true);
        expect(key.keyupShift).toEqual(false);
        expect(key.keyupCtrl).toEqual(false);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });

    it("send keyup event with ctrl + string of an accentuated printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "é", null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(0);// it should equal to a keycode, depending of the keyboard layout
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(false);
        expect(key.keyupCtrl).toEqual(true);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });

    it("send keyup event with shift + ctrl + string of an accentuated printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "é", null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(0);// it should equal to a keycode, depending of the keyboard layout
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(true);
        expect(key.keyupCtrl).toEqual(true);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });

    // -----------------------------------------------  string: keydown

    it("send keydown event with a string",function() {
        // -> phantomjs generates a keypress event when we send a
        // keydown event: inconsistent
        // and phantomJS generates some characters without key events ?!!
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "aBè");
        // let's assume that we send only a character for a given string
        // since it does not make sens to send several keydown without
        // keypress/keyup DOM event
        readResult()
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1);// value with phantomjs is 97
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 97
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual(""); // value with phantomjs is "aBé".
        expect(key.keypressAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keypressShift).toEqual(-1);// value with phantomjs is false
        expect(key.keypressCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keypressMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with  shift + string",function() {
        // -> phantomjs generates a keypress event when we send a
        // keydown event: inconsistent
        // and phantomJS generates some characters without key events ?!!
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "aBè", null, null, modifier.shift);
        // let's assume that we send only a character for a given string
        // since it does not make sens to send several keydown without
        // keypress/keyup DOM event
        readResult()
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1);// value with phantomjs is 97
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 97
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual(""); // value with phantomjs is "aBé".
        expect(key.keypressAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keypressShift).toEqual(-1);// value with phantomjs is true
        expect(key.keypressCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keypressMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(true);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with alt + string",function() {
        // -> phantomjs generates a keypress event when we send a
        // keydown event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "aBè", null, null, modifier.alt);
        // let's assume that we send only a character for a given string
        // since it does not make sens to send several keydown without
        // keypress/keyup DOM event
        readResult()
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1);// value with phantomjs is 97
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 97
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);// value with phantomjs is true
        expect(key.keypressShift).toEqual(-1);// value with phantomjs is false
        expect(key.keypressCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keypressMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(true);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with ctrl + string",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "aBè", null, null, modifier.ctrl);
        // let's assume that we send only a character for a given string
        // since it does not make sens to send several keydown without
        // keypress/keyup DOM event
        readResult()
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(true);
        expect(key.keydownMeta).toEqual(false);
    });


    it("send keydown event with shift + ctrl + string",function() {
        // -> phantomjs generates a keypress event when we send a
        // keydown event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", "aBè", null, null, modifier.ctrl | modifier.shift);
        // let's assume that we send only a character for a given string
        // since it does not make sens to send several keydown without
        // keypress/keyup DOM event
        readResult()
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keypressShift).toEqual(-1);// value with phantomjs is true
        expect(key.keypressCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keypressMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(true);
        expect(key.keydownCtrl).toEqual(true);
        expect(key.keydownMeta).toEqual(false);
    });

    // -----------------------------------------------  string: keypress

    it("send keypress event with a string",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "aBè");
        readResult()
        // let's assume that for a whole string, we generate all key events
        // for all characters
        expect(key.keydownK).toEqual([65,66,0]);
        expect(key.keydownC).toEqual([0,0,0]);
        expect(key.keypressK).toEqual([0,0,0]); // value with phantomjs is [97,66,232]
        expect(key.keypressC).toEqual([97,66,232]);
        expect(key.keyupK).toEqual([65,66,0]);
        expect(key.keyupC).toEqual([0,0,0]);
        expect(input).toEqual("aBè");
        expect(key.keypressAlt).toEqual([ false, false, false]);
        expect(key.keypressShift).toEqual([ false, false, false]);
        expect(key.keypressCtrl).toEqual([ false, false, false]);
        expect(key.keypressMeta).toEqual([ false, false, false]);
        expect(key.keyupAlt).toEqual([ false, false, false]);
        expect(key.keyupShift).toEqual([ false, false, false]);
        expect(key.keyupCtrl).toEqual([ false, false, false]);
        expect(key.keyupMeta).toEqual([ false, false, false]);
        expect(key.keydownAlt).toEqual([ false, false, false]);
        expect(key.keydownShift).toEqual([ false, false, false]);
        expect(key.keydownCtrl).toEqual([ false, false, false]);
        expect(key.keydownMeta).toEqual([ false, false, false]);
    });


    it("send keypress event with  shift + string",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "aBè", null, null, modifier.shift);
        readResult()
        // let's assume that for a whole string, we generate all key events
        // for all characters
        expect(key.keydownK).toEqual([65,66,0]);
        expect(key.keydownC).toEqual([0,0,0]);
        expect(key.keypressK).toEqual([0,0,0]); // value with phantomjs is [97,66,232]
        expect(key.keypressC).toEqual([97,66,232]);
        expect(key.keyupK).toEqual([65,66,0]);
        expect(key.keyupC).toEqual([0,0,0]);
        expect(input).toEqual("aBè");
        expect(key.keypressAlt).toEqual([ false, false, false]);
        expect(key.keypressShift).toEqual([true, true, true]);
        expect(key.keypressCtrl).toEqual([ false, false, false]);
        expect(key.keypressMeta).toEqual([ false, false, false]);
        expect(key.keyupAlt).toEqual([ false, false, false]);
        expect(key.keyupShift).toEqual([true, true, true]);
        expect(key.keyupCtrl).toEqual([ false, false, false]);
        expect(key.keyupMeta).toEqual([ false, false, false]);
        expect(key.keydownAlt).toEqual([ false, false, false]);
        expect(key.keydownShift).toEqual([true, true, true]);
        expect(key.keydownCtrl).toEqual([ false, false, false]);
        expect(key.keydownMeta).toEqual([ false, false, false]);
    });


    it("send keypress event with alt + string",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "aBè", null, null, modifier.alt);
        readResult()
        // let's assume that for a whole string, we generate all key events
        // for all characters
        expect(key.keydownK).toEqual([65,66,0]);
        expect(key.keydownC).toEqual([0,0,0]);
        expect(key.keypressK).toEqual([0,0,0]); // value with phantomjs is [97,66,232]
        expect(key.keypressC).toEqual([97,66,232]);
        expect(key.keyupK).toEqual([65,66,0]);
        expect(key.keyupC).toEqual([0,0,0]);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual([true, true, true]);
        expect(key.keypressShift).toEqual([ false, false, false]);
        expect(key.keypressCtrl).toEqual([ false, false, false]);
        expect(key.keypressMeta).toEqual([ false, false, false]);
        expect(key.keyupAlt).toEqual([true, true, true]);
        expect(key.keyupShift).toEqual([ false, false, false]);
        expect(key.keyupCtrl).toEqual([ false, false, false]);
        expect(key.keyupMeta).toEqual([ false, false, false]);
        expect(key.keydownAlt).toEqual([true, true, true]);
        expect(key.keydownShift).toEqual([ false, false, false]);
        expect(key.keydownCtrl).toEqual([ false, false, false]);
        expect(key.keydownMeta).toEqual([ false, false, false]);
    });


    it("send keypress event with ctrl + string",function() {
        // phantomjs doesn't generate a keypress event for the first character
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "aBè", null, null, modifier.ctrl);
        readResult()
        // let's assume that for a whole string, we generate all key events
        // for all characters
        expect(key.keydownK).toEqual([65,66,0]);
        expect(key.keydownC).toEqual([0,0,0]);
        expect(key.keypressK).toEqual([0,0,0]); // value with phantomjs is [66,232]
        expect(key.keypressC).toEqual([97, 66,232]); // value with phantomjs is [66,232]
        expect(key.keyupK).toEqual([65,66,0]);
        expect(key.keyupC).toEqual([0,0,0]);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual([ false, false, false]); //  value with phantomjs is [ false, false]
        expect(key.keypressShift).toEqual([ false, false, false]); //  value with phantomjs is [ false, false]
        expect(key.keypressCtrl).toEqual([true, true, true]); //  value with phantomjs is [true, true]
        expect(key.keypressMeta).toEqual([ false, false, false]); //  value with phantomjs is [ false, false]
        expect(key.keyupAlt).toEqual([ false, false, false]);
        expect(key.keyupShift).toEqual([ false, false, false]);
        expect(key.keyupCtrl).toEqual([ true, true, true]);
        expect(key.keyupMeta).toEqual([ false, false, false]);
        expect(key.keydownAlt).toEqual([ false, false, false]);
        expect(key.keydownShift).toEqual([ false, false, false]);
        expect(key.keydownCtrl).toEqual([ true, true, true]);
        expect(key.keydownMeta).toEqual([ false, false, false]);
    });

    it("send keypress event with shift + ctrl + string",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", "aBè", null, null, modifier.ctrl | modifier.shift);
        readResult()
        // let's assume that for a whole string, we generate all key events
        // for all characters
        expect(key.keydownK).toEqual([65,66,0]);
        expect(key.keydownC).toEqual([0,0,0]);
        expect(key.keypressK).toEqual([0,0,0]); // value with phantomjs is [97, 66,232]
        expect(key.keypressC).toEqual([97,66,232]);
        expect(key.keyupK).toEqual([65,66,0]);
        expect(key.keyupC).toEqual([0,0,0]);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual([ false, false, false]);
        expect(key.keypressShift).toEqual([ true, true, true]);
        expect(key.keypressCtrl).toEqual([true, true, true]);
        expect(key.keypressMeta).toEqual([ false, false, false]);
        expect(key.keyupAlt).toEqual([ false, false, false]);
        expect(key.keyupShift).toEqual([ true, true, true]);
        expect(key.keyupCtrl).toEqual([ true, true, true]);
        expect(key.keyupMeta).toEqual([ false, false, false]);
        expect(key.keydownAlt).toEqual([ false, false, false]);
        expect(key.keydownShift).toEqual([ true, true, true]);
        expect(key.keydownCtrl).toEqual([ true, true, true]);
        expect(key.keydownMeta).toEqual([ false, false, false]);
    });

    // -----------------------------------------------  string: keyup

    it("send keyup event with a string",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "aBè");
        readResult()
        // let's assume that we send only a character for a given string
        // since it does not make sens to send several keyup without
        // keypress/keydown DOM event
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(65);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(false);
        expect(key.keyupCtrl).toEqual(false);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });


    it("send keyup event with  shift + string",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "aBè", null, null, modifier.shift);
        readResult()
        // let's assume that we send only a character for a given string
        // since it does not make sens to send several keyup without
        // keypress/keydown DOM event
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(65);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(true);
        expect(key.keyupCtrl).toEqual(false);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });


    it("send keyup event with alt + string",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "aBè", null, null, modifier.alt);
        readResult()
        // let's assume that we send only a character for a given string
        // since it does not make sens to send several keyup without
        // keypress/keydown DOM event
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(65);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(true);
        expect(key.keyupShift).toEqual(false);
        expect(key.keyupCtrl).toEqual(false);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });


    it("send keyup event with ctrl + string",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "aBè", null, null, modifier.ctrl);
        readResult()
        // let's assume that we send only a character for a given string
        // since it does not make sens to send several keyup without
        // keypress/keydown DOM event
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(65);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(false);
        expect(key.keyupCtrl).toEqual(true);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });


    it("send keyup event with shift + ctrl + string",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", "aBè", null, null, modifier.ctrl | modifier.shift);
        readResult()
        // let's assume that we send only a character for a given string
        // since it does not make sens to send several keyup without
        // keypress/keydown DOM event
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(65);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(false);
        expect(key.keyupShift).toEqual(true);
        expect(key.keyupCtrl).toEqual(true);
        expect(key.keyupMeta).toEqual(false);
        expect(key.keydownAlt).toEqual(-1);
        expect(key.keydownShift).toEqual(-1);
        expect(key.keydownCtrl).toEqual(-1);
        expect(key.keydownMeta).toEqual(-1);
    });
    it("test end", function(){
        webpage.close();
    });
});


