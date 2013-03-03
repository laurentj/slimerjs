

describe("webpage with listeners", function() {

    var webpage = require("webpage").create();
    var trace = '';
    var receivedRequest = [];
    var initializedCounter = 0;
    webpage.onConsoleMessage= function(msg, lineNum, sourceId) {
        console.log(msg);
    }

    webpage.onLoadStarted = function() {
        var currentUrl = webpage.evaluate(function(c) {
            window.initializedCounter = c;
            return window.location.href;
        }, initializedCounter);
        trace +="LOADSTARTED:"+currentUrl+"\n";
    };

    webpage.onUrlChanged = function(targetUrl) {
        webpage.evaluate(function(c) {
            window.initializedCounter = c;
        }, initializedCounter);
        trace += "URLCHANGED:"+targetUrl+"\n";
    };
    
    webpage.onInitialized = function() {
        initializedCounter++;
        var wi = webpage.evaluate(function(c) {
            document.addEventListener('DOMContentLoaded', function() {
                window.initializedCounter = c;
            }, false);
            return (window.initializedCounter === undefined?-1:window.initializedCounter);
        }, initializedCounter);
        trace +="INITIALIZED "+wi+"\n";
    };

    webpage.onResourceRequested = function(request) {
        //console.log("--- webpage.onResourceRequested "+ request.id + " " + request.url);
        if (receivedRequest[request.id] == undefined ) {
            receivedRequest[request.id] = { req:null, start:null, end:null}
        }
        receivedRequest[request.id].req = request;
    };

    webpage.onResourceReceived = function(response) {
        //console.log("--- webpage.onResourceReceived "+ response.id + " " + response.url + " "+response.stage);
        if (receivedRequest[response.id] == undefined ) {
            receivedRequest[response.id] = { req:null, start:null, end:null}
        }
        receivedRequest[response.id][response.stage] = response;
    };
    
    webpage.onLoadFinished = function(status) {
        var currentUrl = webpage.evaluate(function() {
            return window.location.href + " - "+ window.initializedCounter;
        });
        trace += "LOADFINISHED:"+currentUrl+" "+status+"\n";
    };

    var domain = "http://localhost:8083/";

    var async = new AsyncSpec(this);
    async.it("should be opened",function(done) {
        webpage.open(domain + 'hello.html', function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should generate the expected trace", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/hello.html\n";
        expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/hello.html - 2 success\n";
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received hello.html", function(done){
        var r;
        r = receivedRequest.filter(function(result) {
            return result.req.url == (domain + 'hello.html');
        })[0];
        expect(r).toNotBe(null);
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
        expect(r.start.contentType).toEqual("text/html");
        expect(r.end.contentType).toEqual("text/html");
        done();
    });

    async.it("should have received slimerjs.png", function(done){
        var r;
        r = receivedRequest.filter(function(result) {
            return result.req.url == (domain + 'slimerjs.png');
        })[0];
        expect(r).toNotBe(null);
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
        expect(r.start.contentType).toEqual("image/png");
        expect(r.end.contentType).toEqual("image/png");
        done();
    });

    async.it("should have received helloframe.html", function(done){
        var r;
        r = receivedRequest.filter(function(result) {
            return result.req.url == (domain + 'helloframe.html');
        })[0];
        expect(r).toNotBe(null);
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
        expect(r.start.contentType).toEqual("text/html");
        expect(r.end.contentType).toEqual("text/html");
        done();
    });

    async.it("should have received hello.js", function(done){
        var r;
        r = receivedRequest.filter(function(result) {
            return result.req.url == (domain + 'hello.js');
        })[0];
        expect(r).toNotBe(null);
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
        expect(r.start.contentType).toEqual("text/javascript");
        expect(r.end.contentType).toEqual("text/javascript");
        done();
    });

    async.it("should have received helloframe.css", function(done){
        var r;
        r = receivedRequest.filter(function(result) {
            return result.req.url == (domain + 'helloframe.css');
        })[0];
        expect(r).toNotBe(null);
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
        expect(r.start.contentType).toEqual("text/css");
        expect(r.end.contentType).toEqual("text/css");
        done();
    });

    async.it("is opening a new page",function(done) {
        webpage.open(domain + 'mouseevent.html', function(success){
            trace += "CALLBACK2:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });
    async.it("should generate the expected trace for the new page", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/hello.html\n";
        expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/hello.html - 2 success\n";
        expectedTrace += "CALLBACK:success\n";
        expectedTrace += "LOADSTARTED:http://localhost:8083/hello.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/mouseevent.html\n";
        expectedTrace += "INITIALIZED 2\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/mouseevent.html - 3 success\n";
        expectedTrace += "CALLBACK2:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received mouseevent.html", function(done){
        var r;
        r = receivedRequest.filter(function(result) {
            return result.req.url == (domain + 'mouseevent.html');
        })[0];
        expect(r).toNotBe(null);
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
        expect(r.start.contentType).toEqual("text/html");
        expect(r.end.contentType).toEqual("text/html");
        done();
    });

});