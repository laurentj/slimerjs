
describe("WebPage.render() segmentation faults", function(){
    var webpage;
    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });
    
    it("Segfault www.tamasoft.co.jp/en/general-info/unicode.html", function() {
        var loaded = false;
        runs(function() {
            webpage.open("http://www.tamasoft.co.jp/en/general-info/unicode.html", function(success){
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
    
    it("Segfault sportal.bg", function() {
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
