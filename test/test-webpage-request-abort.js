describe("Test networkRequest.abort()", function() {

    var webpage;
    var url = "http://www.google.com/";
    var orderArr = [];
    var resDate = null;
    var resURL = "";

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

});

