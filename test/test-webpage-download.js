
var URLUtils = null;
if ("slimer" in this) {
    URLUtils = require("sdk/url");
}


describe("webpage with download listeners", function() {
    var webpage;
    var trace = '';
    var receivedRequest = [];
    var initializedCounter = 0;
    var cancelNextRequest = false;
    var cancelResourceRequest = false;
    var changeUrlNextRequest = null;
    var traceResources = false;

    function testWebpageListenerCreateWebPage() {
        if (webpage) {
            webpage.close();
        }
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
            if (traceResources) {
                trace +="RES REQUESTED "+request.url+"\n";
            }
            if (cancelResourceRequest && request.url.match(/\.(png|css)$/)) {
                ctrl.abort();
                //cancelResourceRequest = false;
                if (traceResources) {
                    trace +="    ABORTED "+request.url+"\n";
                }
            }
            else if (cancelNextRequest) {
                cancelNextRequest = false;
                ctrl.abort();
                if (traceResources) {
                    trace +="    ABORTED\n";
                }
            }
            else if (changeUrlNextRequest) {
                var newUrl = changeUrlNextRequest
                changeUrlNextRequest = null;
                ctrl.changeUrl(newUrl);
                if (traceResources) {
                    trace +="    URL CHANGED to "+newUrl+"\n";
                }
            }
        };

        webpage.onResourceReceived = function(response) {
            //console.log("--- webpage.onResourceReceived "+ response.id + " " + response.url + " "+response.stage);
            if (receivedRequest[response.id] == undefined ) {
                receivedRequest[response.id] = { req:null, start:null, end:null, err:null}
            }
            receivedRequest[response.id][response.stage] = response;
            if (traceResources) {
                trace +="RES RECEIVED "+response.stage+" - "+response.url+"\n";
            }
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

        webpage.onFileDownload = function(url, responseData) {
            trace += "FILEDOWNLOAD:"+url+" "+responseData.filename+"\n";
            return fs.workingDirectory + '/' + responseData.filename;
        }
        webpage.onFileDownloadError = function(message) {
            trace += "FILEDOWNLOADERROR:"+message+"\n";
        }
    }

    var domain = "http://localhost:8083/";
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

    async.it("should be start download for a zip file",function(done) {
        trace = '';
        receivedRequest = [];
        initializedCounter = 0;
        traceResources = true;
        testWebpageListenerCreateWebPage()
        webpage.open(domain + 'example.zip', function(success){
            trace += "CALLBACK:"+success+"\n";
            expect(success).toEqual("success");
            //slimer.wait(1000);
            done();
        });
    });

    async.it("should generate the expected trace", function(done){
        var expectedTrace = ""
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
        expect(trace).toEqual(expectedTrace);
        done();
    });

    async.it("should have received example.zip", function(done) {
        var filepath = fs.workingDirectory + '/example.zip';
        expect(fs.exists(filepath)).toBeTruthy();
        expect(fs.isFile(filepath)).toBeTruthy();
        if (fs.exists(filepath)) {
            fs.remove(filepath);
        }

        searchRequest(domain + 'example.zip', function(r){
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
        webpage.close();
        done();
    });
});
