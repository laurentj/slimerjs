
describe("webpage object", function(){
    var webpage;
    var url = "http://127.0.0.1:8083/getCookies";
    var futureDateInSecond = Math.ceil((new Date()).getTime() / 1000)+ 60 * 60;
    var futureDate = futureDateInSecond * 1000;
    var expectedCookies = [];

    var cookie1 = {
        'name':     'foo',
        'value':    'bar',
        'domain':   '127.0.0.1',
        'path':     '/',
        'httponly': true,
        'secure':   false,
        'expiry':  futureDate
    };

    var cookie2 = {
        'name':     'specificpath',
        'value':    'notretrieved',
        'domain':   '127.0.0.1',
        'path':     '/foo/bar/',
        'httponly': false,
        'secure':   false,
        'expiry':  futureDate
    }

    var cookie3 = {
        'name':     'forexample',
        'value':    'notretrieved',
        'domain':   'example.com',
        'path':     '/',
        'httponly': true,
        'secure':   false,
        'expiry':  futureDate
    }
    var cookie4 = {
        'name':     'sessioncookie',
        'value':    'bob',
        'domain':   '127.0.0.1',
        'path':     '/',
        'httponly': true,
        'secure':   false,
        'expiry':  null
    }

    var cookiesToSet = [
        cookie1,
        cookie2,
        cookie3,
        cookie4
    ];
    
    
    function checkCookie(c, checkDate) {
        expect(c.name in expectedCookies).toBeTruthy("cookie "+c.name+" is not expected");
        var cookie = expectedCookies[c.name];
        expect((c.expires === null) || (typeof c.expires == 'string')).toBeTruthy();
        cookie.expires = c.expires // we don't test expires, because the format depends of system langage
        
        if (c.name == 'UserID') {
            cookie.expiry = c.expiry
            expect(c.expiry > Math.ceil((new Date()).getTime() / 1000) +3500 ).toBeTruthy();
        }
        else if (!('expiry' in cookie)) {
            cookie.expiry = futureDateInSecond;
        }
        expect(c).toEqual(cookie);
    }
    
    beforeEach(function() {
        if (webpage) {
            return;
        }
        webpage = require("webpage").create();
    });

    it("don't set cookies on not loaded webpage",function() {
        phantom.clearCookies();
        webpage.cookies = cookiesToSet;
        expect(webpage.cookies.length).toEqual(0);
    });
/*
    it("set cookies on setted content/uri",function() {
        webpage.setContent('<html><body>hello</body></html>', 'http://foo.bar/hello/world');
        webpage.cookies = cookiesToSet;

        var cookies = webpage.cookies;
        expect(webpage.cookies.length).toEqual(3);

        expectedCookies = {
            'forexample' : {
                    'name':     'forexample',
                    'value':    'notretrieved',
                    'domain':   'foo.bar',
                    'path':     '/hello/world',
                    'httponly': true,
                    'secure':   false
                },
            'foo' : {
                    'name':     'foo',
                    'value':    'bar',
                    'domain':   'foo.bar',
                    'path':     '/hello/world',
                    'httponly': true,
                    'secure':   false
                },
            'specificpath': {
                    'name':     'specificpath',
                    'value':    'notretrieved',
                    'domain':   'foo.bar',
                    'path':     '/hello/world',
                    'httponly': true,
                    'secure':   false
                },
        }
        checkCookie(cookies[0]);
        checkCookie(cookies[1]);
        checkCookie(cookies[2]);
    });*/

    it("can read cookies",function() {
        var loaded = false;

        runs(function() {
            webpage.open(url, function(success){
                loaded = true;
            });
        });
        waitsFor(function(){ return loaded;}, 1000);
        runs(function(){

            phantom.addCookie(cookie1);
            phantom.addCookie(cookie2);
            phantom.addCookie(cookie3);
            phantom.addCookie(cookie4);

            expectedCookies = {
                'foo' : {
                        'name':     'foo',
                        'value':    'bar',
                        'domain':   '127.0.0.1',
                        'path':     '/',
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
                },
                'sessioncookie' : {
                    'name':     'sessioncookie',
                    'value':    'bob',
                    'domain':   '127.0.0.1',
                    'path':     '/',
                    'httponly': true,
                    'secure':   false,
                    'expiry':  null
                }
            }
            
            var cookies = webpage.cookies;
            expect(cookies.length).toEqual(3);
            checkCookie(cookies[0]);
            checkCookie(cookies[1]);
            checkCookie(cookies[2]);
        });
    });

    it("can delete a cookie",function() {
        webpage.deleteCookie("UserID");
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
                    'httponly': false,
                    'secure':   false
                },
            'sessioncookie' : {
                    'name':   'sessioncookie',
                    'value':    'bob',
                    'domain':   '127.0.0.1',
                    'path':     '/',
                    'httponly': true,
                    'secure':   false,
                    'expiry' : null
            }
        }

        var cookies = phantom.cookies;
        expect(cookies.length).toEqual(4);
        checkCookie(cookies[0]);
        checkCookie(cookies[1]);
        checkCookie(cookies[2]);
        checkCookie(cookies[3]);

        expectedCookies = {
            'foo' : {
                    'name':     'foo',
                    'value':    'bar',
                    'domain':   '127.0.0.1',
                    'path':     '/',
                    'httponly': true,
                    'secure':   false
                },
            'sessioncookie' : {
                'name':   'sessioncookie',
                'value':    'bob',
                'domain':   '127.0.0.1',
                'path':     '/',
                'httponly': true,
                'secure':   false,
                'expiry' : null
            }
        }

        cookies = webpage.cookies;
        expect(cookies.length).toEqual(2);
        checkCookie(cookies[0]);
        checkCookie(cookies[1]);
    });
    
     it("can delete all cookies",function() {
        webpage.clearCookies();
        expectedCookies = {
            'forexample' : {
                    'name':     'forexample',
                    'value':    'notretrieved',
                    'domain':   'example.com',
                    'path':     '/',
                    'httponly': true,
                    'secure':   false
                },
            'specificpath': {
                    'name':     'specificpath',
                    'value':    'notretrieved',
                    'domain':   '127.0.0.1',
                    'path':     '/foo/bar/',
                    'httponly': false,
                    'secure':   false
                }
        }
        var cookies = phantom.cookies;
        expect(cookies.length).toEqual(2);
        checkCookie(cookies[0]);
        checkCookie(cookies[1]);
        webpage.close();
     });

});

