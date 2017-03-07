
describe("WebPage object on hello world", function(){
    var webpage;
    var url = "http://127.0.0.1:8082/";

    var async = new AsyncSpec(this);
    async.it("should be opened",function(done) {
        webpage = require("webpage").create();
        webpage.open(url, function(success){
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("should have right url", function(done){
        expect(webpage.url).toEqual(url);
        done();
    });

    async.it("should be able to evaluate code", function(done){
        var result = webpage.evaluate(function(prefix){
                        return prefix+document.title;
        }, "title: ")
        expect(result).toEqual("title: hello world");
        done();
    });

    async.it("should be able to be closed", function(done) {
        webpage.close();
        done()
    })
});

describe("WebPage object", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("can open a page and a promise can be used",function() {
        var loaded = false;
        var foo = '';
        var loadedResult1 = '';
        var loadedResult2 = '';
        runs(function() {
            var promise = webpage.open(url, function(success){
                loadedResult1 = success;
            });
            promise.then(function(success){
                loadedResult2 = success;
                foo='bar';
                var deferred = require("sdk/core/promise").defer();
                setTimeout(deferred.resolve, 200, "hello");
                return deferred.promise;
            })
            .then(function(val){
                foo += val;
                loaded = true;
            })
        });
        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(foo).toEqual("barhello");
            expect(loadedResult1).toEqual("success");
            expect(loadedResult2).toEqual("success");
            webpage.close();
        });
    });

    it("can chain two openings of page with a promise",function() {
        var loaded = false;
        var titles = '';
        var loadedResult1 = '';
        var loadedResult2 = '';
        runs(function() {
            webpage.open(url+"simplehello.html")
            .then(function(){
                titles+=' '+webpage.title;
                return webpage.open(url+"helloframe.html");
            })
            .then(function(){
                titles+=' '+webpage.title;
                loaded = true;
            })
        });
        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(titles).toEqual(" simple hello world hello in frame");
            webpage.close();
        });
    });
});


describe("WebPage.evaluate()", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/inject.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });


    it("can evaluate a given function",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var r = webpage.evaluate(function(){
                pageVariable = "hello";
                window.pageVariable2 = "slimer";
                window.injectedVariable = "bob";
                modifyPageVariable();
                modifyInjectedVariable();
                return "okeval";
            });
            expect(r).toEqual("okeval");
        });
    });

    it("accepts any arguments type for the function",function() {
        // test inspired by a test in casperjs
        var result = webpage.evaluate(
                            function(_boolean_true, _boolean_false, _int_number,
                                      _float_number, _string, _array, _object, _function) {
            return [].map.call(arguments, function(arg) {
                return typeof(arg);
            });
        }, true, false, 42, 1337.42, "plop! \"Ÿ£$\" 'no'", [1, 2, 3], {a: 1, b: 2},
          function(){console.log('ok')});

        expect(result.toString())
          .toEqual(['boolean', 'boolean', 'number', 'number', 'string', 'object', 'object', 'function'].toString());
    });

    // FIXME: modifying a variable in a sandbox
    // that inherits of the context of a window,
    // does not propagate the modification into
    // this context. We have same
    // issue that https://bugzilla.mozilla.org/show_bug.cgi?id=783499
    xit("can modify a global variable", function(){

        var pageVariableValue = webpage.evaluate(function(){
            try {
                return getPageVariable();
            }catch(e) {
                return 'not found';
            }
        })
        expect(pageVariableValue).toEqual("hellochange by modify")
    });
    
    it("can modify a window variable", function(){
        var pageVariableValue2 = webpage.evaluate(function(){
            try {
                return getPageVariable2();
            }catch(e) {
                return 'not found';
            }
        })
        expect(pageVariableValue2).toEqual("slimerchange by modify")
    });
    
    it("can create a window variable", function(){
        var injectedVariableValue = webpage.evaluate(function(){
            try {
                return injectedVariable;
            }catch(e) {
                return 'not found';
            }
        })
        expect(injectedVariableValue).toEqual("bobchange by modify")
    });
    it("can evaluate a function that returns nothing", function(){
        var result = webpage.evaluate(function(){
            document.getElementById('test').textContent = 'abc';
        })
        expect(result === null).toBeTruthy()
        webpage.close();
    });
});

