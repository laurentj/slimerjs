
describe("WebPage.onLongRunningScript", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/longrunningscript.html";
    var confirm = false;
    var argsLen = 0;

    beforeEach(function() {
        var loaded = false;
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
        
        webpage.onConfirm = function(text) {
            confirm = true;
        }        
        
        webpage.onLongRunningScript = function(message) {
            argsLen = arguments.length;
            webpage.stopJavaScript();
        }
        webpage.open(url, function () {
            loaded = true;
        });
        waitsFor(function(){ return loaded;}, 10000);
    });


    it("should be stopped using page.stopJavaScript()", function() {
        return true;
    })
    
    it("page.onConfirm should not be called", function () {
        runs(function () {
            expect(confirm).toBe(false);
        });
    });
    
    it("page.onLongRunningScript arguments length should be 1", function () {
        runs(function () {
            expect(argsLen).toEqual(1);
        });
    });
    
    it("should not be stopped when omitting page.stopJavaScript() or page.stopJavaScript() is called outside of callback", function () {
        var loaded = false;
        var count = 0;
        webpage.onLongRunningScript = function(message) {
            if (count) {
                webpage.stopJavaScript();
            }
            count++;
        }
        webpage.stopJavaScript();
        webpage.open(url, function () {
            loaded = true;
        });
        waitsFor(function(){ return loaded;}, 21000);
        runs(function () {
            expect(count).toEqual(2);
        })        
    });
});
