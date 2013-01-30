


describe("webpage with listeners", function() {

    var webpage = require("webpage").create();
    var trace = '';
    webpage.onLoadStarted = function(targetUrl) {
        trace +="=LOADSTARTED=";
    };
    
    
    webpage.onUrlChanged = function(targetUrl) {
        trace +="=URLCHANGED=";
    };
    
    webpage.onInitialized = function(targetUrl) {
        trace +="=INITIALIZED=";
    };
    
    
    webpage.onResourceRequested = function(request) {
        trace +="=RESREQUESTED:"+request.id+"=";
    };
    webpage.onResourceReceived = function(response) {
        trace +="=RESRECEIVED:"+response.id+"=";
        //console.log('\t--->onResourceReceived (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
    };
    
    webpage.onLoadFinished = function(targetUrl) {
        trace +="=LOADFINISHED=";
    };

    var async = new AsyncSpec(this);
    async.it("should be opened",function(done) {
        webpage.open('http://localhost:8083/hello.html', function(success){
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should generate the expected trace", function(done){
        expect(trace).toEqual("=LOADSTARTED==URLCHANGED==INITIALIZED==LOADFINISHED=");
        done();
    });    
});