describe("WebPage.evaluateAsync()", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/inject.html";

    var async = new AsyncSpec(this);
    async.it("open a web page",function(done) {
        webpage = require("webpage").create();
        webpage.open(url, function(success){
            expect(success).toEqual("success");
            done();
        });
    });

    async.it("launch evaluateAsync", function(done){
        webpage.evaluateAsync(function(theVar){
            window.pageVariable2 = theVar;
        }, 500, "foo");

        setTimeout(done, 700);
    });

    async.it("can modify a window variable", function(done){
        var pageVariableValue2 = webpage.evaluate(function(){
            try {
                return getPageVariable2();
            }catch(e) {
                return 'not found';
            }
        })
        expect(pageVariableValue2).toEqual("foo");
        webpage.close();
        done();
    });
});

describe("WebPage.injectJs()", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/inject.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("can injects js",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            webpage.libraryPath += '/wwwfile';
            expect(webpage.injectJs('inject.js')).toBeTruthy();
        });
    });

    it("can modify DOM content",function() {
        var attrValue = webpage.evaluate(function(){
            return document.getElementById("test").getAttribute('class');
        })
        expect(attrValue).toEqual("foo")
    });

    it("can modify an existing variable",function() {
        var pageVariableValue = webpage.evaluate(function(){
            try {
                return pageVariable;
            }catch(e) {
                return 'not found';
            }
        })
        expect(pageVariableValue).toEqual("changed it")
    });

    it("can create new variable in the window context",function() {
        var injectedVariableValue = webpage.evaluate(function(){
            try {
                return injectedVariable;
            }catch(e) {
                return 'not found';
            }
        })
        expect(injectedVariableValue).toEqual("I am here")
    });

    // FIXME: modifying a variable in a sandbox
    // that inherits of the context of a window,
    // does not propagate the modification into
    // this context. We have same
    // issue that https://bugzilla.mozilla.org/show_bug.cgi?id=783499
    xit("can modify an existing variable and the new value is accessible from the window context",function() {
        webpage.evaluate(function(){ modifyPageVariable();});
        pageVariableValue = webpage.evaluate(function(){
            try {
                return pageVariable;
            }catch(e) {
                return 'not found';
            }
        })
        expect(pageVariableValue).toEqual("changed itchange by modify")
    });

    // FIXME: modifying a variable in a sandbox
    // that inherits of the context of a window,
    // does not propagate the modification into
    // this context. We have same
    // issue that https://bugzilla.mozilla.org/show_bug.cgi?id=783499
    xit("can modify an injected variable and the new value is accessible from the window context",function() {
        webpage.evaluate(function(){ modifyInjectedVariable();});
        injectedVariableValue = webpage.evaluate(function(){
            try {
                return injectedVariable;
            }catch(e) {
                return 'not found';
            }
        })
        expect(injectedVariableValue).toEqual("I am herechange by modify");
    });
    it("test end", function(){
        webpage.close();
    })
});


describe("WebPage.title", function(){
    var webpage;
    var url = "http://127.0.0.1:8082/hello.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("can be retrieved",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(webpage.title).toEqual("hello world");
            webpage.close();
        });
    });
});

describe("WebPage.content", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/simplehello.html";

    it("contains the source code of the HTML page",function() {
        var loaded = false;
        webpage = require("webpage").create();
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var content = "<!DOCTYPE html>\n<html><head>\n"
                +"        <meta charset=\"utf-8\">\n"
                +"        <title>simple hello world</title>\n"
                +"    </head>\n"
                +"    <body>Hello World! 你好 ! çàéèç\n"
                +"    <script type=\"text/javascript\"> var simpleJSToTestPlainText='foo';</script>\n"
                +"    <div style=\"display:none\">invisible text</div>\n"
                +"    </body></html>";
            //expect(webpage.content.indexOf(content)).toEqual(0);
            expect(webpage.content).toEqual(content);
        });
    });

    it("can be changed with HTML content",function() {
        var content = "<!DOCTYPE html>\n<html><head>\n"
            +"        <meta charset=\"utf-8\">\n"
            +"        <title>An other content</title></head>\n"
            +"    <body><p>new content</p></body>";
        webpage.content = content;
        expect(webpage.title).toEqual('An other content');
        expect(webpage.evaluate(function(){ return document.body.textContent;})).toEqual("new content");
        webpage.close();
    });

    it("contains the content of a text page",function() {
        var loaded = false;
        webpage = require("webpage").create();
        runs(function() {
            webpage.open("http://127.0.0.1:8083/hello.txt", function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(webpage.content).toMatch(/<pre( [^>].+)?>hello I am a file requested by XHR<\/pre>/);
            webpage.close();
        });
    });

    it("contains the content of a js file",function() {
        var loaded = false;
        webpage = require("webpage").create();
        runs(function() {
            webpage.open("http://127.0.0.1:8083/dummy.js", function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(webpage.content).toMatch(/<pre( [^>].+)?>document.write\('foo'\);\s*<\/pre>/g);
            webpage.close();
        });
    });
});

