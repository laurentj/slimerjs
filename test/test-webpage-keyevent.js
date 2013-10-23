


describe("webpage.sendEvent", function() {

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

    // ----------------------------------------------- printable keycode: keydown

    it("send keydown event with a keycode of a printable char",function() {
            // -> phantomjs generates a keypress event when we send a keydown event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", webpage.event.key.A);
        readResult();
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 65
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 65
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual(""); // phantomjs generate "A" (because of keypress event..)
        expect(key.keypressAlt).toEqual(-1);  // value with phantomjs is false
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

    it("send keydown event with shift+keycode of a printable char",function() {
            // -> phantomjs generates a keypress event when we send a keydown event: inconsistent

        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", webpage.event.key.A, null, null, modifier.shift);
        readResult();
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 65
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 65
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual(""); // phantomjs generate "A" (because of keypress event..)
        expect(key.keypressAlt).toEqual(-1);  // value with phantomjs is false
        expect(key.keypressShift).toEqual(-1); // value with phantomjs is true
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

    it("send keydown event with ctrl+keycode of a printable char",function() {

        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", webpage.event.key.A, null, null, modifier.ctrl);
        readResult();
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

    it("send keydown event with alt+keycode of a printable char",function() {
            // -> phantomjs generates a keypress event when we send a keydown event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", webpage.event.key.A, null, null, modifier.alt);
        readResult();
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 65
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 65
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(-1); // value with phantomjs is true
        expect(key.keypressShift).toEqual(-1); // value with phantomjs is false
        expect(key.keypressCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keypressMeta).toEqual(-1)// value with phantomjs is false
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(true);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with ctrl+shift+keycode of a printable char",function() {
        // -> phantomjs generates a keypress event when we send a keydown event: inconsistent
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", webpage.event.key.A, null, null, modifier.ctrl | modifier.shift);
        readResult();
        expect(key.keydownK).toEqual(65);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1); // value with phantomjs is 65
        expect(key.keypressC).toEqual(-1); // value with phantomjs is 65
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("");
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

    // ----------------------------------------------- printable keycode: keypress


    it("send keypress event with a keycode of a printable char",function() {
          // --> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent for a single char

        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", webpage.event.key.A);
        readResult();
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 65
        expect(key.keydownC).toEqual(-1); // value with phantomjs is  0
        expect(key.keypressK).toEqual(0); // value with phantomjs is  65
        expect(key.keypressC).toEqual(65);
        expect(key.keyupK).toEqual(-1);// value with phantomjs is 65
        expect(key.keyupC).toEqual(-1);// value with phantomjs is 0
        expect(input).toEqual("A");
        expect(key.keypressAlt).toEqual(false);
        expect(key.keypressShift).toEqual(false);
        expect(key.keypressCtrl).toEqual(false);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    it("send keypress event with shift + keycode of a printable char",function() {
          // --> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent for a single char
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", webpage.event.key.A, null, null, modifier.shift);
        readResult();
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 65
        expect(key.keydownC).toEqual(-1); // value with phantomjs is  0
        expect(key.keypressK).toEqual(0); // value with phantomjs is  65
        expect(key.keypressC).toEqual(65);
        expect(key.keyupK).toEqual(-1);// value with phantomjs is 65
        expect(key.keyupC).toEqual(-1);// value with phantomjs is 0
        expect(input).toEqual("A");
        expect(key.keypressAlt).toEqual(false);
        expect(key.keypressShift).toEqual(true);
        expect(key.keypressCtrl).toEqual(false);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is  false
        expect(key.keyupShift).toEqual(-1); // value with phantomjs is true
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is  false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is  false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is  false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is  true
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is  false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is  false
    });

    it("send keypress event with alt + keycode of a printable char",function() {
          // --> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent for a single char
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", webpage.event.key.A, null, null, modifier.alt);
        readResult();
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 65
        expect(key.keydownC).toEqual(-1); // value with phantomjs is  0
        expect(key.keypressK).toEqual(0); // value with phantomjs is  65
        expect(key.keypressC).toEqual(65);
        expect(key.keyupK).toEqual(-1);// value with phantomjs is 65
        expect(key.keyupC).toEqual(-1);// value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(true);
        expect(key.keypressShift).toEqual(false);
        expect(key.keypressCtrl).toEqual(false);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is  true
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is  false
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is  false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is  false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is true
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is  false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is  false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is  false
    });

    it("send keypress event with ctrl + keycode of a printable char",function() {
          // --> phantomjs generates a keydown + keyup event BUT NO KEYPRESS when we
          // send a keypress event: inconsistent for a single char
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", webpage.event.key.A, null, null, modifier.ctrl);
        readResult();
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 65
        expect(key.keydownC).toEqual(-1); // value with phantomjs is  0
        expect(key.keypressK).toEqual(0); // value with phantomjs is  -1
        expect(key.keypressC).toEqual(65); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1);// value with phantomjs is 65
        expect(key.keyupC).toEqual(-1);// value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(false); // value with phantomjs is -1
        expect(key.keypressShift).toEqual(false); // value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(true); // value with phantomjs is -1
        expect(key.keypressMeta).toEqual(false);// value with phantomjs is -1
        expect(key.keyupAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1); // value with phantomjs is true
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });


    it("send keypress event with ctrl + shift + keycode of a printable char",function() {
          // --> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent for a single char
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", webpage.event.key.A, null, null, modifier.ctrl | modifier.shift);
        readResult();
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 65
        expect(key.keydownC).toEqual(-1); // value with phantomjs is  0
        expect(key.keypressK).toEqual(0); // value with phantomjs is  65
        expect(key.keypressC).toEqual(65);
        expect(key.keyupK).toEqual(-1);// value with phantomjs is 65
        expect(key.keyupC).toEqual(-1);// value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(false);
        expect(key.keypressShift).toEqual(true);
        expect(key.keypressCtrl).toEqual(true);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is true
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is true
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });


    // ----------------------------------------------- printable keycode: keyup

    it("send keyup event with a keycode of a printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", webpage.event.key.A);
        readResult();
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

    it("send keyup event with shift + keycode of a printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", webpage.event.key.A, null, null, modifier.shift);
        readResult();
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

    it("send keyup event with alt + keycode of a printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", webpage.event.key.A, null, null, modifier.alt);
        readResult();
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

    it("send keyup event with ctrl + keycode of a printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", webpage.event.key.A, null, null, modifier.ctrl);
        readResult();
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

    it("send keyup event with shift + ctrl + keycode of a printable char",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", webpage.event.key.A, null, null, modifier.ctrl | modifier.shift);
        readResult();
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

    // ----------------------------------------------- non-printable keycode: keydown

    it("send keydown event with a keycode of a non-printable char",function() {
        //phantomjs delete a character
        // -> it should not delete the character since keypress is not already sent
        webpage.evaluate(resetKeyCodeAndInit)
        webpage.sendEvent("keydown", webpage.event.key.Delete);
        readResult()
        expect(key.keydownK).toEqual(46);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("abc"); // value with phantomjs is ac
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
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with shift + keycode of a non-printable char",function() {
        webpage.evaluate(resetKeyCodeAndInit)
        webpage.sendEvent("keydown", webpage.event.key.Delete, null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(46);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("abc");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(true);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with alt + keycode of a non-printable char",function() {
        webpage.evaluate(resetKeyCodeAndInit)
        webpage.sendEvent("keydown", webpage.event.key.Delete, null, null, modifier.alt);
        readResult()
        expect(key.keydownK).toEqual(46);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("abc");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(true);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with ctrl + keycode of a non-printable char",function() {
        webpage.evaluate(resetKeyCodeAndInit)
        webpage.sendEvent("keydown", webpage.event.key.Delete, null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(46);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("abc"); // value with phantomjs is "a"
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

    it("send keydown event with shift + ctrl + keycode of a non-printable char",function() {
        webpage.evaluate(resetKeyCodeAndInit)
        webpage.sendEvent("keydown", webpage.event.key.Delete, null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(46);
        expect(key.keydownC).toEqual(0);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(-1);
        expect(key.keyupC).toEqual(-1);
        expect(input).toEqual("abc");
        expect(key.keypressAlt).toEqual(-1);
        expect(key.keypressShift).toEqual(-1);
        expect(key.keypressCtrl).toEqual(-1);
        expect(key.keypressMeta).toEqual(-1);
        expect(key.keyupAlt).toEqual(-1);
        expect(key.keyupShift).toEqual(-1);
        expect(key.keyupCtrl).toEqual(-1);
        expect(key.keyupMeta).toEqual(-1);
        expect(key.keydownAlt).toEqual(false);
        expect(key.keydownShift).toEqual(true);
        expect(key.keydownCtrl).toEqual(true);
        expect(key.keydownMeta).toEqual(false);
    });
    // ----------------------------------------------- non-printable keycode: keypress

    it("send keypress event with a keycode of a non-printable char",function() {
        // -> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent
        // and it don't send a keypress event !!

        webpage.evaluate(resetKeyCodeAndInit);
        webpage.sendEvent("keypress", webpage.event.key.Delete);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 46
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(46);// value with phantomjs is -1
        expect(key.keypressC).toEqual(0); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1);   // value with phantomjs is 46
        expect(key.keyupC).toEqual(-1);   // value with phantomjs is 0
        expect(input).toEqual("ac");
        expect(key.keypressAlt).toEqual(false); // value with phantomjs is -1
        expect(key.keypressShift).toEqual(false); // value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(false); // value with phantomjs is -1
        expect(key.keypressMeta).toEqual(false); // value with phantomjs is -1
        expect(key.keyupAlt).toEqual(-1); // value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false

    });

    it("send keypress event with  shift + keycode of a non-printable char",function() {
        // -> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent
        // and it don't send a keypress event !!
        webpage.evaluate(resetKeyCodeAndInit);
        webpage.sendEvent("keypress", webpage.event.key.End, null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 46
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(35);// value with phantomjs is -1
        expect(key.keypressC).toEqual(0); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1);   // value with phantomjs is 46
        expect(key.keyupC).toEqual(-1);   // value with phantomjs is 0

        expect(input).toEqual("abc");
        expect(key.keypressAlt).toEqual(false); // value with phantomjs is -1
        expect(key.keypressShift).toEqual(true); // value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(false);
        expect(key.keypressMeta).toEqual(false);
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keyupShift).toEqual(-1); // value with phantomjs is true
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is true
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    it("send keypress event with alt + keycode of a non-printable char",function() {
        // -> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent
        // and it don't send a keypress event !!

        webpage.evaluate(resetKeyCodeAndInit);
        webpage.sendEvent("keypress", webpage.event.key.Delete, null, null, modifier.alt);
        readResult()

        expect(key.keydownK).toEqual(-1); // value with phantomjs is 46
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(46);// value with phantomjs is -1
        expect(key.keypressC).toEqual(0); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1);   // value with phantomjs is 46
        expect(key.keyupC).toEqual(-1);   // value with phantomjs is 0
        expect(input).toEqual("abc");
        expect(key.keypressAlt).toEqual(true);// value with phantomjs is -1
        expect(key.keypressShift).toEqual(false);// value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(false);// value with phantomjs is -1
        expect(key.keypressMeta).toEqual(false);// value with phantomjs is -1
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is true
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is true
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    it("send keypress event with ctrl + keycode of a non-printable char",function() {
        // -> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent
        // and it don't send a keypress event !!
        webpage.evaluate(resetKeyCodeAndInit);
        webpage.sendEvent("keypress", webpage.event.key.Delete, null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 46
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(46);// value with phantomjs is -1
        expect(key.keypressC).toEqual(0); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1);   // value with phantomjs is 46
        expect(key.keyupC).toEqual(-1);   // value with phantomjs is 0
        if (slimer.geckoVersion.major > 25) {
            expect(input).toEqual("abc"); // regression in Gecko 26a2+?
        }
        else {
            expect(input).toEqual("a");
        }
        expect(key.keypressAlt).toEqual(false);// value with phantomjs is -1
        expect(key.keypressShift).toEqual(false);// value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(true);// value with phantomjs is -1
        expect(key.keypressMeta).toEqual(false);// value with phantomjs is -1
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false


    });


    it("send keypress event with shift + ctrl + keycode of a non-printable char",function() {
        // -> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent
        // and it don't send a keypress event !!
        webpage.evaluate(resetKeyCodeAndInit);
        webpage.sendEvent("keypress", webpage.event.key.Delete, null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 46
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(46);// value with phantomjs is -1
        expect(key.keypressC).toEqual(0); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1);   // value with phantomjs is 46
        expect(key.keyupC).toEqual(-1);   // value with phantomjs is 0
        expect(input).toEqual("abc");
        expect(key.keypressAlt).toEqual(false);// value with phantomjs is -1
        expect(key.keypressShift).toEqual(true);// value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(true);// value with phantomjs is -1
        expect(key.keypressMeta).toEqual(false);// value with phantomjs is -1
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is true
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is true
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    // ----------------------------------------------- non-printable keycode: keyup

    it("send keyup event with a keycode of a non-printable char",function() {
        webpage.evaluate(resetKeyCodeAndInit);
        webpage.sendEvent("keyup", webpage.event.key.Delete);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(46);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("abc");
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

    it("send keyup event with  shift + keycode of a non-printable char",function() {
        webpage.evaluate(resetKeyCodeAndInit);
        webpage.sendEvent("keyup", webpage.event.key.Delete, null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(46);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("abc");
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

    it("send keyup event with alt + keycode of a non-printable char",function() {
        webpage.evaluate(resetKeyCodeAndInit);
        webpage.sendEvent("keyup", webpage.event.key.Delete, null, null, modifier.alt);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(46);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("abc");
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

    it("send keyup event with ctrl + keycode of a non-printable char",function() {
        webpage.evaluate(resetKeyCodeAndInit);
        webpage.sendEvent("keyup", webpage.event.key.Delete, null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(46);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("abc");
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

    it("send keyup event with shift +ctrl + keycode of a non-printable char",function() {
        webpage.evaluate(resetKeyCodeAndInit);
        webpage.sendEvent("keyup", webpage.event.key.Delete, null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(46);
        expect(key.keyupC).toEqual(0);
        expect(input).toEqual("abc");
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


    // ----------------------------------------------- no DOM Keycode equivalent: keydown

    it("send keydown event with a keycode that don't match DOM keycode",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", webpage.event.key.Ocircumflex);
        readResult()
        expect(key.keydownK).toEqual(0); // FIXME it should equal to a keycode, depending of the keyboard layout
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
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with  shift + keycode that don't match DOM keycode",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", webpage.event.key.Ocircumflex, null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(0); // FIXME it should equal to a keycode, depending of the keyboard layout
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
        expect(key.keydownShift).toEqual(true);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with alt + keycode that don't match DOM keycode",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", webpage.event.key.Ocircumflex, null, null, modifier.alt);
        readResult()
        expect(key.keydownK).toEqual(0); // FIXME it should equal to a keycode, depending of the keyboard layout
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
        expect(key.keydownAlt).toEqual(true);
        expect(key.keydownShift).toEqual(false);
        expect(key.keydownCtrl).toEqual(false);
        expect(key.keydownMeta).toEqual(false);
    });

    it("send keydown event with ctrl + keycode that don't match DOM keycode",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", webpage.event.key.Ocircumflex, null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(0); // FIXME it should equal to a keycode, depending of the keyboard layout
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

    it("send keydown event with shift+ ctrl + keycode that don't match DOM keycode",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keydown", webpage.event.key.Ocircumflex, null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(0); // FIXME it should equal to a keycode, depending of the keyboard layout
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
        expect(key.keydownShift).toEqual(true);
        expect(key.keydownCtrl).toEqual(true);
        expect(key.keydownMeta).toEqual(false);
    });

    // ----------------------------------------------- no DOM Keycode equivalent: keypress

    it("send keypress event with a keycode that don't match DOM keycode",function() {
        // -> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent
        // and it don't send a keypress event !!
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", webpage.event.key.Ocircumflex);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 0
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(0);// value with phantomjs is -1
        expect(key.keypressC).toEqual(212); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1);   // value with phantomjs is 0
        expect(key.keyupC).toEqual(-1);   // value with phantomjs is 0
        expect(input).toEqual("Ô"); // value with phantomjs is ""
        expect(key.keypressAlt).toEqual(false);// value with phantomjs is -1
        expect(key.keypressShift).toEqual(false);// value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(false);// value with phantomjs is -1
        expect(key.keypressMeta).toEqual(false);// value with phantomjs is -1
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });


    it("send keypress event with  shift + keycode that don't match DOM keycode",function() {
        // -> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent
        // and it don't send a keypress event !!
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", webpage.event.key.Ocircumflex, null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 0
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(0);// value with phantomjs is -1
        expect(key.keypressC).toEqual(212); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1);   // value with phantomjs is 0
        expect(key.keyupC).toEqual(-1);   // value with phantomjs is 0
        expect(input).toEqual("Ô");
        expect(key.keypressAlt).toEqual(false);// value with phantomjs is -1
        expect(key.keypressShift).toEqual(true);// value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(false);// value with phantomjs is -1
        expect(key.keypressMeta).toEqual(false);// value with phantomjs is -1
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is true
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is true
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    it("send keypress event with alt + keycode that don't match DOM keycode",function() {
        // -> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent
        // and it don't send a keypress event !!
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", webpage.event.key.Ocircumflex, null, null, modifier.alt);
        readResult()

        expect(key.keydownK).toEqual(-1); // value with phantomjs is 0
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(0);// value with phantomjs is -1
        expect(key.keypressC).toEqual(212); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1);   // value with phantomjs is 0
        expect(key.keyupC).toEqual(-1);   // value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(true);// value with phantomjs is -1
        expect(key.keypressShift).toEqual(false);// value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(false);// value with phantomjs is -1
        expect(key.keypressMeta).toEqual(false);// value with phantomjs is -1
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is true
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is true
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is false
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    it("send keypress event with ctrl + keycode that don't match DOM keycode",function() {
        // -> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent
        // and it don't send a keypress event !!
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", webpage.event.key.Ocircumflex, null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 0
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(0);// value with phantomjs is -1
        expect(key.keypressC).toEqual(212); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1);   // value with phantomjs is 0
        expect(key.keyupC).toEqual(-1);   // value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(false);// value with phantomjs is -1
        expect(key.keypressShift).toEqual(false);// value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(true);// value with phantomjs is -1
        expect(key.keypressMeta).toEqual(false);// value with phantomjs is -1
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is false
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is false
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });


    it("send keypress event with shift+ctrl + keycode that don't match DOM keycode",function() {
        // -> phantomjs generates a keydown + keyup event when we send a keypress event: inconsistent
        // and it don't send a keypress event !!
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keypress", webpage.event.key.Ocircumflex, null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1); // value with phantomjs is 0
        expect(key.keydownC).toEqual(-1); // value with phantomjs is 0
        expect(key.keypressK).toEqual(0);// value with phantomjs is -1
        expect(key.keypressC).toEqual(212); // value with phantomjs is -1
        expect(key.keyupK).toEqual(-1);   // value with phantomjs is 0
        expect(key.keyupC).toEqual(-1);   // value with phantomjs is 0
        expect(input).toEqual("");
        expect(key.keypressAlt).toEqual(false);// value with phantomjs is -1
        expect(key.keypressShift).toEqual(true);// value with phantomjs is -1
        expect(key.keypressCtrl).toEqual(true);// value with phantomjs is -1
        expect(key.keypressMeta).toEqual(false);// value with phantomjs is -1
        expect(key.keyupAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keyupShift).toEqual(-1);// value with phantomjs is true
        expect(key.keyupCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keyupMeta).toEqual(-1);// value with phantomjs is false
        expect(key.keydownAlt).toEqual(-1);// value with phantomjs is false
        expect(key.keydownShift).toEqual(-1);// value with phantomjs is true
        expect(key.keydownCtrl).toEqual(-1);// value with phantomjs is true
        expect(key.keydownMeta).toEqual(-1);// value with phantomjs is false
    });

    // ----------------------------------------------- no DOM Keycode equivalent: keyup

    it("send keyup event with a keycode that don't match DOM keycode",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", webpage.event.key.Ocircumflex);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(0); // FIXME it should equal to a keycode, depending of the keyboard layout
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

    it("send keyup event with  shift + keycode that don't match DOM keycode",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", webpage.event.key.Ocircumflex, null, null, modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(0); // FIXME it should equal to a keycode, depending of the keyboard layout
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

    it("send keyup event with alt + keycode that don't match DOM keycode",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", webpage.event.key.Ocircumflex, null, null, modifier.alt);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(0); // FIXME it should equal to a keycode, depending of the keyboard layout
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

    it("send keyup event with ctrl + keycode that don't match DOM keycode",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", webpage.event.key.Ocircumflex, null, null, modifier.ctrl);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(0); // FIXME it should equal to a keycode, depending of the keyboard layout
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


    it("send keyup event with shift + ctrl + keycode that don't match DOM keycode",function() {
        webpage.evaluate(resetKeyCode);
        webpage.sendEvent("keyup", webpage.event.key.Ocircumflex, null, null, modifier.ctrl | modifier.shift);
        readResult()
        expect(key.keydownK).toEqual(-1);
        expect(key.keydownC).toEqual(-1);
        expect(key.keypressK).toEqual(-1);
        expect(key.keypressC).toEqual(-1);
        expect(key.keyupK).toEqual(0); // FIXME it should equal to a keycode, depending of the keyboard layout
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


