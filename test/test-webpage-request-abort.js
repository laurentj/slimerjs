describe("Test networkRequest.abort()", function() {

    var webpage;
    var url = "http://www.google.com/";
    var orderArr = [];
    var resDate = null;
    var resURL = "", startURL = "startURL", endURL = "endURL", loadStatus = "";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
        
        webpage.onResourceRequested = function (request, networkRequest) {
            orderArr.push("onResourceRequested");
            networkRequest.abort();
        }
        webpage.onResourceError = function (response) {
            orderArr.push("onResourceError");
        }
        webpage.onResourceReceived = function (response) {
            orderArr.push("onResourceReceived");
            resDate = response.time;
            resURL = response.url;
        }
        webpage.onLoadStarted = function (url) {
            startURL = url;
        }
        webpage.onLoadFinished = function (status, url, isFrame) {
            endURL = url;
            loadStatus = status;
        }
    });

    it("should the order of callbacks be onResourceRequested, onResourceError, onResourceReceived",function() {
        runs(function() {
            webpage.open(url, function(success){
                expect(orderArr.join(" ")).toEqual("onResourceRequested onResourceError onResourceReceived");
            });
        });
    });

    it("should the response has time",function() {
        runs(function() {
            webpage.open(url, function(success){
                expect(resDate !== null && {}.toString.call(resDate) === "[object Date]").toBe(true);
            });
        });
    });
    
    it("should the response has url",function() {
        runs(function() {
            webpage.open(url, function(success){
                expect(resURL).toEqual(url);
            });
        });
    });

    it("should onLoadStarted and onLoadFinished be called",function() {
        runs(function() {
            webpage.open(url, function(success){
                expect(startURL).toEqual(endURL);
            });
        });
    });
    
    it("should status is fail",function() {
        runs(function() {
            webpage.open(url, function(success){
                expect(loadStatus).toEqual("fail");
            });
        });
    });
});

describe("Test networkRequest.abort() for subsequent requests", function() {

    var webpage;
    var url = "http://www.google.com/";
    var loadStart = 0, loadFinish = 0, aborted = false;

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
        
        webpage.onResourceRequested = function (request, networkRequest) {
            if (/\.(?:png|css|js)/.test(request.url)) {
                aborted = true;
                networkRequest.abort();
            }
        }
        webpage.onLoadStarted = function (url) {
            loadStart++;
        }
        webpage.onLoadFinished = function (status, url, isFrame) {
            loadFinish++;
        }        
    });
    
    it("should onLoadFinished called when subsequent request is aborted",function() {
        runs(function() {
            webpage.open(url, function(success){
                expect(loadStart).toEqual(1);
                expect(loadFinish).toEqual(1);
                expect(aborted).toBe(true);
            });
        });
    });
});

