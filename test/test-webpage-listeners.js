var URLUtils = null;
if ("slimer" in this) {
    URLUtils = require("sdk/url");
}


describe("webpage with listeners", function() {
    var webpage;
    var trace = '';
    var receivedRequest = [];
    var initializedCounter = 0;
    var cancelNextRequest = false;
    var changeUrlNextRequest = null;

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

        webpage.onResourceRequested = function(request, ctrl) {
            //console.log("--- webpage.onResourceRequested "+ request.id + " " + request.url);
            if (receivedRequest[request.id] == undefined ) {
                receivedRequest[request.id] = { req:null, start:null, end:null, err:null}
            }
            receivedRequest[request.id].req = request;
            if (cancelNextRequest) {
                cancelNextRequest = false;
                ctrl.abort();
            }
            else if (changeUrlNextRequest) {
                var newUrl = changeUrlNextRequest
                changeUrlNextRequest = null;
                ctrl.changeUrl(newUrl);
            }
        };

        webpage.onResourceReceived = function(response) {
            //console.log("--- webpage.onResourceReceived "+ response.id + " " + response.url + " "+response.stage);
            if (receivedRequest[response.id] == undefined ) {
                receivedRequest[response.id] = { req:null, start:null, end:null, err:null}
            }
            receivedRequest[response.id][response.stage] = response;
        };

        webpage.onResourceError = function(response) {
            //console.log("--- webpage.onResourceError "+ response.id + " " + response.url);
            if (receivedRequest[response.id] == undefined ) {
                receivedRequest[response.id] = { req:null, start:null, end:null, err:null}
            }
            receivedRequest[response.id].err = response;
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
    var file;
    if (URLUtils)
        file = URLUtils.fromFilename(phantom.libraryPath) + '/www/simplehello.html';
    else
        file = 'file://'+phantom.libraryPath + '/www/simplehello.html'; // for test with phantomjs

    function searchRequest(url, tests, min) {
        min = min || 0
        var listR = receivedRequest.filter(function(result, i) {
            if (i < min || result == undefined || result == null || !('req' in result)) {
                return false;
            }
            return (result.req.url == url);
        });
        expect(!(!listR || listR.length == 0)).toBeTruthy("request not found (for "+url+")");
        if ((!listR) || listR.length == 0) {
            return null;
        }
        var r = listR[0]
        expect(r).toNotBe(null);
        if (!r) {
            expect(false).toBeTruthy(" request is null...");
            return null;
        }

        if (tests == undefined) {
            return r;
        }
        var ok = null;
        try {
            tests(r);
            ok = true;
        } catch(e) {
            console.log("searchRequest tests error: "+e)
        }
        expect(ok).toBeTruthy("all tests have not been executed");
        return ok;
    }

    function searchMissedRequest(url, min) {
        min = min || 0
        var listR = receivedRequest.filter(function(result, i) {
            if (i < min || result == undefined || result == null || !('req' in result)) {
                return false;
            }
            return (result.req.url == url);
        });
        expect(!listR || listR.length == 0).toBeTruthy("request has been found (for "+url+")");
    }

    function searchHeaderInResource(res, headerName){
        var h = null;
        res.headers.some(function(header){
            if (header.name === headerName) {
                h = header.value;
                return true;
            }
            return false;
        });
        return h;
    }
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
        if (URLUtils) expectedTrace += "  loading url="+file+"\n";
        expectedTrace += "URLCHANGED:"+file+"\n";
        expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "LOADFINISHED:"+file+" - 2 success\n";
        if (URLUtils) expectedTrace += "  loaded url="+file+"\n";
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        trace = "";
        done();
    });

    async.it("should have received file://..../simplehello.html", function(done){
        searchRequest(file, function(r){
            expect(r.req).toNotBe(null, "bbqsqsdqsdb");
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toBe(null);
            expect(r.start.statusText).toBe(null);
            expect(r.end.status).toBe(null);
            expect(r.end.statusText).toBe(null);
            expect(r.start.contentType).toBe(null);
            expect(r.end.contentType).toBe(null);
        });
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
        if (URLUtils) expectedTrace += "  loading url=http://localhost:8083/hello.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/hello.html\n";
        expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/hello.html - 2 success\n";
        if (URLUtils) expectedTrace += "  loaded url=http://localhost:8083/hello.html\n";
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received hello.html", function(done){
        searchRequest(domain + 'hello.html', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toEqual(200);
            expect(r.start.statusText).toEqual('OK');
            expect(r.end.status).toEqual(200);
            expect(r.end.statusText).toEqual('OK');
            expect(r.start.contentType).toEqual("text/html");
            expect(r.end.contentType).toEqual("text/html");
        });
        done();
    });

    async.it("should have received slimerjs.png", function(done){
        searchRequest(domain + 'slimerjs.png', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toEqual(200);
            expect(r.start.statusText).toEqual('OK');
            expect(r.end.status).toEqual(200);
            expect(r.end.statusText).toEqual('OK');
            expect(r.start.contentType).toEqual("image/png");
            expect(r.end.contentType).toEqual("image/png");
        });
        done();
    });

    async.it("should have received helloframe.html", function(done){
        searchRequest(domain + 'helloframe.html', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toEqual(200);
            expect(r.start.statusText).toEqual('OK');
            expect(r.end.status).toEqual(200);
            expect(r.end.statusText).toEqual('OK');
            expect(r.start.contentType).toEqual("text/html");
            expect(r.end.contentType).toEqual("text/html");
        });
        done();
    });

    async.it("should have received hello.js", function(done){
        searchRequest(domain + 'hello.js', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toEqual(200);
            expect(r.start.statusText).toEqual('OK');
            expect(r.end.status).toEqual(200);
            expect(r.end.statusText).toEqual('OK');
            expect(r.start.contentType).toEqual("text/javascript");
            expect(r.end.contentType).toEqual("text/javascript");
        });
        done();
    });

    async.it("should have received helloframe.css", function(done){
        searchRequest(domain + 'helloframe.css', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toEqual(200);
            expect(r.start.statusText).toEqual('OK');
            expect(r.end.status).toEqual(200);
            expect(r.end.statusText).toEqual('OK');
            expect(r.start.contentType).toEqual("text/css");
            expect(r.end.contentType).toEqual("text/css");
        });
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
            if (URLUtils) expectedTrace += "  loading url=http://localhost:8083/simplehello.html\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/hello.html - 0 success\n";
            if (URLUtils) expectedTrace += "  loaded url=http://localhost:8083/simplehello.html\n";
            expect(trace).toEqual(expectedTrace);
            expect(receivedRequest.length).toEqual(9);
            searchRequest(domain + 'simplehello.html', function(r){
                expect(r.req).toNotBe(null);
                expect(r.start).toNotBe(null);
                expect(r.end).toNotBe(null);
                expect(r.err).toBeNull();
                expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
                expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
                expect(r.req.method).toEqual("GET");
                expect(r.start.status).toEqual(200);
                expect(r.start.statusText).toEqual('OK');
                expect(r.end.status).toEqual(200);
                expect(r.end.statusText).toEqual('OK');
                expect(r.start.contentType).toEqual("text/html");
                expect(r.end.contentType).toEqual("text/html");
            });
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
        if (URLUtils) expectedTrace += "  loading url=http://localhost:8083/hello.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/hello.html\n";
        expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/hello.html - 2 success\n";
        if (URLUtils) expectedTrace += "  loaded url=http://localhost:8083/hello.html\n";
        expectedTrace += "CALLBACK:success\n";
        expectedTrace += "LOADSTARTED:http://localhost:8083/hello.html\n";
        if (URLUtils) expectedTrace += "  loading url=http://localhost:8083/mouseevent.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/mouseevent.html\n";
        expectedTrace += "INITIALIZED 2\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/mouseevent.html - 3 success\n";
        if (URLUtils) expectedTrace += "  loaded url=http://localhost:8083/mouseevent.html\n";
        expectedTrace += "CALLBACK2:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received mouseevent.html", function(done){
        searchRequest(domain + 'mouseevent.html', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toEqual(200);
            expect(r.start.statusText).toEqual('OK');
            expect(r.end.status).toEqual(200);
            expect(r.end.statusText).toEqual('OK');
            expect(r.start.contentType).toEqual("text/html");
            expect(r.end.contentType).toEqual("text/html");
        });
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
        if (URLUtils) expectedTrace += "  loading url=http://localhost:8083/plop.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/plop.html\n";
        expectedTrace += "INITIALIZED 3\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/plop.html - 4 success\n";
        if (URLUtils) expectedTrace += "  loaded url=http://localhost:8083/plop.html\n";
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received a 404 page", function(done){
        expect(receivedRequest.length).toEqual(2);
        searchRequest(domain + 'plop.html', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toNotBe(null);
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toEqual(404);
            expect(r.start.statusText).toEqual('Not Found');
            expect(r.end.status).toEqual(404);
            expect(r.end.statusText).toEqual('Not Found');
            expect(r.start.contentType).toEqual("text/html");
            expect(r.end.contentType).toEqual("text/html");
            expect(r.err.url).toEqual(r.req.url);
            expect(r.err.errorCode).toEqual(203);
            expect(r.err.errorString).toNotEqual('');
        });
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
        if (URLUtils) expectedTrace += "  loading url=http://qsdqsdqs.qsfdsfi/plop.html\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/plop.html - 4 fail\n";
        if (URLUtils) expectedTrace += "  loaded url=http://qsdqsdqs.qsfdsfi/plop.html\n";
        expectedTrace += "CALLBACK:fail\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received an error page", function(done){
        expect(receivedRequest.length).toEqual(2);
        searchRequest("http://qsdqsdqs.qsfdsfi/plop.html", function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toBeNull();
            expect(r.end).toNotBe(null);
            expect(r.err).toNotBe(null);
            expect(r.end.contentType).toBeNull()
            expect(r.end.redirectURL).toBeNull()
            expect(r.end.status).toBeNull()
            expect(r.end.statusText).toBeNull()
            expect(r.end.url).toEqual('http://qsdqsdqs.qsfdsfi/plop.html');
            expect(r.req.method).toEqual("GET");
            expect(r.err.url).toEqual(r.req.url);
            expect(r.err.errorCode).toEqual(3);
            expect(r.err.errorString).toNotEqual('');
        });
        done();
    });

    async.it("is opening a new page after a redirection to an absolute url",function(done) {
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
        if (URLUtils) { 
            expectedTrace += "  loading url=http://localhost:8083/redirectToSimpleHello\n";
            expectedTrace += "URLCHANGED:http://localhost:8083/simplehello.html\n";
            expectedTrace += "INITIALIZED 5\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/simplehello.html - 6 success\n";
            expectedTrace += "  loaded url=http://localhost:8083/simplehello.html\n";
        }
        else {// phantomjs does not follow redirection
            expectedTrace += "URLCHANGED:http://localhost:8083/redirectToSimpleHello\n";
            expectedTrace += "INITIALIZED 5\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/redirectToSimpleHello - 6 success\n";
        }
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received the response for redirection", function(done){
        searchRequest(domain+"redirectToSimpleHello", function(r){
            expect(r.req).toNotBe(null, "req is null");
            expect(r.req.url ).toEqual(domain+"redirectToSimpleHello");
            expect(r.req.method).toEqual("GET");
            if (URLUtils) { // phantomjs does not generate "start" receivedResource during redirection
                expect(r.start).toNotBe(null, "start is null");
                expect(r.start.id).toEqual( r.req.id);
                expect(r.start.url).toEqual(r.end.url);
                expect(r.start.status).toEqual(301);
                expect(r.start.statusText).toEqual('Moved Permanently');
                expect(r.start.contentType).toBeNull("start content type");
                expect(r.start.redirectURL).toEqual("http://localhost:8083/simplehello.html");
                expect(searchHeaderInResource(r.start, 'foo')).toEqual('bar');
            }
            else
                expect(r.start).toBeNull();
            expect(r.end).toNotBe(null, "end is null");
            expect(r.end.id).toEqual(r.req.id);
            expect(r.end.url).toEqual(domain+"redirectToSimpleHello");
            expect(r.end.status).toEqual(301, "end.status");
            expect(r.end.statusText).toEqual('Moved Permanently', "end.statusText");
            expect(r.end.contentType).toBeNull("end content type");
            expect(r.end.redirectURL).toEqual("http://localhost:8083/simplehello.html");
            expect(searchHeaderInResource(r.end, 'foo')).toEqual('bar');
            expect(r.err).toBeNull();
        });
        done();
    });

    async.it("should have received the simple hello page", function(done){
        if (URLUtils) {
            searchRequest(domain+"simplehello.html", function(r){
                expect(r.req).toNotBe(null, "req is null");
                expect(r.req.url ).toEqual(domain+"simplehello.html");
                expect(r.req.method).toEqual("GET");
                expect(r.start).toNotBe(null, "start is null");
                expect(r.start.id).toEqual( r.req.id);
                expect(r.start.url).toEqual(r.end.url);
                expect(r.start.status).toEqual(200);
                expect(r.start.statusText).toEqual('OK');
                expect(r.start.contentType).toEqual("text/html", "start content type");
                expect(r.start.redirectURL).toBeNull();
                expect(r.end).toNotBe(null, "end is null");
                expect(r.end.id).toEqual(r.req.id);
                expect(r.end.url).toEqual(domain+"simplehello.html");
                expect(r.end.status).toEqual(200, "end.status");
                expect(r.end.statusText).toEqual('OK', "end.statusText");
                expect(r.end.contentType).toEqual("text/html", "end content type");
                expect(r.end.redirectURL).toBeNull();
                expect(r.err).toBeNull();
            });
        }
        else {
            // PhantomJS 1.9.2 doesn't follow redirections
            searchMissedRequest(domain+"simplehello.html");
        }
        done();
    });



    async.it("is opening a new page after a redirection to an absolute url without path",function(done) {
        // we test the case where a slash is added by the webserver on the response url
        trace = "";
        receivedRequest = [];
        testWebpageListenerCreateWebPage()
        webpage.open(domain+'redirectToRoot', function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });
    async.it("should generate the expected trace for the redirection", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";

        if (URLUtils) { 
            expectedTrace += "  loading url=http://localhost:8083/redirectToRoot\n";
            expectedTrace += "URLCHANGED:http://localhost:8083/\n";
            expectedTrace += "INITIALIZED 7\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/ - 8 success\n";
            expectedTrace += "  loaded url=http://localhost:8083/\n";
        }
        else {// phantomjs does not follow redirection
            expectedTrace += "URLCHANGED:http://localhost:8083/redirectToRoot\n";
            expectedTrace += "INITIALIZED 7\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/redirectToRoot - 8 success\n";
        }
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received the response for redirection", function(done){
        searchRequest(domain+"redirectToRoot", function(r){
            expect(r.req).toNotBe(null, "req is null");
            expect(r.req.url ).toEqual(domain+"redirectToRoot");
            expect(r.req.method).toEqual("GET");
            if (URLUtils) { // phantomjs does not generate "start" receivedResource during redirection
                expect(r.start).toNotBe(null, "start is null");
                expect(r.start.id).toEqual( r.req.id);
                expect(r.start.url).toEqual(r.end.url);
                expect(r.start.status).toEqual(301);
                expect(r.start.statusText).toEqual('Moved Permanently');
                expect(r.start.contentType).toBeNull("start content type");
            }
            else
                expect(r.start).toBeNull();
            expect(r.end).toNotBe(null, "end is null");
            expect(r.end.id).toEqual(r.req.id);
            expect(r.end.url).toEqual(domain+"redirectToRoot");
            expect(r.end.status).toEqual(301, "end.status");
            expect(r.end.statusText).toEqual('Moved Permanently', "end.statusText");
            expect(r.end.contentType).toBeNull("end content type");
            expect(r.end.redirectURL).toEqual("http://localhost:8083/");
            expect(r.err).toBeNull();
        });
        done();
    });

    async.it("should have received the index directory", function(done){
        if (URLUtils) {
            expect(receivedRequest.length).toEqual(3);
            searchRequest(domain, function(r){
                expect(r.req).toNotBe(null, "req is null");
                expect(r.req.url ).toEqual(domain);
                expect(r.req.method).toEqual("GET");
                expect(r.start).toNotBe(null, "start is null");
                expect(r.start.id).toEqual( r.req.id);
                expect(r.start.url).toEqual(r.end.url);
                expect(r.start.status).toEqual(200);
                expect(r.start.statusText).toEqual('OK');
                expect(r.start.contentType).toEqual("text/html");
                expect(r.start.redirectURL).toBeNull();
                expect(r.end).toNotBe(null, "end is null");
                expect(r.end.id).toEqual(r.req.id);
                expect(r.end.url).toEqual(domain);
                expect(r.end.status).toEqual(200);
                expect(r.end.statusText).toEqual('OK');
                expect(r.end.contentType).toEqual("text/html");
                expect(r.end.redirectURL).toBeNull();
                expect(r.err).toBeNull();
           });
        }
        else {
            // PhantomJS 1.9.2 doesn't follow redirections
            searchMissedRequest(domain);
        }
        done();
    });
    
    async.it("is opening a new page after a redirection2 to a relative URL",function(done) {
        trace = "";
        receivedRequest = [];
        testWebpageListenerCreateWebPage()
        webpage.open(domain+'redirectToSimpleHello2', function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should generate the expected trace for the redirection2", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";

        if (URLUtils) { 
            expectedTrace += "  loading url=http://localhost:8083/redirectToSimpleHello2\n";
            expectedTrace += "URLCHANGED:http://localhost:8083/simplehello.html\n";
            expectedTrace += "INITIALIZED 9\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/simplehello.html - 10 success\n";
            expectedTrace += "  loaded url=http://localhost:8083/simplehello.html\n";
        }
        else {// phantomjs does not follow redirection
            expectedTrace += "URLCHANGED:http://localhost:8083/redirectToSimpleHello2\n";
            expectedTrace += "INITIALIZED 9\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/redirectToSimpleHello2 - 10 success\n";
        }

        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received the response for redirection2", function(done){
        searchRequest(domain+"redirectToSimpleHello2", function(r){
            expect(r.req).toNotBe(null, "req is null");
            expect(r.req.url ).toEqual(domain+"redirectToSimpleHello2");
            expect(r.req.method).toEqual("GET");
            if (URLUtils) { // phantomjs does not generate "start" receivedResource during redirection
                expect(r.start).toNotBe(null, "start is null");
                expect(r.start.id).toEqual( r.req.id);
                expect(r.start.url).toEqual(r.end.url);
                expect(r.start.status).toEqual(302);
                expect(r.start.statusText).toEqual('Found');
                expect(r.start.contentType).toBeNull("start content type");
                expect(r.start.redirectURL).toEqual("http://localhost:8083/simplehello.html");
                expect(searchHeaderInResource(r.start, 'foo')).toEqual('bar');
            }
            else
                expect(r.start).toBeNull();
            expect(r.end).toNotBe(null, "end is null");
            expect(r.end.id).toEqual(r.req.id);
            expect(r.end.url).toEqual(domain+"redirectToSimpleHello2");
            expect(r.end.status).toEqual(302, "end.status");
            expect(r.end.statusText).toEqual('Found', "end.statusText");
            expect(r.end.contentType).toBeNull("end content type");
            expect(r.end.redirectURL).toEqual("http://localhost:8083/simplehello.html");
            expect(searchHeaderInResource(r.end, 'foo')).toEqual('bar');
            expect(r.err).toBeNull();
        });
        done();
    });

    async.it("should have received the simple hello page #2", function(done){
        if (URLUtils) {
            expect(receivedRequest.length).toEqual(3);
            searchRequest(domain+"simplehello.html", function(r){
                expect(r.req).toNotBe(null, "req is null");
                expect(r.req.url ).toEqual(domain+"simplehello.html");
                expect(r.req.method).toEqual("GET");
                expect(r.start).toNotBe(null, "start is null");
                expect(r.start.id).toEqual( r.req.id);
                expect(r.start.url).toEqual(r.end.url);
                expect(r.start.status).toEqual(200);
                expect(r.start.statusText).toEqual('OK');
                expect(r.start.contentType).toEqual("text/html");
                expect(r.start.redirectURL).toBeNull();
                expect(r.end).toNotBe(null, "end is null");
                expect(r.end.id).toEqual(r.req.id);
                expect(r.end.url).toEqual(domain+"simplehello.html");
                expect(r.end.status).toEqual(200);
                expect(r.end.statusText).toEqual('OK');
                expect(r.end.contentType).toEqual("text/html");
                expect(r.end.redirectURL).toBeNull();
                expect(r.err).toBeNull();
            });
        }
        else {
            // PhantomJS 1.9.2 doesn't follow redirections
            searchMissedRequest(domain+"simplehello.html");
        }
        done();
    });

    async.it("will open a page and abort the request",function(done) {
        trace = '';
        receivedRequest = [];
        initializedCounter = 0;
        cancelNextRequest = true;

        testWebpageListenerCreateWebPage()
        webpage.open(domain + 'simplehello.html', function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("fail");
            done();
        });
    });

    async.it("should generate the expected trace", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        if (URLUtils) expectedTrace += "  loading url=http://localhost:8083/simplehello.html\n";
        expectedTrace += "LOADFINISHED:about:blank - 1 fail\n";
        if (URLUtils) expectedTrace += "  loaded url=http://localhost:8083/simplehello.html\n";
        expectedTrace += "CALLBACK:fail\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received correct data", function(done){
        searchRequest(domain+"simplehello.html", function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toBeNull();
            expect(r.end).toNotBe(null);
            expect(r.err).toNotBe(null);
            expect(r.req.id == r.end.id).toBeTruthy();
            expect(r.end.url).toEqual("");
            expect(r.req.method).toEqual("GET");
            expect(r.end.status).toBeNull();
            expect(r.end.statusText).toBeNull();
            expect(r.end.contentType).toBeNull();
            expect(r.err.errorCode).toEqual(95);
        });
        done();
    });

    async.it("will open a page and do a manual redirection",function(done) {
        trace = '';
        receivedRequest = [];
        initializedCounter = 0;
        changeUrlNextRequest = domain + 'helloframe.html';

        testWebpageListenerCreateWebPage()
        webpage.open(domain + 'simplehello.html', function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should generate the expected trace with manual redirection", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        if (URLUtils) {
            expectedTrace += "  loading url=http://localhost:8083/simplehello.html\n";
            expectedTrace += "URLCHANGED:http://localhost:8083/helloframe.html\n";
            expectedTrace += "INITIALIZED 1\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/helloframe.html - 2 success\n";
            expectedTrace += "  loaded url=http://localhost:8083/helloframe.html\n";
        }
        else {
            expectedTrace += "URLCHANGED:http://localhost:8083/simplehello.html\n";
            expectedTrace += "INITIALIZED 1\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/simplehello.html - 2 success\n";
        }
        expectedTrace += "CALLBACK:success\n";
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received correct data with manual redirection", function(done){
        searchRequest(domain+"simplehello.html", function(r){
            expect(r.req).toNotBe(null, "req is null");
            expect(r.req.url ).toEqual(domain+"simplehello.html");
            expect(r.req.method).toEqual("GET");
            expect(r.start).toNotBe(null, "start is null");
            expect(r.start.id).toEqual( r.req.id);
            expect(r.start.url).toEqual(r.end.url);
            expect(r.end).toNotBe(null, "end is null");
            expect(r.end.id).toEqual(r.req.id);
            expect(r.start.redirectURL).toBeNull();
            expect(r.end.redirectURL).toBeNull();
            if (URLUtils) {
                // gecko generates two request object. The first request is in fact
                // canceled, and it create a new one for the new url
                expect(r.start.status).toBeNull();
                expect(r.start.statusText).toBeNull();
                expect(r.start.contentType).toBeNull();
                expect(r.end.url).toEqual(domain+"simplehello.html");
                expect(r.end.status).toBeNull();
                expect(r.end.statusText).toBeNull();
                expect(r.end.contentType).toBeNull();
            }
            else {
                // PhantomJS generates only one response: this is the same request object
                // before and after the redirection...
                expect(r.start.status).toEqual(200);
                expect(r.start.statusText).toEqual('OK');
                expect(r.start.contentType).toEqual("text/html");
                expect(r.end.url).toEqual(domain+"helloframe.html");
                expect(r.end.status).toEqual(200);
                expect(r.end.statusText).toEqual('OK');
                expect(r.end.contentType).toEqual("text/html");
            }
            expect(r.err).toBeNull();
        });
        done();
    });

    async.it("should have received the helloframe.html page", function(done){
        if (URLUtils) {
            searchRequest(domain+"helloframe.html", function(r){
                expect(r.req).toNotBe(null, "req is null");
                expect(r.req.url ).toEqual(domain+"helloframe.html");
                expect(r.req.method).toEqual("GET");
                expect(r.start).toNotBe(null, "start is null");
                expect(r.start.id).toEqual( r.req.id);
                expect(r.start.url).toEqual(r.end.url);
                expect(r.start.status).toEqual(200);
                expect(r.start.statusText).toEqual('OK');
                expect(r.start.contentType).toEqual("text/html", "start content type");
                expect(r.end).toNotBe(null, "end is null");
                expect(r.end.id).toEqual(r.req.id);
                expect(r.end.url).toEqual(domain+"helloframe.html");
                expect(r.end.status).toEqual(200, "end.status");
                expect(r.end.statusText).toEqual('OK', "end.statusText");
                expect(r.end.contentType).toEqual("text/html", "end content type");
                expect(r.err).toBeNull();
            });
        }
        else {
            // PhantomJS 1.9.2 doesn't generate an other internal request
            // for manual redirection
            searchMissedRequest(domain+"helloframe.html");
        }
        done();
    });

    var testCodes = [
        101, 102, 118,
        200, 201, 202, 203, 204, 205, 206, 207, 210,
        300, 301, 302, 303, 304, 305, 307, 310,
        400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413,
            414, 415, 416, 417, 418, 422, 423, 424, 425, 426, 449, 450,
        500, 501, 502, 503, 504, 505, 507, 509
    ];
    // missing code: 100 is CONTINUE, so don't expect a terminated response
    // 102, 118, 408 are buggy in gecko
    testCodes.forEach(function(statusCode){
        async.it("is opening a page with response status code "+statusCode,function(done) {
            trace = "";
            receivedRequest = [];
            testWebpageListenerCreateWebPage()
            webpage.open(domain+'statuscode/'+statusCode, function(success){
                if (statusCode == 204 || statusCode == 205 || (URLUtils && slimer.geckoVersion.major <= 25 && statusCode == 408)) {
                    expect(success).toEqual("fail");
                }
                else
                    expect(success).toEqual("success");

                var r = receivedRequest.filter(function(result, i) {
                    if (i == 0)
                        return false;
                    return result.req.url == (domain + 'statuscode/'+statusCode);
                })[0];
                expect(r).toNotBe(null);
                expect(r.req).toNotBe(null);
                var startHasToBeNull = false;
                if (URLUtils && slimer.geckoVersion.major <= 25 && statusCode == 408) {
                    startHasToBeNull = true;
                }
                else if (!URLUtils && (statusCode <= 199 || statusCode == 204 || statusCode == 304)) {
                    startHasToBeNull = true;
                }
                if (!startHasToBeNull) {
                    expect(r.start).toNotBe(null);
                    if (statusCode != 102 && statusCode != 118) { // gecko doesn't return response code for this http response
                        expect(r.start.status).toEqual(statusCode);
                    }
                }
                else
                    expect(r.start).toBeNull();
                expect(r.end).toNotBe(null);
                if (statusCode >= 400) {
                    expect(r.err).toNotBe(null);
                }
                else
                    expect(r.err).toBeNull();

                if (r.end && statusCode != 102 && statusCode != 118 && statusCode != 408) { // gecko doesn't return response code for this http response
                    expect(r.end.status).toEqual(statusCode);
                }
                if (r.end) {
                    expect(r.req.id == r.end.id).toBeTruthy();
                    expect(r.req.url == r.end.url).toBeTruthy();
                }
                else expect(false).toBeTruthy();
                expect(r.req.method).toEqual("GET");
                done();
            });
        });
    });

    async.it("test end", function(done){
        webpage.close();
        done();
    });
});
