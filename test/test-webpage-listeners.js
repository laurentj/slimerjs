

describe("webpage with listeners", function() {

    var webpage = require("webpage").create();
    var trace = '';
    var receivedRequest = [];
    
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
        if (receivedRequest[request.id] == undefined ) {
            receivedRequest[request.id] = { req:null, start:null, end:null}
        }
        receivedRequest[request.id].req = request;
        //console.log("onResourceRequested "+ request.id + " " + request.url);
    };

    webpage.onResourceReceived = function(response) {
        if (receivedRequest[response.id] == undefined ) {
            receivedRequest[response.id] = { req:null, start:null, end:null}
        }
        receivedRequest[response.id][response.stage] = response;
        //console.log("onResourceReceived "+ response.id + " " + response.url + " "+response.stage);
    };
    
    webpage.onLoadFinished = function(status) {
        var currentUrl = webpage.evaluate(function() {
            return window.location.href;
        });
        trace += "LOADFINISHED:"+currentUrl+" "+status+"\n";
    };

    var async = new AsyncSpec(this);
    async.it("should be opened",function(done) {
        webpage.open('http://localhost:8083/hello.html', function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should generate the expected trace", function(done){
        //console.log(trace);
        var expectedTrace = ""
        expectedTrace += "INITIALIZED\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/hello.html\n";
        expectedTrace += "INITIALIZED\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/hello.html success\n";
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have a expected request objects", function(done){
        expect(receivedRequest.length).toEqual(6);
        for (var i=1; i < receivedRequest.length; i++) {
            var r= receivedRequest[i];
            expect(r.req.id).toEqual(i);
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toEqual(200);
            expect(r.start.statusText).toEqual('OK');
            expect(r.end.status).toEqual(200);
            expect(r.end.statusText).toEqual('OK');
        }
        done();
    });
});