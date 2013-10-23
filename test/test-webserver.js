

describe("Webserver", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/asynchronousResponse";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("handle asynchronous response",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(webpage.plainText).toEqual("done");
            webpage.close();
        });
    });
});