
var URLUtils = require("sdk/url");

describe("webpage with listeners", function() {
    var webpage;
    var trace = '';
    var receivedRequest = [];
    var initializedCounter = 0;
    
    function testWebpageListenerCreateWebPage() {
        if (webpage)
            webpage.close();
        webpage = require("webpage").create();

        webpage.onConsoleMessage= function(msg, lineNum, sourceId) {
            console.log(msg);
        }

        webpage.onLoadStarted = function(url) {
            var currentUrl = webpage.evaluate(function(c) {
                window.initializedCounter = c;
                return window.location.href;
            }, initializedCounter);
            trace +="LOADSTARTED:"+currentUrl+"\n";
            if (url){
                trace +="  loading url="+url+"\n";
            }
            //console.log("LOADSTARTED:"+currentUrl)
        };

        webpage.onUrlChanged = function(targetUrl) {
            webpage.evaluate(function(c) {
                window.initializedCounter = c;
            }, initializedCounter);
            trace += "URLCHANGED:"+targetUrl+"\n";
            //console.log("URLCHANGED:"+targetUrl)
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
            //console.log("INITIALIZED "+wi)
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

        webpage.onLoadFinished = function(status, url) {
            var currentUrl = webpage.evaluate(function() {
                return window.location.href + " - "+ window.initializedCounter;
            });
            trace += "LOADFINISHED:"+currentUrl+" "+status+"\n";
            if (url){
                trace +="  loaded url="+url+"\n";
            }
            //console.log("LOADFINISHED:"+currentUrl);
        };
    }

    var domain = "http://localhost:8083/";
    var file = URLUtils.fromFilename(phantom.libraryPath) + '/www/simplehello.html';

    var async = new AsyncSpec(this);

    async.it("should be opened with a simple file",function(done) {
        testWebpageListenerCreateWebPage()
        webpage.open(file, function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should generate the expected trace for a simple file", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        expectedTrace += "  loading url="+file+"\n";
        expectedTrace += "URLCHANGED:"+file+"\n";
        expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "LOADFINISHED:"+file+" - 2 success\n";
        expectedTrace += "  loaded url="+file+"\n";
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        trace = "";
        done();
    });

    async.it("should have received file://..../simplehello.html", function(done){
        var r;
        r = receivedRequest.filter(function(result, i) {
            if (i == 0)
                return false;
            return result.req.url == file;
        })[0];
        expect(r).toNotBe(null);
        expect(r.req).toNotBe(null);
        expect(r.start).toNotBe(null);
        expect(r.end).toNotBe(null);
        expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
        expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
        expect(r.req.method).toEqual("GET");
        expect(r.start.status).toBe(null);
        expect(r.start.statusText).toBe(null);
        expect(r.end.status).toBe(null);
        expect(r.end.statusText).toBe(null);
        expect(r.start.contentType).toBe(null);
        expect(r.end.contentType).toBe(null);
        done();
    });


    async.it("should be opened",function(done) {
        trace = '';
        receivedRequest = [];
        initializedCounter = 0;

        testWebpageListenerCreateWebPage()
        webpage.open(domain + 'hello.html', function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            setTimeout(function(){ // wait after the XHR
                done();
            }, 500)
            //done();
        });
    });

    async.it("should generate the expected trace", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        expectedTrace += "  loading url=http://localhost:8083/hello.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/hello.html\n";
        expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/hello.html - 2 success\n";
        expectedTrace += "  loaded url=http://localhost:8083/hello.html\n";
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received hello.html", function(done){
        var r;
        r = receivedRequest.filter(function(result, i) {
            if (i == 0)
                return false;
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
        r = receivedRequest.filter(function(result, i) {
            if (i == 0)
                return false;
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
        r = receivedRequest.filter(function(result, i) {
            if (i == 0)
                return false;
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
        r = receivedRequest.filter(function(result, i) {
            if (i == 0)
                return false;
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

    async.it("should receive event when a frame is changed", function(done){
        var currentTrace = trace;
        var currentReceivedRequest = receivedRequest;
        var currentInitializedCounter = initializedCounter;

        trace = '';
        receivedRequest = [];
        initializedCounter = 0;

        webpage.evaluate(function(){
            document.getElementsByTagName( "iframe" )[ 0 ].contentWindow.location.href="simplehello.html"
            document.getElementsByTagName( "img" )[ 0 ].src="glouton-home.png"
        })
        setTimeout(function() {
            var expectedTrace = "LOADSTARTED:http://localhost:8083/hello.html\n";
            expectedTrace += "  loading url=http://localhost:8083/simplehello.html\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/hello.html - 0 success\n";
            expectedTrace += "  loaded url=http://localhost:8083/simplehello.html\n";
            expect(trace).toEqual(expectedTrace);
            expect(receivedRequest.length).toEqual(9);
            var r;
            r = receivedRequest.filter(function(result, i) {
                if (i == 0)
                    return false;
                return result.req.url == (domain + 'simplehello.html');
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
            trace = currentTrace;
            receivedRequest = currentReceivedRequest;
            initializedCounter = currentInitializedCounter;
            done();
        },200);
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
        expectedTrace += "  loading url=http://localhost:8083/hello.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/hello.html\n";
        expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/hello.html - 2 success\n";
        expectedTrace += "  loaded url=http://localhost:8083/hello.html\n";
        expectedTrace += "CALLBACK:success\n";
        expectedTrace += "LOADSTARTED:http://localhost:8083/hello.html\n";
        expectedTrace += "  loading url=http://localhost:8083/mouseevent.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/mouseevent.html\n";
        expectedTrace += "INITIALIZED 2\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/mouseevent.html - 3 success\n";
        expectedTrace += "  loaded url=http://localhost:8083/mouseevent.html\n";
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

    async.it("is opening an inexistant page",function(done) {
        trace = "";
        receivedRequest = [];
        webpage.open(domain+'plop.html', function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });
    async.it("should generate the expected trace for an inexistant page", function(done){
        var expectedTrace = ""
        expectedTrace += "LOADSTARTED:http://localhost:8083/mouseevent.html\n";
        expectedTrace += "  loading url=http://localhost:8083/plop.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/plop.html\n";
        expectedTrace += "INITIALIZED 3\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/plop.html - 4 success\n";
        expectedTrace += "  loaded url=http://localhost:8083/plop.html\n";
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received a 404 page", function(done){
        var r;
        expect(receivedRequest.length).toEqual(2);
        r = receivedRequest.filter(function(result, i) {
            if (i == 0)
                return false;
            return result.req.url == (domain + 'plop.html');
        })[0];
        expect(r).toNotBe(null);
        expect(r.req).toNotBe(null);
        expect(r.start).toNotBe(null);
        expect(r.end).toNotBe(null);
        expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
        expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
        expect(r.req.method).toEqual("GET");
        expect(r.start.status).toEqual(404);
        expect(r.start.statusText).toEqual('Not Found');
        expect(r.end.status).toEqual(404);
        expect(r.end.statusText).toEqual('Not Found');
        expect(r.start.contentType).toEqual("text/html");
        expect(r.end.contentType).toEqual("text/html");
        done();
    });

    async.it("is opening a new page from an inexistant domain name",function(done) {
        trace = "";
        receivedRequest = [];
        webpage.open('http://qsdqsdqs.qsfdsfi/plop.html', function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("fail");
            done();
        });
    });
    async.it("should generate the expected trace for the error page", function(done){
        var expectedTrace = ""
        expectedTrace += "LOADSTARTED:http://localhost:8083/plop.html\n";
        expectedTrace += "  loading url=http://qsdqsdqs.qsfdsfi/plop.html\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/plop.html - 4 fail\n";
        expectedTrace += "  loaded url=http://qsdqsdqs.qsfdsfi/plop.html\n";
        expectedTrace += "CALLBACK:fail\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received an error page", function(done){
        var r;
        expect(receivedRequest.length).toEqual(2);
        r = receivedRequest.filter(function(result, i) {
            if (i == 0)
                return false;
            return result.req.url == "http://qsdqsdqs.qsfdsfi/plop.html";
        })[0];

        expect(r).toNotBe(null);
        expect(r.req).toNotBe(null);
        expect(r.start).toBeNull();
        expect(r.end).toNotBe(null);
        expect(r.end.contentType).toBeNull()
        expect(r.end.redirectURL).toBeNull()
        expect(r.end.status).toBeNull()
        expect(r.end.statusText).toBeNull()
        expect(r.end.url).toEqual('http://qsdqsdqs.qsfdsfi/plop.html');
        expect(r.req.method).toEqual("GET");

        done();
    });

    async.it("is opening a new page after a redirection",function(done) {
        trace = "";
        receivedRequest = [];
        testWebpageListenerCreateWebPage()
        webpage.open(domain+'redirectToSimpleHello', function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });
    async.it("should generate the expected trace for the redirection", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        expectedTrace += "  loading url=http://localhost:8083/redirectToSimpleHello\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/simplehello.html\n";
        expectedTrace += "INITIALIZED 5\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/simplehello.html - 6 success\n";
        expectedTrace += "  loaded url=http://localhost:8083/simplehello.html\n";
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received the simple hello page", function(done){
        var r;
        expect(receivedRequest.length).toEqual(3);
        r = receivedRequest.filter(function(result) {
            return result.req.url == domain+"redirectToSimpleHello";
        })[0];
        expect(r).toNotBe(null);
        
        r = receivedRequest.filter(function(result) {
            return result.req.url == domain+"simplehello.html";
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

    async.it("test end", function(done){
        webpage.close();
        done();
    });
});