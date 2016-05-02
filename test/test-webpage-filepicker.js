
describe("WebPage.uploadFile", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/filepicker.html";
    var fileSetted = '';
    var filePickerCalled = [];

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
        webpage.onFilePicker = function(oldFile) {
            filePickerCalled.push(oldFile);
        }
    });

    it("set a file to upload",function() {
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
            expect(filePickerCalled.length).toEqual(1);
            var l = webpage.evaluate(function(){
                return document.querySelector('input[name="toupload"]').files.length;
            });
            expect(l).toEqual(1);
            webpage.close();
        });
    });

    it("set list of files to upload",function() {
        var loaded = false;
        runs(function() {
            filePickerCalled = [];
            webpage.open(url, function(success){
                var files = [
                             phantom.libraryPath+'/test-webpage.js',
                             phantom.libraryPath+'/test-webserver.js'
                            ]
                webpage.uploadFile('input[name="toupload2"]', files);
                setTimeout(function(){
                    loaded = true;
                }, 200);
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(filePickerCalled.length).toEqual(1);
            var l = webpage.evaluate(function(){
                var input = document.querySelector('input[name="toupload2"]');
                return input.files.length + ' - '+ input.files[0].name + ' - '+ input.files[1].name ;
            });
            expect(l).toEqual('2 - test-webpage.js - test-webserver.js');
            webpage.close();
        });
    });
});

