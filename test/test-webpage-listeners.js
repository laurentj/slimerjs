
var webserverTestWebPageListener = webServerFactory.create();
webserverTestWebPageListener.listen(8083, function(request, response) {
    response.statusCode = 200;
    response.write('<html><head><title>hello world</title></head><body>Hello!</body></html>');
    response.close();
});

describe("webpage with listeners", function() {

    var webpage = require("webpage").create();
    var trace = '';
    var requestMetadataObject = null;
    var receivedResponses = [];
    
    webpage.onLoadStarted = function() {
        var currentUrl = webpage.evaluate(function() {
            return window.location.href;
        });
        trace +="LOADSTARTED:"+currentUrl+"\n";
    };

    webpage.onUrlChanged = function(targetUrl) {
        trace += "URLCHANGED:"+targetUrl+"\n";
    };
    
    webpage.onInitialized = function() {
        trace +="INITIALIZED\n";
    };

    webpage.onResourceRequested = function(request) {
        requestMetadataObject = request;
        trace +="RESREQUESTED:"+request.id+" - "+request.url+"\n";
    };

    webpage.onResourceReceived = function(response) {
        receivedResponses.push(response);
        trace +="RESRECEIVED:"+response.id+" - "+response.stage+"\n";
    };
    
    webpage.onLoadFinished = function(status) {
        trace += "LOADFINISHED:"+status+"\n";
    };

    var async = new AsyncSpec(this);
    async.it("should be opened",function(done) {
        webpage.open('http://localhost:8083/hello.html', function(success){
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should generate the expected trace", function(done){
        console.log(trace);
        
        var expectedTrace = "RESREQUESTED:1 - http://localhost:8083/hello.html\n"
        expectedTrace += "INITIALIZED\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        expectedTrace += "RESRECEIVED:1 - start\n";
        expectedTrace += "RESRECEIVED:1 - end\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/hello.html\n";
        expectedTrace += "INITIALIZED\n";
        expectedTrace += "LOADFINISHED:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have a request object", function(done){
        expect(requestMetadataObject.id).toEqual(1);
        expect(requestMetadataObject.method).toEqual('GET');
        expect(requestMetadataObject.url).toEqual('http://localhost:8083/hello.html');
        expect(requestMetadataObject.time instanceof Date).toBeTruthy();
        done();
    });

    async.it("should have response objects", function(done){
        expect(receivedResponses.length).toEqual(2);
        var resp = receivedResponses[0];
        expect(resp.id).toEqual(1);
        expect(resp.url).toEqual('http://localhost:8083/hello.html');
        expect(resp.time instanceof Date).toBeTruthy();
        expect(resp.bodySize).toEqual(71);
        expect(resp.contentType).toEqual(null);
        expect(resp.redirectURL).toEqual(null);
        expect(resp.stage).toEqual('start');
        expect(resp.status).toEqual(200);
        expect(resp.statusText).toEqual('OK');

        resp = receivedResponses[1];
        expect(resp.id).toEqual(1);
        expect(resp.url).toEqual('http://localhost:8083/hello.html');
        expect(resp.time instanceof Date).toBeTruthy();
        expect(resp.contentType).toEqual(null);
        expect(resp.redirectURL).toEqual(null);
        expect(resp.stage).toEqual('end');
        expect(resp.status).toEqual(200);
        expect(resp.statusText).toEqual('OK');

        done();
    });

});