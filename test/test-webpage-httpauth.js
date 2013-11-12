
describe("WebPage.onAuthPrompt", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/needauth";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
        webpage.settings.maxAuthAttempts = 3;
        slimer.clearHttpAuth();
    });

    it("is called when basic auth is required and refuse auth",function() {
        var loaded = false;
        var attempt = null;
        var openResult = '';

        webpage.onAuthPrompt = function (type, url, realm, credentials) {
            attempt = [type, url, realm];
            return false;
        }

        // load the page
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
                openResult = success;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(webpage.plainText).toEqual('auth is needed');
            expect(attempt).toNotEqual(null);
            expect(attempt[0]).toEqual('http');
            expect(attempt[1]).toEqual(url);
            expect(attempt[2]).toEqual('Slimer auth test');
            expect(openResult).toEqual('success');
        });
    });

    it("is called when basic auth is required and accept",function() {
        var loaded = false;
        var counter = 0;
        var failedAttempt = null; // bad credential at the first call
        var succeedAttempt = null; // return good credentials
        var openResult = '';

        webpage.onAuthPrompt = function (type, url, realm, credentials) {
            var data = [type, url, realm];
            if (counter == 0) {
                failedAttempt = data;
                credentials.username = "abcd"; // bad credentials
                credentials.password = "efgh";
                counter ++;
                return true;
            }
            else {
                succeedAttempt = data;
                credentials.username = "laurent"; // good credentials
                credentials.password = "1234";
                return true;
            }
        }

        // load the page
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
                openResult = success;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(webpage.plainText).toEqual('authentication is ok');
            expect(failedAttempt).toNotEqual(null);
            expect(succeedAttempt).toNotEqual(null);
            expect(failedAttempt[0]).toEqual('http');
            expect(failedAttempt[1]).toEqual(url);
            expect(failedAttempt[2]).toEqual('Slimer auth test');
            expect(succeedAttempt[0]).toEqual('http');
            expect(succeedAttempt[1]).toEqual(url);
            expect(succeedAttempt[2]).toEqual('Slimer auth test');
            expect(openResult).toEqual('success');
            webpage.close();
        });
    });
});

describe("WebPage auth settings", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/needauth";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
        webpage.settings.maxAuthAttempts = 2;
        slimer.clearHttpAuth();
    });

    it("are used when auth is needed even they are bad",function() {
        var loaded = false;
        var openResult = '';

        webpage.settings.userName = "abcd";
        webpage.settings.password = "abcd";

        // load the page 
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
                openResult = success;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(webpage.plainText).toEqual('auth is needed');
            expect(openResult).toEqual('success');
        });
    });

    it("are used when auth is needed",function() {
        var loaded = false;
        var openResult = '';

        webpage.settings.userName = "laurent";
        webpage.settings.password = "1234";

        // load the page 
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
                openResult = success;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            expect(webpage.plainText).toEqual('authentication is ok');
            expect(openResult).toEqual('success');
            webpage.close();
        });
    });
});
 