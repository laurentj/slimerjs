
describe("webpage.onConsoleMessage", function() {

    var webpage, webpage2;
    var message = [], message2 = [];

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
            message.push(m);
        }
    
        webpage2.onConsoleMessage= function(msg, lineNum, sourceId) {
            var m = {m:msg,
                l:lineNum,
                s:sourceId}
            message2.push(m);
        }
    });

    it("should receive the message",function() {
        message = [];
        message2 = [];
        runs(function() {
            webpage.open(url+"consolemessage.html", function(success){});
        });
        waitsFor(function(){ return message.length > 0;}, 1000);
        runs(function(){
            expect(message.length).toEqual(1);
            expect(message[0].m).toEqual('message from consolemessage');
            expect(message[0].l).toEqual(10); // phantomjs doesn't use lineNumber parameter, result is undefined
            expect(message[0].s).toEqual(url + "consolemessage.html"); // phantomjs doesn't use sourceId parameter, result is undefined
            expect(message[0].lev).toEqual('log');
            expect(message[0].f).toEqual('window.onload');
            expect(message2.length).toEqual(0);
        })
    });

    it("should receive the message form an external js script",function() {
        message = [];
        message2 = [];
        runs(function() {
            webpage.open(url+"consolemessagejs.html", function(success){});
        });
        waitsFor(function(){ return message.length > 0;}, 1000);
        runs(function(){
            expect(message[0].m).toEqual('message from consolemessagejs');
            expect(message[0].l).toEqual(2); // phantomjs doesn't use lineNumber parameter, result is undefined
            expect(message[0].s).toEqual(url+'consolemessage.js'); // phantomjs doesn't use sourceId parameter, result is undefined
            expect(message2.length).toEqual(0);
        })
    });

    it("should receive the message of an iframe",function() {
        message = [];
        message2 = [];
        runs(function() {
            webpage2.open(url+"consolemessageiframe.html", function(success){});
        });
        waitsFor(function(){ return message2.length > 0;}, 1000);
        runs(function(){
            expect(message.length).toEqual(0)
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

