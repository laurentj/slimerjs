


describe("web objects", function() {

    it("should have a window object", function(){
        expect('window' in slimerEnv).toBeTruthy();
    });

    it("should have a document object", function(){
        expect('document' in slimerEnv).toBeTruthy();
    });

    it("should have a window.document object", function(){
        expect('document' in slimerEnv.window).toBeTruthy();
    });

    it("should have a console object", function(){
        expect('console' in slimerEnv).toBeTruthy();
    });

    it("should have a alert object", function(){
        expect('alert' in slimerEnv).toBeTruthy();
    });

    it("should have a confirm object", function(){
        expect('confirm' in slimerEnv).toBeTruthy();
    });

    it("should have a setTimeout object", function(){
        expect('setTimeout' in slimerEnv).toBeTruthy();
    });

    it("should have a setInterval object", function(){
        expect('setInterval' in slimerEnv).toBeTruthy();
    });
});

describe("phantom object", function() {

    it("should exists", function(){
        expect('phantom' in slimerEnv).toBeTruthy();
    });

    it("should have a right version", function(){
        expect(phantom.version.major).toEqual(1);
        expect(phantom.version.minor).toEqual(8);
        expect(phantom.version.patch).toEqual(1);
    });

});

if ("slimer" in this) {
    describe("slimer object", function() {

        it("should exists", function(){
            expect('slimer' in slimerEnv).toBeTruthy();
        });

        it("should have a right version", function(){
            expect(slimer.version.major).toEqual(0);
            expect(slimer.version.minor).toEqual(0);
            expect(slimer.version.patch).toEqual(4);
        });

    });
}
else {
    xdescribe("slimer object", function() {
        xit("should exists", function(){
            expect('slimer' in slimerEnv).toBeTruthy();
        });
    });
}



