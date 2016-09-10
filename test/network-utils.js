

var networkUtils = {
    
    webpage: null,
    trace : '',
    receivedRequest : [],
    initializedCounter : 0,
    cancelNextRequest : false,
    cancelResourceRequest : false,
    changeUrlNextRequest : null,
    traceResources : false,

    reset : function() {
        this.trace = '';
        this.receivedRequest = [];
        this.initializedCounter = 0;
    },

    backupTrace: function() {
        this.currentTrace = this.trace;
        this.currentReceivedRequest = this.receivedRequest;
        this.currentInitializedCounter = this.initializedCounter;
    },
    restoreTrace:function() {
        this.trace = this.currentTrace;
        this.receivedRequest = this.currentReceivedRequest;
        this.initializedCounter = this.currentInitializedCounter;
    },
    init: function() {
        if (this.webpage) {
            this.webpage.close();
        }
        this.webpage = require("webpage").create();

        this.webpage.onConsoleMessage = function(msg, lineNum, sourceId) {
            console.log(msg);
        };

        this.webpage.onLoadStarted = url => {
            let currentUrl = this.webpage.evaluate(function(c) {
                window.initializedCounter = c;
                return window.location.href;
            }, this.initializedCounter);
            this.trace +="LOADSTARTED:"+currentUrl+"\n";
            if (url){
                this.trace +="  loading url="+url+"\n";
            }
            //console.log("LOADSTARTED:"+currentUrl)
        };

        this.webpage.onUrlChanged = targetUrl => {
            this.webpage.evaluate(function(c) {
                window.initializedCounter = c;
            }, this.initializedCounter);
            this.trace += "URLCHANGED:"+targetUrl+"\n";
            //console.log("URLCHANGED:"+targetUrl)
        };

        this.webpage.onInitialized = _ => {
            this.initializedCounter++;
            let wi = this.webpage.evaluate(function(c) {
                document.addEventListener('DOMContentLoaded', function() {
                    window.initializedCounter = c;
                }, false);
                return (window.initializedCounter === undefined?-1:window.initializedCounter);
            }, this.initializedCounter);
            this.trace +="INITIALIZED "+wi+"\n";
            //console.log("INITIALIZED "+wi)
        };

        this.webpage.onResourceRequested = (request, ctrl)  => {
            //console.log("--- webpage.onResourceRequested "+ request.id + " " + request.url);
            if (this.receivedRequest[request.id] == undefined ) {
                this.receivedRequest[request.id] = { req:null, start:null, end:null, err:null, timeout:null }
            }
            this.receivedRequest[request.id].req = request;
            if (this.traceResources) {
                this.trace +="RES REQUESTED "+request.url+"\n";
            }
            if (this.cancelResourceRequest && request.url.match(/\.(png|css)$/)) {
                ctrl.abort();
                //cancelResourceRequest = false;
                if (this.traceResources) {
                    this.trace +="    ABORTED "+request.url+"\n";
                }
            }
            else if (this.cancelNextRequest) {
                this.cancelNextRequest = false;
                ctrl.abort();
                if (this.traceResources) {
                    this.trace +="    ABORTED\n";
                }
            }
            else if (this.changeUrlNextRequest) {
                let newUrl = this.changeUrlNextRequest
                this.changeUrlNextRequest = null;
                ctrl.changeUrl(newUrl);
                if (this.traceResources) {
                    this.trace +="    URL CHANGED to "+newUrl+"\n";
                }
            }
        };

        this.webpage.onResourceReceived = response => {
            //console.log("--- webpage.onResourceReceived "+ response.id + " " + response.url + " "+response.stage);
            if (this.receivedRequest[response.id] == undefined ) {
                this.receivedRequest[response.id] = { req:null, start:null, end:null, err:null, timeout:null }
            }
            this.receivedRequest[response.id][response.stage] = response;
            if (this.traceResources) {
                this.trace +="RES RECEIVED "+response.stage+" - "+response.url+"\n";
            }
        };

        this.webpage.onResourceError = response => {
            //console.log("--- webpage.onResourceError "+ response.id + " " + response.url);
            if (this.receivedRequest[response.id] == undefined ) {
                this.receivedRequest[response.id] = { req:null, start:null, end:null, err:null, timeout:null }
            }
            this.receivedRequest[response.id].err = response;
            if (this.traceResources) {
                this.trace +="RES ERROR "+response.errorCode+" - "+response.url+"\n";
            }
        };

        this.webpage.onResourceTimeout = response => {
            //console.log("--- webpage.onResourceTimeout "+ response.id + " " + response.url);
            if (this.receivedRequest[response.id] == undefined ) {
                this.receivedRequest[response.id] = { req:null, start:null, end:null, err:null, timeout:null }
            }
            this.receivedRequest[response.id].timeout = response;
            if (this.traceResources) {
                this.trace +="RES TIMEOUT "+response.errorCode+" - "+response.url+"\n";
            }
        };

        this.webpage.onLoadFinished = (status, url) => {
            // FIXME: it seems the value of window.location.href
            // is set asynchronously by Gecko, so currentUrl may not
            // be the expected value
            let currentUrl = this.webpage.evaluate(function() {
                return window.location.href + " - "+ window.initializedCounter;
            });
            this.trace += "LOADFINISHED:"+currentUrl+" "+status+"\n";
            if (url){
                this.trace +="  loaded url="+url+"\n";
            }
            //console.log("LOADFINISHED:"+currentUrl);
        };

        this.webpage.onFileDownload = (url, responseData) => {
            this.trace += "FILEDOWNLOAD:"+url+" "+responseData.filename+"\n";
            return fs.workingDirectory + '/' + responseData.filename;
        };

        this.webpage.onFileDownloadError = (message) => {
            this.trace += "FILEDOWNLOADERROR:"+message+"\n";
        };
    },

    searchRequest : function (url, tests, min) {
        min = min || 0
        let listR = this.receivedRequest.filter(function(result, i) {
            if (i < min || result == undefined ||
                result == null || !('req' in result) ||
                result.req == null) {
                return false;
            }
            return (result.req.url == url);
        });
        expect(!(!listR || listR.length == 0)).toBeTruthy("request not found (for "+url+")");
        if ((!listR) || listR.length == 0) {
            return null;
        }
        let r = listR[0]
        expect(r).toNotBe(null);
        if (!r) {
            expect(false).toBeTruthy(" request is null...");
            return null;
        }

        if (tests == undefined) {
            return r;
        }
        let ok = null;
        try {
            tests(r);
            ok = true;
        } catch(e) {
            console.log("searchRequest tests error: "+e+" filename:"+e.fileName+" "+e.lineNumber)
        }
        expect(ok).toBeTruthy("all tests have not been executed");
        return ok;
    },

    searchMissedRequest: function(url, min) {
        min = min || 0
        let listR = this.receivedRequest.filter(function(result, i) {
            if (i < min || result == undefined || result == null ||
                !('req' in result) || result.req == null) {
                return false;
            }
            return (result.req.url == url);
        });
        expect(!listR || listR.length == 0).toBeTruthy("request has been found (for "+url+")");
    },

    searchHeaderInResource: function(res, headerName){
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
}
