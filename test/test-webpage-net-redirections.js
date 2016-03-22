


describe("webpage with listeners", function() {

    var domain = "http://localhost:8083/";

    var async = new AsyncSpec(this);

    async.it("is opening a new page after a redirection to an absolute url",function(done) {
        networkUtils.reset();
        networkUtils.init()
        networkUtils.webpage.open(domain+'redirectToSimpleHello', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
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
            expectedTrace += "INITIALIZED 1\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/simplehello.html - 2 success\n";
            expectedTrace += "  loaded url=http://localhost:8083/simplehello.html\n";
        }
        else {// phantomjs does not follow redirection
            expectedTrace += "URLCHANGED:http://localhost:8083/redirectToSimpleHello\n";
            expectedTrace += "INITIALIZED 1\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/redirectToSimpleHello - 2 success\n";
        }
        expectedTrace += "CALLBACK:success\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received the response for redirection", function(done){
        networkUtils.searchRequest(domain+"redirectToSimpleHello", function(r){
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
                expect(networkUtils.searchHeaderInResource(r.start, 'foo')).toEqual('bar');
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
            expect(networkUtils.searchHeaderInResource(r.end, 'foo')).toEqual('bar');
            expect(r.err).toBeNull();
        });
        done();
    });

    async.it("should have received the simple hello page", function(done){
        if (URLUtils) {
            networkUtils.searchRequest(domain+"simplehello.html", function(r){
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
            networkUtils.searchMissedRequest(domain+"simplehello.html");
        }
        done();
    });



    async.it("is opening a new page after a redirection to an absolute url without path",function(done) {
        // we test the case where a slash is added by the webserver on the response url
        networkUtils.reset();
        networkUtils.init()
        networkUtils.webpage.open(domain+'redirectToRoot', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
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
            expectedTrace += "INITIALIZED 1\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/ - 2 success\n";
            expectedTrace += "  loaded url=http://localhost:8083/\n";
        }
        else {// phantomjs does not follow redirection
            expectedTrace += "URLCHANGED:http://localhost:8083/redirectToRoot\n";
            expectedTrace += "INITIALIZED 1\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/redirectToRoot - 2 success\n";
        }
        expectedTrace += "CALLBACK:success\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received the response for redirection", function(done){
        networkUtils.searchRequest(domain+"redirectToRoot", function(r){
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
            else {
                expect(r.start).toBeNull();
            }
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
            expect(networkUtils.receivedRequest.length).toEqual(3);
            networkUtils.searchRequest(domain, function(r){
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
            networkUtils.searchMissedRequest(domain);
        }
        done();
    });
    
    async.it("is opening a new page after a redirection2 to a relative URL",function(done) {
        networkUtils.reset();
        networkUtils.init()
        networkUtils.webpage.open(domain+'redirectToSimpleHello2', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
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
            expectedTrace += "INITIALIZED 1\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/simplehello.html - 2 success\n";
            expectedTrace += "  loaded url=http://localhost:8083/simplehello.html\n";
        }
        else {// phantomjs does not follow redirection
            expectedTrace += "URLCHANGED:http://localhost:8083/redirectToSimpleHello2\n";
            expectedTrace += "INITIALIZED 1\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/redirectToSimpleHello2 - 2 success\n";
        }

        expectedTrace += "CALLBACK:success\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received the response for redirection2", function(done){
        networkUtils.searchRequest(domain+"redirectToSimpleHello2", function(r){
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
                expect(networkUtils.searchHeaderInResource(r.start, 'foo')).toEqual('bar');
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
            expect(networkUtils.searchHeaderInResource(r.end, 'foo')).toEqual('bar');
            expect(r.err).toBeNull();
        });
        done();
    });

    async.it("should have received the simple hello page #2", function(done){
        if (URLUtils) {
            expect(networkUtils.receivedRequest.length).toEqual(3);
            networkUtils.searchRequest(domain+"simplehello.html", function(r){
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
            networkUtils.searchMissedRequest(domain+"simplehello.html");
        }
        done();
    });

    async.it("will open a page and do a manual redirection",function(done) {
        networkUtils.reset();
        networkUtils.changeUrlNextRequest = domain + 'helloframe.html';

        networkUtils.init()
        networkUtils.webpage.open(domain + 'simplehello.html', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
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
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received correct data with manual redirection", function(done){
        networkUtils.searchRequest(domain+"simplehello.html", function(r){
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
            networkUtils.searchRequest(domain+"helloframe.html", function(r){
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
            networkUtils.searchMissedRequest(domain+"helloframe.html");
        }
        done();
    });

    async.it("test end", function(done){
        networkUtils.reset();
        done();
    });
});
