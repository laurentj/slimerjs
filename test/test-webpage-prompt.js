
describe("WebPage.onAlert", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/alert.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("has no effect if it is empty",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var result = webpage.evaluate(function(){
                doAlert();
                return foo;
            })
            expect(result).toEqual("alert done");
        });
    });

    it("retrieve the message when there is an alert",function() {
        var message = "-1";
        webpage.onAlert = function (msg) {
            message = msg;
        }

        var result = webpage.evaluate(function(){
            doAlert();
            return foo;
        })
        expect(result).toEqual("alert done");
        expect(message).toEqual("alert message");
        webpage.close();
    });
});


describe("WebPage.onConfirm", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/alert.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("has no effect if it is empty",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var result = webpage.evaluate(function(){
                return doConfirm();
            })
            expect(result).toEqual("cancel");
        });
    });

    it("retrieve the message when a confirm dialog is asked",function() {
        var message = "-1";
        webpage.onConfirm = function (msg) {
            message = msg;
            if (msg == "question1")
                return false;
            return true;
        }

        var result = webpage.evaluate(function(){
            return doConfirm();
        })
        expect(result).toEqual("ok");
        expect(message).toEqual("do you confirm?");
        var result = webpage.evaluate(function(){
            return doConfirm("question1");
        })
        expect(result).toEqual("cancel");
        expect(message).toEqual("question1");
        webpage.close();
    });
});



describe("WebPage.onPrompt", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/alert.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("has no effect if it is empty",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var result = webpage.evaluate(function(){
                return doPrompt();
            })
            expect(result).toEqual("--cancel--");
        });
    });

    it("retrieve the message when a prompt is asked",function() {
        var message = "-1";
        webpage.onPrompt = function (msg, defaultVal) {
            message = msg;
            if (msg == "question1")
                return "response2";
            return "response1";
        }

        var result = webpage.evaluate(function(){
            return doPrompt();
        })
        expect(result).toEqual("response1");
        expect(message).toEqual("what is your name?");
        var result = webpage.evaluate(function(){
            return doPrompt("question1");
        })
        expect(result).toEqual("response2");
        expect(message).toEqual("question1");
    });
    it("returns empty value",function() {
        var message = "-1";
        webpage.onPrompt = function (msg, defaultVal) {
            message = msg;
            if (msg == "question1")
                return "";
            return null;
        }

        var result = webpage.evaluate(function(){
            return doPrompt();
        })
        expect(result).toEqual("--cancel--");
        expect(message).toEqual("what is your name?");
        var result = webpage.evaluate(function(){
            return doPrompt("question1");
        })
        expect(result).toEqual("");
        expect(message).toEqual("question1");
    });
    it("supports defaultValue",function() {
        var message = "-1";
        webpage.onPrompt = function (msg, defaultVal) {
            message = msg;
            return defaultVal;
        }

        var result = webpage.evaluate(function(){
            return doPrompt("question", "hello");
        })
        expect(result).toEqual("hello");
        expect(message).toEqual("question");
        webpage.close();
    });
});
