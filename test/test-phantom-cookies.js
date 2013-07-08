
describe("phantom object", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/getCookies";
    var futureDateInSecond = Math.ceil((new Date()).getTime() / 1000)+ 60 * 60;
    var futureDate = futureDateInSecond * 1000;
    var expectedCookies = [];
    function checkCookie(c) {
        var cookie = expectedCookies[c.name];
        cookie.expires = c.expires // we don't test expires, because the format depends of system langage
        if (c.name == 'UserID') {
            cookie.expiry = c.expiry
            expect(c.expiry > Math.ceil((new Date()).getTime() / 1000) +3500 ).toBeTruthy();
        }
        else
            cookie.expiry = futureDateInSecond;
        expect(c).toEqual(cookie);
    }
    
    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("can set cookies",function() {
        var loaded = false;

        runs(function() {
            phantom.cookies = [
                {
                    'name':     'foo',
                    'value':    'bar',
                    'domain':   '127.0.0.1',
                    'path':     '/',
                    'httponly': true,
                    'secure':   false,
                    'expiry':  futureDate
                },
                {
                    'name':     'specificpath',
                    'value':    'notretrieved',
                    'domain':   '127.0.0.1',
                    'path':     '/foo/bar/',
                    'httponly': true,
                    'secure':   false,
                    'expiry':  futureDate
                },
                {
                    'name':     'forexample',
                    'value':    'notretrieved',
                    'domain':   'example.com',
                    'path':     '/',
                    'httponly': true,
                    'secure':   false,
                    'expiry':  futureDate
                }
            ];

            webpage.open(url, function(success){
                loaded = true;
            });
        });
        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(phantom.cookiesEnabled).toBeTruthy();
            var headers = JSON.parse(webpage.plainText)
            expect("Cookie" in headers).toBeTruthy();
            expect(headers.Cookie).toEqual("foo=bar");
        });
    });

    it("can read cookies",function() {

        expectedCookies = {
            'forexample' : {
                    'name':     'forexample',
                    'value':    'notretrieved',
                    'domain':   'example.com',
                    'path':     '/',
                    'httponly': true,
                    'secure':   false
                },
            'foo' : {
                    'name':     'foo',
                    'value':    'bar',
                    'domain':   '127.0.0.1',
                    'path':     '/',
                    'httponly': true,
                    'secure':   false
                },
            'specificpath': {
                    'name':     'specificpath',
                    'value':    'notretrieved',
                    'domain':   '127.0.0.1',
                    'path':     '/foo/bar/',
                    'httponly': true,
                    'secure':   false
                },
            'UserID': {
                    'name':     'UserID',
                    'value':    'JohnDoe',
                    'domain':   '127.0.0.1',
                    'path':     '/',
                    'httponly': false,
                    'secure':   false
            }
        }

        var cookies = phantom.cookies;
        expect(cookies.length).toEqual(4);
        checkCookie(cookies[0]);
        checkCookie(cookies[1]);
        checkCookie(cookies[2]);
        checkCookie(cookies[3]);
    });

    it("can delete a cookie",function() {
        phantom.deleteCookie("forexample");
        
        expectedCookies = {
            'foo' : {
                    'name':     'foo',
                    'value':    'bar',
                    'domain':   '127.0.0.1',
                    'path':     '/',
                    'httponly': true,
                    'secure':   false
                },
            'specificpath': {
                    'name':     'specificpath',
                    'value':    'notretrieved',
                    'domain':   '127.0.0.1',
                    'path':     '/foo/bar/',
                    'httponly': true,
                    'secure':   false
                },
            'UserID': {
                    'name':     'UserID',
                    'value':    'JohnDoe',
                    'domain':   '127.0.0.1',
                    'path':     '/',
                    'httponly': false,
                    'secure':   false
            }
        }

        var cookies = phantom.cookies;
        expect(cookies.length).toEqual(3);
        checkCookie(cookies[0]);
        checkCookie(cookies[1]);
        checkCookie(cookies[2]);
        webpage.close();
    });
    
     it("can delete all cookies",function() {
        phantom.clearCookies();
        var cookies = phantom.cookies;
        expect(cookies.length).toEqual(0);

        
     });

    it("can disable cookies",function() {
        var loaded = false;
        phantom.cookiesEnabled = false;

        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });
        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){
            expect(phantom.cookiesEnabled).toBeFalsy();
            expect(phantom.cookies.length).toEqual(0);
            webpage.close();
            phantom.cookiesEnabled = true;
        });
    });
});

