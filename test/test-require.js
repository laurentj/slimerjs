
describe("CommonJS module", function() {

    it("should have a require function", function(){
        expect('require' in slimerEnv).toBeTruthy();
        expect(typeof require).toEqual('function');
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
    it("should import exported variable of requiredexample module"), function(){
        expect('ex' in slimerEnv).toBeTruthy();
        expect(ex.myExample).toEqual("foo");
        expect(ex.myCalcFunc(2)).toEqual(5);
    }

    it("should import exported variable of a/b module"), function(){
        expect(m.identity.firstName).toEqual("Laurent");
    }
});