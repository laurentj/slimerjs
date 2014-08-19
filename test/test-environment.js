


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
        expect(phantom.version.minor).toEqual(9);
        expect(phantom.version.patch).toEqual(2);
    });

    it("should contain the script name", function(){
        expect(phantom.scriptName.substr(-13,13)).toEqual("main-tests.js");
    });

    it("should have a defaultPageSettings property", function() {
        expect(phantom.defaultPageSettings.javascriptEnabled).toBeTruthy();
        expect(phantom.defaultPageSettings.loadImages).toBeTruthy();
        expect(phantom.defaultPageSettings.localToRemoteUrlAccessEnabled).toBeFalsy();
        expect(phantom.defaultPageSettings.XSSAuditingEnabled).toBeFalsy();
        expect(phantom.defaultPageSettings.webSecurityEnabled).toBeTruthy();
        expect(phantom.defaultPageSettings.javascriptCanOpenWindows).toBeTruthy();
        expect(phantom.defaultPageSettings.javascriptCanCloseWindows).toBeTruthy();
        expect(phantom.defaultPageSettings.userName).toEqual(undefined);
        expect(phantom.defaultPageSettings.password).toEqual(undefined);
        expect(phantom.defaultPageSettings.userAgent).not.toEqual('');
        expect(phantom.defaultPageSettings.maxAuthAttempts).toEqual(undefined);
        expect(phantom.defaultPageSettings.resourceTimeout).toEqual(undefined);

        // defaultPageSettings is supposed to be read only
        phantom.defaultPageSettings = {
            javascriptEnabled: false,
            userName: 'laurent'
        };
        expect(phantom.defaultPageSettings.javascriptEnabled).toBeTruthy();
        expect(phantom.defaultPageSettings.loadImages).toBeTruthy();
        expect(phantom.defaultPageSettings.userName).toEqual(undefined);
        
        phantom.defaultPageSettings.userName = 'laurent';
        expect(phantom.defaultPageSettings.userName).toEqual(undefined);
    });
});

if ("slimer" in this) {
    describe("slimer object", function() {

        it("should exists", function(){
            expect('slimer' in slimerEnv).toBeTruthy();
        });

        it("should have a right version", function(){
            expect(slimer.version.major).toEqual(0);
            expect(slimer.version.minor).toEqual(9);
            expect(slimer.version.patch).toEqual(3);
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



