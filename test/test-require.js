
describe("CommonJS module", function() {

    it("should have a require function", function(){
        expect('require' in slimerEnv).toBeTruthy();
        expect(typeof require).toEqual('function');
        expect("paths" in require).toBeTruthy();
    });

    it("should have a module object", function(){
        // FIXME: this test should be false, as in phantomjs, there is no module
        // object, since in PhantomJS, an injected script is injected in the window context, not in the module context....
        expect('module' in slimerEnv).toBeTruthy();
        expect(module.uri).toNotEqual("");
        expect(module.id).toEqual("main");
    });
});

var ex = require('./requiredexample');
var m = require('./a/b');

describe("require function", function() {

    it("should be able to load modules from the main script directory", function(){
        var ok = false;
        try {
            var a = require('module_a');
            ok = true;
        } catch(e) {
            ok = false;
        }

        expect(ok).toBeTruthy();

        var a = require('./module_a');
        expect(a.result).toEqual("okay loaded world");
    });

    it("should import exported variable of requiredexample module", function(){
        expect('ex' in slimerEnv).toBeTruthy();
        expect(ex.myExample).toEqual("foo");
        expect(ex.myCalcFunc(2)).toEqual(5);
    });

    it("should import exported variable of a/b module", function(){
        expect(m.identity.firstName).toEqual("Laurent");
    });

    it("has a modification in paths and can read a module in an other absolute path", function(){
        var path = fs.absolute(phantom.libraryPath + '/../test-modules/');
        require.paths.push (path);
        var b = require('b');
        expect(b.bIsLoaded).toEqual('yes');
        expect(b.cIsLoaded).toEqual('yes');
        expect(b.idName).toEqual('bob');
        var e= require('d/e');
        expect(e.readedFromF).toEqual('var of f');
        // remove the path now...
        require.paths.pop();
        var ok = false;
        try {
            var b = require('b');
        }
        catch(e) {
            // the b module should not be found
            ok = true;
        }
        expect(ok).toBeTruthy()
    });

    it("has a modification in paths and can read a module in an other relative path", function(){
        var path = '../test-modules/';
        require.paths.push (path);
        var b = require('b');
        expect(b.bIsLoaded).toEqual('yes');
        expect(b.cIsLoaded).toEqual('yes');
        expect(b.idName).toEqual('bob');
        var e= require('d/e');
        expect(e.readedFromF).toEqual('var of f');
        // remove the path now...
        require.paths.pop();
        var ok = false;
        try {
            var b = require('b');
        }
        catch(e) {
            // the b module should not be found
            ok = true;
        }
        expect(ok).toBeTruthy()
    });

    it("provides a globals property", function() {
        require("./a/defineglobal");
        var access = require("./a/accessglobal");
        expect(access.accessToGlobalFunction).toEqual("result from a global function")
    });

    it("should able to load a module from a relative path in paths without a dot", function() {
        require.paths.push("injectrequire/"); // not "./injectrequire"
        phantom.injectJs("injectrequire/script.js");
        require.paths.pop();
        expect(requireIntoInjectedScript.myinclude).toEqual('ok');
    });

    it("should be able to load the chrome module", function() {
        const { Cc, Ci, Cu, Cr } = require('chrome');
        expect(Cc).not.toBe(null);
        expect(Ci).not.toBe(null);
        expect(Cu).not.toBe(null);
        expect(Cr).not.toBe(null);
        expect(Cc).toBeDefined();
        expect(Ci).toBeDefined();
        expect(Cu).toBeDefined();
        expect(Cr).toBeDefined();
    });
});

describe("the loaded module requiredexample", function() {

    it("should have access to all expected global objects", function(){
        expect(ex.hasWindowObject).toBeTruthy();
        expect(ex.hasDocumentObject ).toBeTruthy();
        expect(ex.hasConsoleObject).toBeTruthy();
        expect(ex.hasAlertFunction).toBeTruthy();
        expect(ex.hasConfirmFunction).toBeTruthy();
        expect(ex.hasPhantomObject).toBeTruthy();
    });
});


describe("The module loader", function() {

    it("can load Coffee-Script modules", function(){
        var sample = require('./cs/sample')
        expect(sample.label).toEqual('sample module 1');
        var sample2 = require('./cs/sample2.coffee')
        expect(sample2.label).toEqual('sample module 2');
    });
    it("can load Json modules", function(){
        var sample = require('./a/something.json')
        expect(sample.foo).toEqual('bar');
        expect(sample.hello).toEqual('world');
    });


});
