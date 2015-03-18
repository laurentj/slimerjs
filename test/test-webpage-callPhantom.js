
describe("WebPage.onCallback", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/callback.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("is called when calling window.callPhantom",function() {
        var loaded = false;
        var receivedResults = null
        webpage.onCallback = function(data) {
            receivedResults = data;
            if (data == "doerror")
                throw new Error("oups");
            else if (data == "returnobject") {
                return {
                    foo:'bar'
                };
            }
            return "received";
        }

        runs(function() {
            webpage.open(url, function(success){
                expect(receivedResults).toEqual("Hello test");
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


            result = webpage.evaluate(function(){
                try {
                    return window.callPhantom("returnobject");
                }
                catch(e){
                    return "error in evaluate: "+e;
                }
            })
            expect(result.foo).toEqual("bar");

            // verify that we receive exception from onCallback
            result = webpage.evaluate(function(){
                try {
                    return window.callPhantom("doerror");
                }
                catch(e){
                    return "error in evaluate: "+e;
                }
            })
            expect(result).toEqual("error in evaluate: Error: oups");
            expect(receivedResults).toEqual("doerror");
            webpage.onCallback = null;
            webpage.close();
        });
    });
});

