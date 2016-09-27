


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
        expect(phantom.version.patch).toEqual(8);
    });

    it("should contain the script name", function(){
        expect(phantom.scriptName.substr(-20,20)).toEqual("launch-main-tests.js");
    });

    it("should have a defaultPageSettings property", function() {
        expect(phantom.defaultPageSettings.allowMedia).toBeTruthy();
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

    it("resolveRelativeUrl", function() {
        expect(phantom.resolveRelativeUrl(
                            "../scripts/foo.js",
                            "http://example.com/topic/page.html"))
            .toEqual("http://example.com/scripts/foo.js");
    });

    it("fullyDecodeUrl", function() {
        expect(phantom.fullyDecodeUrl("https://ja.wikipedia.org/wiki/%E8%87%A8%E6%B5%B7%E5%AD%A6%E6%A0%A1"))
            .toEqual("https://ja.wikipedia.org/wiki/臨海学校");
    });
});

if ("slimer" in this) {
    describe("slimer object", function() {

        it("should exists", function(){
            expect('slimer' in slimerEnv).toBeTruthy();
        });

        it("should have a right version", function(){
            expect(slimer.version.major).toEqual(1);
            expect(slimer.version.minor).toEqual(0);
            expect(slimer.version.patch).toEqual(0);
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



