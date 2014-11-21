
describe("WebPage.render() segmentation faults", function(){
    var webpage;
    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });
    
    it("should not error with very big page", function() {
        var loaded = false;
        runs(function() {
            webpage.open("http://127.0.0.1:8083/bigpage.html", function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 10000);
        runs(function() {
            webpage.renderBase64("jpg");
            webpage.close();
            return true;
        })
    });
    
    it("should not segfault", function() {
        var loaded = false;
        runs(function() {
            webpage.open("http://sportal.bg", function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 60000);
        runs(function() {
            webpage.renderBase64("jpg");
            webpage.close();
            return true;
        })
    });
});
