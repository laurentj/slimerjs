
describe("WebPage.onCallback", function(){
    var webpage = require("webpage").create();
    var url = "http://127.0.0.1:8083/simplehello.html";

    it("is called when calling window.callPhantom",function() {
        var loaded = false;
        var receivedResults = null
        webpage.onCallback = function(data) {
            receivedResults = data;
            if (data == "doerror")
                throw new Error("oups");
            return "received";
        }

        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);

        runs(function(){
            var result = webpage.evaluate(function(){
                try {
                 return window.callPhantom({ hello: 'world' });
                }
                catch(e){
                    return "error in evaluate: "+e;
                }
            })
            expect(result).toEqual("received");
            expect(receivedResults.hello).toEqual("world");

            // verirfy that we receive exception from onCallback
            var result = webpage.evaluate(function(){
                try {
                 return window.callPhantom("doerror");
                }
                catch(e){
                    return "error in evaluate: "+e;
                }
            })
            expect(result).toEqual("error in evaluate: Error: oups");
            expect(receivedResults).toEqual("doerror");
        });
    });
});

