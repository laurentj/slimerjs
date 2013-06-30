
describe("WebPage.uploadFile", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/filepicker.html";
    var fileSetted = '';
    var filePickerCalled = false;

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
        webpage.onFilePicker = function(oldFile) {
            filePickerCalled = true;
        }
    });

    it("set files to upload",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                webpage.uploadFile('input[name="toupload"]', phantom.libraryPath+'/test-webpage.js');
                setTimeout(function(){
                    loaded = true;
                }, 100);
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(filePickerCalled).toBeTruthy();
        });
    });
});

