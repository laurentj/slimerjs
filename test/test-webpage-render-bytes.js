
describe("WebPage.renderBytes()", function(){
    var webpage;
    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });
    
    it("renderBytes 1", function() {
        var loaded = false;
        runs(function() {
            webpage.open("https://slimerjs.org/", function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 60000);
        runs(function() {
            // Clipping - to avoid failure on extremely large page.
            webpage.clipRect = { top:0, left: 0, width:1200, height:1200 };
            var b = webpage.renderBytes({ "format":"jpg"} );
            webpage.close();
            // Check bytes length is plausible.
            expect(b.length).toBeGreaterThan(100);
            // Check JFIF signature
            expect(b).toContain("JFIF");
            return true;
        })
    });
    
});
