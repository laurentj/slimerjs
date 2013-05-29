
describe("CommonJS module", function() {

    it("should have a require function", function(){
        expect('require' in slimerEnv).toBeTruthy();
        expect(typeof require).toEqual('function');
        expect("paths" in require).toBeTruthy();
    });

    it("should have a module object", function(){
        expect('module' in slimerEnv).toBeTruthy();
        expect(module.uri).toNotEqual("");
        expect(module.id).toEqual("main");
    });
});


var ex = require('./requiredexample');
var m = require('./a/b');

describe("require function", function() {
    it("should import exported variable of requiredexample module", function(){
        expect('ex' in slimerEnv).toBeTruthy();
        expect(ex.myExample).toEqual("foo");
        expect(ex.myCalcFunc(2)).toEqual(5);
    });

    it("should import exported variable of a/b module", function(){
        expect(m.identity.firstName).toEqual("Laurent");
    });

    it("has a modification in paths and can read a module in an other path", function(){
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

    it("provides a globals property", function() {
        require("a/defineglobal");
        var access = require("a/accessglobal");
        expect(access.accessToGlobalFunction).toEqual("result from a global function")
    })
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
        var sample = require('cs/sample')
        expect(sample.label).toEqual('sample module 1');
        var sample2 = require('cs/sample2.coffee')
        expect(sample2.label).toEqual('sample module 2');
    });
    it("can load Json modules", function(){
        var sample = require('a/something.json')
        //var sample = require('a/ddd.js')
        expect(sample.foo).toEqual('bar');
        expect(sample.hello).toEqual('world');
    });


});