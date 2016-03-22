
describe("webpage loading files", function() {

    var file;
    if (URLUtils) {
        file = URLUtils.fromFilename(phantom.libraryPath);
        if (file.charAt(file.length-1) !== '/'){
            file += '/';
        }
        file += 'www/simplehello.html';
    }
    else {
        file = 'file://'+phantom.libraryPath + '/www/simplehello.html'; // for test with phantomjs
    }

    var async = new AsyncSpec(this);

    async.it("should be opened with a simple file",function(done) {
        networkUtils.reset();
        networkUtils.init();
         networkUtils.webpage.open(file, function(success){
             networkUtils.trace += "CALLBACK:"+success+"\n";
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
        expect( networkUtils.trace).toEqual(expectedTrace);
        networkUtils.trace = "";
        done();
    });

    async.it("should have received file://..../simplehello.html", function(done){
         networkUtils.searchRequest(file, function(r){
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

    async.it("should be opened with a simple file (related path)",function(done) {
        networkUtils.init();
        networkUtils.webpage.open('test/www/simplehello.html', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should generate the expected trace for a simple file (related path)", function(done){
        var expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        if (URLUtils) expectedTrace += "  loading url="+file+"\n";
        expectedTrace += "URLCHANGED:"+file+"\n";
        expectedTrace += "INITIALIZED 3\n";
        expectedTrace += "LOADFINISHED:"+file+" - 4 success\n";
        if (URLUtils) expectedTrace += "  loaded url="+file+"\n";
        expectedTrace += "CALLBACK:success\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        networkUtils.trace = "";
        done();
    });

    async.it("should have received file://..../simplehello.html (related path)", function(done){
        networkUtils.searchRequest(file, function(r){
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

    async.it("test end", function(done){
        networkUtils.reset();
        done();
    });
});
