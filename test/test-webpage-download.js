

describe("webpage with download listeners", function() {

    var domain = "http://localhost:8083/";

    var async = new AsyncSpec(this);
    var filepath = fs.workingDirectory + '/example.zip';

    async.it("should be start download for a zip file",function(done) {
        if (fs.exists(filepath)) {
            fs.remove(filepath);
        }
        networkUtils.reset();
        networkUtils.traceResources = true;
        networkUtils.init();
        networkUtils.webpage.open(domain + 'example.zip', function(success){
            networkUtils.trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should generate the expected trace", function(done){
        networkUtils.traceResources = true;
        let expectedTrace = ""
        expectedTrace += "INITIALIZED -1\n";
        expectedTrace += "LOADSTARTED:about:blank\n";
        if (URLUtils) expectedTrace += "  loading url=http://localhost:8083/example.zip\n";
        expectedTrace += "RES REQUESTED http://localhost:8083/example.zip\n";
        expectedTrace += "INITIALIZED 1\n";
        expectedTrace += "FILEDOWNLOAD:http://localhost:8083/example.zip example.zip\n";
        expectedTrace += "RES RECEIVED start - http://localhost:8083/example.zip\n";
        expectedTrace += "RES RECEIVED end - http://localhost:8083/example.zip\n";
        expectedTrace += "LOADFINISHED:about:blank - 1 success\n";
        if (URLUtils) expectedTrace += "  loaded url=http://localhost:8083/example.zip\n";
        expectedTrace += "CALLBACK:success\n";
        expect(networkUtils.trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received example.zip", function(done) {
//FIXME: file does not exists because it is not yet downloaded at this time
// webpage.open callback is called too early
        expect(fs.exists(filepath)).toBeTruthy();
        expect(fs.isFile(filepath)).toBeTruthy();
        if (fs.exists(filepath)) {
            fs.remove(filepath);
        }

        networkUtils.searchRequest(domain + 'example.zip', function(r){
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
            expect(r.start.contentType).toEqual("application/zip");
            expect(r.end.contentType).toEqual("application/zip");
        });
        done();
    });

    async.it("test end", function(done){
        networkUtils.webpage.close();
        done();
    });
});