describe("WebPage.setContent", function(){
    var webpage;
    var loadStartUrl = '', loadFinishedUrl = '', navReqUrl = '', navType = '', willNav = null, loadingStatus = null;
    var loadStartedCalled =false, navRequestedCalled = false, loadFinishedCalled = false;
    
    beforeEach(function() {
        loadStartedCalled =true;
        navRequestedCalled = true;
        loadFinishedCalled = false;
        loadStartUrl = '';
        loadFinishedUrl = '';
        navReqUrl = '';
        navType = '';
        willNav = null;
        loadingStatus = null;

        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
        webpage.onLoadStarted = function (url, isFrame) {
            loadStartedCalled = true;
            loadStartUrl = url;
        };
        webpage.onNavigationRequested = function (url, navigationType, willNavigate, isMainFrame) {
            navRequestedCalled = true;
            navReqUrl = url;
            navType = navigationType;
            willNav = willNavigate;
        };
        webpage.onLoadFinished = function(status, url, isFrame) {
            loadFinishedCalled = true;
            loadFinishedUrl = url;
            loadingStatus = status;
        };
    });

    it("can set the content on a new browser",function() {

        var content = "<!DOCTYPE html>\n<html><head><meta charset=\"utf-8\">\n"
            +"        <title>An other content #2</title></head>\n"
            +"    <body><div>content set with setContent</div></body>";
        var url = 'http://127.0.0.1:8083/foo.html';
        webpage.setContent(content, url);
        expect(webpage.title).toEqual('An other content #2');
        expect(webpage.evaluate(function(){ return document.body.textContent;})).toEqual("content set with setContent");
        expect(loadStartedCalled).toBeTruthy();
        expect(navRequestedCalled).toBeTruthy();
        expect(willNav).toBeTruthy();
        expect(loadStartUrl).toEqual(url);
        expect(loadFinishedUrl).toEqual(url);
        expect(navReqUrl).toEqual(url);
        expect(navType).toEqual('Other');
        expect(loadingStatus).toEqual('success');
        expect(webpage.url).toEqual(url);
    });

    it("can set the content on an existing browser",function() {
        webpage.close();
        var loaded = false;
        runs(function() {
            webpage.open("http://127.0.0.1:8083/simplehello.html", function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var content = "<!DOCTYPE html>\n<html><head><meta charset=\"utf-8\">\n"
                +"        <title>An other content #3</title></head>\n"
                +"    <body><b>setContent is working</b></body>";
            var url = 'http://127.0.0.1:8083/foo.html';
            webpage.setContent(content, url);
            expect(webpage.title).toEqual('An other content #3');
            expect(webpage.evaluate(function(){ return document.body.textContent;})).toEqual("setContent is working");
            expect(webpage.url).toEqual(url);
            webpage.close();
            expect(loadStartedCalled).toBeTruthy();
            expect(navRequestedCalled).toBeTruthy();
            expect(willNav).toBeTruthy();
            expect(loadStartUrl).toEqual(url);
            expect(loadFinishedUrl).toEqual(url);
            expect(navReqUrl).toEqual(url);
            expect(navType).toEqual('Other');
            expect(loadingStatus).toEqual('success');
        });
    });
    it("can set a DOM Element",function() {
        var html = document.createElement('html');
        var body = document.createElement('body');
        body.textContent = 'it works';
        html.appendChild(body);
        webpage.setContent(html, 'http://127.0.0.1:8083/foo.html');
        expect(webpage.title).toEqual('');
        expect(webpage.evaluate(function(){ return document.body.textContent;})).toEqual("it works");
        webpage.close();
    });
});

describe("WebPage.plainText", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/simplehello.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("contains only text of HTML elements",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var content = " Hello World! 你好 ! çàéèç ";
            expect(webpage.plainText).toEqual(content);
            webpage.close();
        });
    });

    it("contains the content of a text page",function() {
        webpage.close();
        var loaded = false;
        runs(function() {
            webpage.open("http://127.0.0.1:8083/hello.txt", function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(webpage.plainText).toEqual("hello I am a file requested by XHR");
            webpage.close();
        });
    });

    it("contains the content of a JSON response",function() {
        webpage.close();
        var loaded = false;
        runs(function() {
            webpage.open("http://127.0.0.1:8083/hello.json", function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var expected = '{\n    "title": "<hello & JSON"\n}';
            expect(webpage.plainText).toEqual(expected);
            webpage.close();
        });
    });

});



