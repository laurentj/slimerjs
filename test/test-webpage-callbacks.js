
describe("webpage.onConsoleMessage", function() {

    var webpage, webpage2;
    var message, message2;

    var url = "http://127.0.0.1:8083/";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
        webpage2 = require("webpage").create();

        webpage.onConsoleMessage= function(msg, lineNum, sourceId, level, func, timestamp) {
            var m = {m:msg,
                l:lineNum,
                s:sourceId,
                lev: level,
                f:func,
                t: timestamp}
            if (message) {
                message = [ message, m ]
            }
            else
                message = m
        }
    
        webpage2.onConsoleMessage= function(msg, lineNum, sourceId) {
            var m = {m:msg,
                l:lineNum,
                s:sourceId}
            if (message2) {
                message2 = [ message2, m ]
            }
            else
                message2 = m
        }
    });

    it("should receive the message",function() {
        message = null;
        message2 = null;
        runs(function() {
            webpage.open(url+"consolemessage.html", function(success){});
        });
        waitsFor(function(){ return message != null;}, 1000);
        runs(function(){
            expect(message.m).toEqual('message from consolemessage');
            expect(message.l).toEqual(10); // phantomjs doesn't use lineNumber parameter, result is undefined
            expect(message.s).toEqual(url + "consolemessage.html"); // phantomjs doesn't use sourceId parameter, result is undefined
            expect(message.lev).toEqual('log');
            expect(message.f).toEqual('window.onload');
            expect(message2).toBeNull();
        })
    });

    it("should receive the message form an external js script",function() {
        message = null;
        message2 = null;
        runs(function() {
            webpage.open(url+"consolemessagejs.html", function(success){});
        });
        waitsFor(function(){ return message != null;}, 1000);
        runs(function(){
            expect(message.m).toEqual('message from consolemessagejs');
            expect(message.l).toEqual(2); // phantomjs doesn't use lineNumber parameter, result is undefined
            expect(message.s).toEqual(url+'consolemessage.js'); // phantomjs doesn't use sourceId parameter, result is undefined
            expect(message2).toBeNull();
        })
    });

    it("should receive the message of an iframe",function() {
        message = null;
        message2 = null;
        runs(function() {
            webpage2.open(url+"consolemessageiframe.html", function(success){});
        });
        waitsFor(function(){ return message2 != null;}, 1000);
        runs(function(){
            expect(message).toBeNull()
            expect(message2.length).toEqual(2);
            expect(message2[0].m).toEqual('message from consolemessage2');
            expect(message2[1].m).toEqual('message from consolemessageiframe');
        })
    });
    it("close webpage",function() {
        webpage.close();
        webpage2.close();
    });
});

