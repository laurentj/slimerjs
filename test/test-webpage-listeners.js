

describe("webpage with network listeners", function() {

    var domain = "http://localhost:8083/";

    var async = new AsyncSpec(this);

    async.it("should open simple web page helloworld.html",function(done) {
        networkUtils.reset();
        networkUtils.traceResources = true;
        networkUtils.init();
        networkUtils.webpage.open(domain + 'helloworld.html', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            expect(networkUtils.webpage.loading).toEqual(false);
            expect(networkUtils.webpage.loadingProgress).toEqual(100);
            done();
        });
    });


    async.it("should generate the expected trace for helloworld.html", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        if (URLUtils) expectedTrace += "  loading url=http://localhost:8083/helloworld.html\n";
        expectedTrace += "RES REQUESTED http://localhost:8083/helloworld.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/helloworld.html\n";
        expectedTrace += "RES RECEIVED start - http://localhost:8083/helloworld.html\n";
        expectedTrace += "RES RECEIVED end - http://localhost:8083/helloworld.html\n";
        expectedTrace += "INITIALIZED 1\n";

        expectedTrace += "LOADFINISHED:http://localhost:8083/helloworld.html - 2 success\n";
        if (URLUtils) expectedTrace += "  loaded url=http://localhost:8083/helloworld.html\n";
        expectedTrace += "CALLBACK:success\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received helloworld.html", function(done){
        networkUtils.searchRequest(domain + 'helloworld.html', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect(r.timeout).toBeNull();
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

    async.it("should open hello.html",function(done) {
        networkUtils.reset();
        networkUtils.traceResources = false;
        networkUtils.init();
        networkUtils.webpage.open(domain + 'hello.html', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
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
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received hello.html", function(done){
        networkUtils.searchRequest(domain + 'hello.html', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect(r.timeout).toBeNull();
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
        networkUtils.searchRequest(domain + 'slimerjs.png', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect(r.timeout).toBeNull();
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
        networkUtils.searchRequest(domain + 'helloframe.html', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect(r.timeout).toBeNull();
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
        networkUtils.searchRequest(domain + 'hello.js', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect(r.timeout).toBeNull();
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
        networkUtils.searchRequest(domain + 'helloframe.css', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect(r.timeout).toBeNull();
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
        networkUtils.backupTrace();
        networkUtils.reset();

        networkUtils.webpage.evaluate(function(){
            document.getElementsByTagName( "iframe" )[ 0 ].contentWindow.location.href="simplehello.html"
            document.getElementsByTagName( "img" )[ 0 ].src="glouton-home.png"
        })
        setTimeout(function() {
            var expectedTrace = "LOADSTARTED:http://localhost:8083/hello.html\n";
            if (URLUtils) expectedTrace += "  loading url=http://localhost:8083/simplehello.html\n";
            expectedTrace += "LOADFINISHED:http://localhost:8083/hello.html - 0 success\n";
            if (URLUtils) expectedTrace += "  loaded url=http://localhost:8083/simplehello.html\n";
            expect(networkUtils.trace).toEqual(expectedTrace);
            expect(networkUtils.receivedRequest.length).toEqual(9);
            networkUtils.searchRequest(domain + 'simplehello.html', function(r){
                expect(r.req).toNotBe(null);
                expect(r.start).toNotBe(null);
                expect(r.end).toNotBe(null);
                expect(r.err).toBeNull();
                expect(r.timeout).toBeNull();
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
            networkUtils.restoreTrace();
            done();
        },200);
    });

    async.it("is opening a new page",function(done) {
        networkUtils.webpage.open(domain + 'mouseevent.html', function(success){
            networkUtils.trace += "CALLBACK2:"+success+"\n";
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
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received mouseevent.html", function(done){
        networkUtils.searchRequest(domain + 'mouseevent.html', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect(r.timeout).toBeNull();
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
        networkUtils.trace = "";
        networkUtils.receivedRequest = [];
        networkUtils.webpage.open(domain+'plop.html', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
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
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received a 404 page", function(done){
        expect(networkUtils.receivedRequest.length).toEqual(2);
        networkUtils.searchRequest(domain + 'plop.html', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toNotBe(null);
            expect(r.timeout).toBeNull();
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
            expect(r.err.status).toEqual(404);
            expect(r.err.statusText).toEqual('Not Found');
        });
        done();
    });

    async.it("is opening a new page from an inexistant domain name",function(done) {
        networkUtils.trace = "";
        networkUtils.receivedRequest = [];
        networkUtils.webpage.open('http://qsdqsdqs.qsfdsfi/plop.html', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("fail");
            done();
        });
    });
    async.it("should generate the expected trace for the error page", function(done){
        var expectedTrace = ""
        expectedTrace += "LOADSTARTED:http://localhost:8083/plop.html\n";
        if (URLUtils) expectedTrace += "  loading url=http://qsdqsdqs.qsfdsfi/plop.html\n";
        expectedTrace += "LOADFINISHED:http://qsdqsdqs.qsfdsfi/plop.html - undefined fail\n";
        if (URLUtils) expectedTrace += "  loaded url=http://qsdqsdqs.qsfdsfi/plop.html\n";
        expectedTrace += "CALLBACK:fail\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received an error page", function(done){
        expect(networkUtils.receivedRequest.length).toEqual(2);
        networkUtils.searchRequest("http://qsdqsdqs.qsfdsfi/plop.html", function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toBeNull();
            expect(r.end).toNotBe(null);
            expect(r.err).toNotBe(null);
            expect(r.timeout).toBeNull();
            expect(r.end.contentType).toBeNull()
            expect(r.end.redirectURL).toBeNull()
            expect(r.end.status).toBeNull()
            expect(r.end.statusText).toBeNull()
            expect(r.end.url).toEqual('http://qsdqsdqs.qsfdsfi/plop.html');
            expect(r.req.method).toEqual("GET");
            expect(r.err.url).toEqual(r.req.url);
            expect(r.err.errorCode).toEqual(3);
            expect(r.err.errorString).toNotEqual('');
            expect(r.err.status).toBeNull()
            expect(r.err.statusText).toBeNull()
        });
        done();
    });


    async.it("will open a page and abort the main request",function(done) {
        networkUtils.reset();
        networkUtils.cancelNextRequest = true;

        networkUtils.init()
        networkUtils.webpage.open(domain + 'simplehello.html', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
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
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received correct data", function(done){
        networkUtils.searchRequest(domain+"simplehello.html", function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toBeNull();
            expect(r.end).toNotBe(null);
            expect(r.err).toNotBe(null);
            expect(r.timeout).toBeNull();
            expect(r.req.id == r.end.id).toBeTruthy();
            expect(r.end.url).toEqual("http://localhost:8083/simplehello.html");
            expect(r.req.method).toEqual("GET");
            expect(r.end.status).toBeNull();
            expect(r.end.statusText).toBeNull();
            expect(r.end.contentType).toBeNull();
            expect(r.err.errorCode).toEqual(99);
        });
        done();
    });


    async.it("will open a page and cancel a resource request",function(done) {
        networkUtils.reset();
        networkUtils.cancelResourceRequest = true;
        networkUtils.traceResources = true;
        networkUtils.init()
        networkUtils.webpage.open(domain + 'hello.html', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            networkUtils.traceResources = false;
            networkUtils.cancelResourceRequest = false;
            done();
        });
    });

    async.it("should generate the expected trace", function(done){
        networkUtils.traceResources = false;
        networkUtils.cancelResourceRequest = false;
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        if (URLUtils) {
            expectedTrace += "  loading url=http://localhost:8083/hello.html\n";
        }
        expectedTrace += "RES REQUESTED http://localhost:8083/hello.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/hello.html\n";
        expectedTrace += "RES RECEIVED start - http://localhost:8083/hello.html\n";
        expectedTrace += "RES RECEIVED end - http://localhost:8083/hello.html\n";
        expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "RES REQUESTED http://localhost:8083/hello.js\n";
        expectedTrace += "RES REQUESTED http://localhost:8083/slimerjs.png\n";
        expectedTrace += "RES ERROR 95 - http://localhost:8083/slimerjs.png\n";
        expectedTrace += "    ABORTED http://localhost:8083/slimerjs.png\n";
        expectedTrace += "RES ERROR 99 - http://localhost:8083/slimerjs.png\n";
        expectedTrace += "RES REQUESTED http://localhost:8083/helloframe.html\n";
        expectedTrace += "RES ERROR 99 - http://localhost:8083/slimerjs.png\n";
        expectedTrace += "RES RECEIVED end - http://localhost:8083/slimerjs.png\n";
        expectedTrace += "RES RECEIVED start - http://localhost:8083/hello.js\n";
        expectedTrace += "RES REQUESTED http://localhost:8083/hello.txt\n";
        expectedTrace += "RES RECEIVED end - http://localhost:8083/hello.js\n";
        expectedTrace += "RES RECEIVED start - http://localhost:8083/helloframe.html\n";
        expectedTrace += "RES RECEIVED end - http://localhost:8083/helloframe.html\n";
        expectedTrace += "RES REQUESTED http://localhost:8083/helloframe.css\n";
        expectedTrace += "RES ERROR 95 - http://localhost:8083/helloframe.css\n";
        expectedTrace += "    ABORTED http://localhost:8083/helloframe.css\n";
        expectedTrace += "RES ERROR 99 - http://localhost:8083/helloframe.css\n";
        expectedTrace += "RES ERROR 99 - http://localhost:8083/helloframe.css\n";
        expectedTrace += "RES RECEIVED end - http://localhost:8083/helloframe.css\n";
        //expectedTrace += "RES RECEIVED start - http://localhost:8083/hello.txt\n";
        //expectedTrace += "RES RECEIVED end - http://localhost:8083/hello.txt\n";

        expectedTrace += "LOADFINISHED:http://localhost:8083/hello.html - 2 success\n";
        if (URLUtils) {
            expectedTrace += "  loaded url=http://localhost:8083/hello.html\n";
        }
        expectedTrace += "CALLBACK:success\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received correct data", function(done){
        networkUtils.searchRequest(domain+"hello.html", function(r){
            expect(r.req).toNotBe(null, "req is null");
            expect(r.req.url ).toEqual(domain+"hello.html");
            expect(r.req.method).toEqual("GET");
            expect(r.start).toNotBe(null, "start is null");
            expect(r.start.id).toEqual( r.req.id);
            expect(r.start.url).toEqual(r.end.url);
            expect(r.end).toNotBe(null, "end is null");
            expect(r.end.id).toEqual(r.req.id);
            expect(r.end.url).toEqual(domain+"hello.html");
            expect(r.err).toBeNull();
            expect(r.req.method).toEqual("GET");
            expect(r.end.status).toEqual(200);
            expect(r.end.statusText).toEqual("OK");
            expect(r.end.contentType).toEqual('text/html');
        });
        done();
    });



    async.it("should open missingresource.html",function(done) {
        networkUtils.reset();

        networkUtils.init();
        networkUtils.webpage.open(domain + 'missingresource.html', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should generate the expected trace", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        if (URLUtils) expectedTrace += "  loading url=http://localhost:8083/missingresource.html\n";
        expectedTrace += "URLCHANGED:http://localhost:8083/missingresource.html\n";
        expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/missingresource.html - 2 success\n";
        if (URLUtils) expectedTrace += "  loaded url=http://localhost:8083/missingresource.html\n";
        expectedTrace += "CALLBACK:success\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received missignresource.html", function(done){
        networkUtils.searchRequest(domain + 'missingresource.html', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect(r.timeout).toBeNull();
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

    async.it("should not have received missing.css", function(done){
        networkUtils.searchRequest(domain + 'missing.css', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toNotBe(null);
            expect(r.timeout).toBeNull();
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toEqual(404);
            expect(r.start.statusText).toEqual('Not Found');
            expect(r.end.status).toEqual(404);
            expect(r.end.statusText).toEqual('Not Found');
            expect(r.start.contentType).toEqual("text/html");
            expect(r.end.contentType).toEqual("text/html");
            expect((r.err.id == r.start.id) && (r.err.id == r.end.id)).toBeTruthy();
            expect((r.err.url == r.start.url) && (r.err.url == r.end.url)).toBeTruthy();
            expect(r.err.errorCode).toEqual(203);
            expect(r.err.status).toEqual(404);
            expect(r.err.statusText).toEqual('Not Found');
        });
        done();
    });

    async.it("is opening a new page with an invalid url",function(done) {
        networkUtils.reset();
        networkUtils.init();
        networkUtils.traceResources = true;
        networkUtils.webpage.open('http://:slimerjs.org', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("fail");
            done();
        });
    });
    async.it("should generate the expected trace for the error page", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        expectedTrace += "URLCHANGED:about:blank\n";
        expectedTrace += "LOADFINISHED:about:blank - 1 fail\n";
        if (URLUtils) expectedTrace += "  loaded url=http://:slimerjs.org\n";
        expectedTrace += "CALLBACK:fail\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        expect(networkUtils.receivedRequest.length).toEqual(0);
        done();
    });

    async.it("is opening a new page with an url having a unknown protocol",function(done) {
        networkUtils.reset();
        networkUtils.init();
        networkUtils.traceResources = true;
        networkUtils.webpage.open('hsttp://slimerjs.org', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("fail");
            done();
        });
    });
    async.it("should generate the expected trace for the error page", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        expectedTrace += "URLCHANGED:about:blank\n";
        expectedTrace += "RES REQUESTED hsttp://slimerjs.org\n";
        expectedTrace += "RES ERROR 301 - hsttp://slimerjs.org\n";
        expectedTrace += "RES RECEIVED end - hsttp://slimerjs.org\n";
        expectedTrace += "LOADFINISHED:about:blank - 1 fail\n";
        if (URLUtils) expectedTrace += "  loaded url=hsttp://slimerjs.org\n";
        expectedTrace += "CALLBACK:fail\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should not have received error page", function(done){
        networkUtils.searchRequest('hsttp://slimerjs.org', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toBeNull();
            expect(r.end).toNotBe(null);
            expect(r.err).toNotBe(null);
            expect(r.timeout).toBeNull();
            expect(r.req.id).toEqual(r.end.id);
            expect(r.req.id).toEqual(r.err.id);
            expect(r.req.url).toEqual(r.end.url);
            expect(r.req.url).toEqual(r.err.url);
            expect(r.req.method).toEqual("get");
            expect(r.end.status).toBeNull();
            expect(r.end.statusText).toBeNull();
            expect(r.end.contentType).toBeNull();
            expect(r.err.errorCode).toEqual(301);
            expect(r.err.status).toBeNull();
            expect(r.err.statusText).toBeNull();
        });
        done();
    });

    async.it("should open direct content",function(done) {
        networkUtils.reset();

        networkUtils.init();
        networkUtils.traceResources = true;
        
        var content = "<!DOCTYPE html>\n<html><head><meta charset=\"utf-8\">\n"
            +"        <title>content #1</title>\n"
            +"        <script type='text/javascript' src='"+domain+"nothing.js'></script></head>\n"
            +"    <body><div>content set with setContent <img src='"+domain+"glouton-home.png'/></div></body>";
        var url = 'http://slimerjs.org/foo.html';
        networkUtils.webpage.captureContent =  [ /\/javascript$/ ];
        networkUtils.webpage.setContent(content, url);
        done();
    });

    async.it("should generate the expected trace", function(done){
        var expectedTrace = ""
        expectedTrace += "LOADSTARTED:about:blank\n";
        if (URLUtils) expectedTrace += "  loading url=http://slimerjs.org/foo.html\n";
        expectedTrace += "URLCHANGED:http://slimerjs.org/foo.html\n";
        expectedTrace += "RES REQUESTED http://localhost:8083/nothing.js\n";
        expectedTrace += "INITIALIZED 0\n";
        expectedTrace += "RES RECEIVED start - http://localhost:8083/nothing.js\n";
        expectedTrace += "RES RECEIVED end - http://localhost:8083/nothing.js\n";
        expectedTrace += "RES REQUESTED http://localhost:8083/glouton-home.png\n";
        expectedTrace += "RES RECEIVED start - http://localhost:8083/glouton-home.png\n";
        expectedTrace += "RES RECEIVED end - http://localhost:8083/glouton-home.png\n";
        expectedTrace += "LOADFINISHED:http://slimerjs.org/foo.html - 1 success\n";
        if (URLUtils) expectedTrace += "  loaded url=http://slimerjs.org/foo.html\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should not have received foo.html", function(done){
        networkUtils.searchMissedRequest('http://slimerjs.org/foo.html');
        done();
    });

    async.it("should have received nothing.js with body content", function(done){
        networkUtils.searchRequest(domain + 'nothing.js', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect(r.timeout).toBeNull();
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toEqual(200);
            expect(r.start.statusText).toEqual('OK');
            expect(r.end.status).toEqual(200);
            expect(r.end.statusText).toEqual('OK');
            expect(r.start.contentType).toEqual("text/javascript");
            expect(r.end.contentType).toEqual("text/javascript");
            expect(r.end.body).toEqual("function nothing() { }");
        });
        done();
    });

    async.it("should have received png without body content", function(done){
        networkUtils.searchRequest(domain + 'glouton-home.png', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toNotBe(null);
            expect(r.end).toNotBe(null);
            expect(r.err).toBeNull();
            expect(r.timeout).toBeNull();
            expect((r.req.id == r.start.id) && (r.req.id == r.end.id)).toBeTruthy();
            expect((r.req.url == r.start.url) && (r.req.url == r.end.url)).toBeTruthy();
            expect(r.req.method).toEqual("GET");
            expect(r.start.status).toEqual(200);
            expect(r.start.statusText).toEqual('OK');
            expect(r.end.status).toEqual(200);
            expect(r.end.statusText).toEqual('OK');
            expect(r.start.contentType).toEqual("image/png");
            expect(r.end.contentType).toEqual("image/png");
            expect(r.end.body).toEqual("");
        });
        done();
    });

    async.it("should support resource timeout",function(done) {
        networkUtils.reset();

        networkUtils.init();
        networkUtils.traceResources = true;
        networkUtils.webpage.settings.resourceTimeout = 1000;
        networkUtils.webpage.open(domain + 'timeouttest', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("fail");
            done();
        });
    });
    

    async.it("timeout should generate the expected trace", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        if (URLUtils) expectedTrace += "  loading url=http://localhost:8083/timeouttest\n";
        expectedTrace += "RES REQUESTED http://localhost:8083/timeouttest\n";
        //expectedTrace += "URLCHANGED:http://localhost:8083/timeouttest\n";
        //expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "RES ERROR 5 - http://localhost:8083/timeouttest\n";
        expectedTrace += "RES TIMEOUT 408 - http://localhost:8083/timeouttest\n";
        expectedTrace += "RES RECEIVED end - http://localhost:8083/timeouttest\n";
        expectedTrace += "LOADFINISHED:http://localhost:8083/timeouttest - undefined fail\n";
        if (URLUtils) expectedTrace += "  loaded url=http://localhost:8083/timeouttest\n";
        expectedTrace += "CALLBACK:fail\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received timeouttest in error", function(done){
        networkUtils.searchRequest(domain + 'timeouttest', function(r){
            expect(r.req).toNotBe(null);
            expect(r.start).toBeNull();
            expect(r.end).toNotBe(null);
            expect(r.err).toNotBe(null);
            expect(r.timeout).toNotBe(null);
            expect(r.req.id).toEqual(r.end.id);
            expect(r.req.url).toEqual(r.end.url);
            expect(r.req.method).toEqual("GET");
            expect(r.end.status).toBeNull();
            expect(r.end.statusText).toBeNull();
            expect(r.end.contentType).toBeNull();
            expect(r.err.id).toEqual(r.req.id);
            expect(r.err.url).toEqual(r.req.url);
            expect(r.err.errorCode).toEqual(5);
            expect(r.err.errorString).toEqual("Operation canceled");
            expect(r.err.status).toBeNull();
            expect(r.err.statusText).toBeNull();
            expect(r.timeout.id).toEqual(r.req.id);
            expect(r.timeout.url).toEqual(r.req.url);
            expect(r.timeout.errorCode).toEqual(408);
            expect(r.timeout.method).toEqual("GET");
        });
        done();
    });

    async.it("test end", function(done){
        networkUtils.traceResources = false;
        networkUtils.reset();
        done();
    });
});