describe("WebPage.zoomFactor", function(){
    var webpage;
    var url = "http://127.0.0.1:8082/hello.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("can be retrieved",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(webpage.zoomFactor).toEqual(1);
            webpage.zoomFactor = 1.5;
            expect(webpage.zoomFactor).toEqual(1.5);
            webpage.close();
        });
    });
});



describe("WebPage.open()", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/getHeaders";

    var async = new AsyncSpec(this);
    async.it("can be called with url, httpConf",function(done) {
        webpage = require("webpage").create();
        webpage.open(url, 'get')
        .then(function(success){
            expect(webpage.plainText).toNotEqual('');
            var requestdata = JSON.parse(webpage.plainText);
            expect(requestdata.method).toEqual('GET');
            expect(requestdata.body).toEqual('');
            expect('User-Agent' in requestdata.headers).toBeTruthy();
            expect(requestdata.headers['User-Agent']).toNotEqual('');
            expect(requestdata.headers['Host']).toEqual('127.0.0.1:8083');

            return webpage.open(url, {operation:'get'})
        })
        .then(function(success){
            expect(webpage.plainText).toNotEqual('');
            var requestdata = JSON.parse(webpage.plainText);
            expect(requestdata.method).toEqual('GET');
            expect(requestdata.body).toEqual('');
            expect('User-Agent' in requestdata.headers).toBeTruthy();
            expect(requestdata.headers['User-Agent']).toNotEqual('');
            expect(requestdata.headers['Host']).toEqual('127.0.0.1:8083');

        // POST data
            let content = 'foo=bar&z=3';
            return webpage.open(url,
                            {
                                operation:'post',
                                data: content,
                                headers : {
                                   'Content-Type':'application/x-www-form-urlencoded',
                                   'Content-length': content.length
                                }
                            })
        })
        .then(function(success){
            expect(webpage.plainText).toNotEqual('');
            var requestdata = JSON.parse(webpage.plainText);
            expect(requestdata.method).toEqual('POST');
            expect(requestdata.body).toEqual('foo=bar&z=3');
            expect(requestdata.headers['Content-Type']).toEqual('application/x-www-form-urlencoded');

        // POST data by forcing content type other than urlencoded
            return webpage.open(url,
                            {
                                operation:'post',
                                data: 'hello',
                                headers : {
                                    'X-foo':'bar',
                                    'Content-Type' : 'text/plain',
                                    'Content-length': 5
                                }
                })
        })
        .then(function(success){
            expect(webpage.plainText).toNotEqual('');
            var requestdata = JSON.parse(webpage.plainText);
            expect(requestdata.method).toEqual('POST');
            expect(requestdata.body).toEqual('hello');
            expect(requestdata.headers['Content-Type']).toEqual('text/plain');
            expect(requestdata.headers['X-foo']).toEqual('bar')
            webpage.close();
            done();
        })
    });

    async.it("can be called with (url, httpConf, callback)",function(done) {
        webpage.open(url, 'get', function(success){
            expect(webpage.plainText).toNotEqual('');
            var requestdata = JSON.parse(webpage.plainText);
            expect(requestdata.method).toEqual('GET');
            expect(requestdata.body).toEqual('');
            expect('User-Agent' in requestdata.headers).toBeTruthy();
            expect(requestdata.headers['User-Agent']).toNotEqual('');
            expect(requestdata.headers['Host']).toEqual('127.0.0.1:8083');
            webpage.close();
            done();
        })
    });

    async.it("can be called with (url, operation, data)",function(done) {
        webpage.open(url, 'get', '')
        .then(function(success){
            expect(webpage.plainText).toNotEqual('');
            var requestdata = JSON.parse(webpage.plainText);
            expect(requestdata.method).toEqual('GET');
            expect(requestdata.body).toEqual('');
            expect('User-Agent' in requestdata.headers).toBeTruthy();
            expect(requestdata.headers['User-Agent']).toNotEqual('');
            expect(requestdata.headers['Host']).toEqual('127.0.0.1:8083');

            return webpage.open(url, 'post', 'foo=bar&z=3')
        })
        .then(function(success){
            expect(webpage.plainText).toNotEqual('');
            var requestdata = JSON.parse(webpage.plainText);
            expect(requestdata.method).toEqual('POST');
            expect(requestdata.body).toEqual('foo=bar&z=3');
            expect(requestdata.headers['Content-Type']).toEqual('application/x-www-form-urlencoded');
            webpage.close();
            done();
        })
    });

    async.it("can be called with (url, 'get', data, callback)",function(done) {
        webpage.open(url, 'get', '', function(success){
            expect(webpage.plainText).toNotEqual('');
            var requestdata = JSON.parse(webpage.plainText);
            expect(requestdata.method).toEqual('GET');
            expect(requestdata.body).toEqual('');
            expect('User-Agent' in requestdata.headers).toBeTruthy();
            expect(requestdata.headers['User-Agent']).toNotEqual('');
            expect(requestdata.headers['Host']).toEqual('127.0.0.1:8083');
            webpage.close();
            done();
        })
    });

    async.it("can be called with (url, 'post', data, callback)",function(done) {
        webpage.open(url, 'post', 'foo=bar&z=3', function(success){
            expect(webpage.plainText).toNotEqual('');
            var requestdata = JSON.parse(webpage.plainText);
            expect(requestdata.method).toEqual('POST');
            expect(requestdata.body).toEqual('foo=bar&z=3');
            expect(requestdata.headers['Content-Type']).toEqual('application/x-www-form-urlencoded');
            webpage.close();
            done();
        })
    });

    async.it("can be called with (url, 'get', data, headers, callback)",function(done) {
        webpage.open(url, 'get', '', { 'X-foo':'xbar' }, function(success){
            expect(webpage.plainText).toNotEqual('');
            var requestdata = JSON.parse(webpage.plainText);
            expect(requestdata.method).toEqual('GET');
            expect(requestdata.body).toEqual('');
            expect('User-Agent' in requestdata.headers).toBeTruthy();
            expect(requestdata.headers['User-Agent']).toNotEqual('');
            expect(requestdata.headers['Host']).toEqual('127.0.0.1:8083');
            expect(requestdata.headers['X-foo']).toEqual('xbar');
            webpage.close();
            done();
        })
    });

    async.it("can be called with (url, 'post', data, headers, callback)",function(done) {
        webpage.open(url, 'post', 'foo=bar&z=3',  { 'X-foo':'xbar' }, function(success){
            expect(webpage.plainText).toNotEqual('');
            var requestdata = JSON.parse(webpage.plainText);
            expect(requestdata.method).toEqual('POST');
            expect(requestdata.body).toEqual('foo=bar&z=3');
            expect(requestdata.headers['Content-Type']).toEqual('application/x-www-form-urlencoded');
            expect(requestdata.headers['X-foo']).toEqual('xbar');
            webpage.close();
            done();
        })
    });

});


describe("WebPage.offline*", function(){
    var webpage;

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("offlineStoragePath is not empty",function() {
        expect(webpage.offlineStoragePath).toNotEqual("");
    });

    it("offlineStorageQuota is ok",function() {
        expect(webpage.offlineStorageQuota).toEqual(5120*1024);
        webpage.close();
    });
});


describe("WebPage (misc)", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/navigator.html";

    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("html can use navigator",function() {
        var loaded = false;
        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });

        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            var navError = webpage.evaluate(function(){
                return navigatorIterationError
            });
            expect(navError).toEqual("")
        });
    });

    it("test end", function(){
        webpage.close();
    })
});
