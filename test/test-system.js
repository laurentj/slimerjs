
describe("system module", function() {
    it("should be in a system object", function(){
        expect('system' in slimerEnv).toBeTruthy();
    });
    it("should have a platform property", function(){
        expect('platform' in system).toBeTruthy();
        expect(system.platform).toNotEqual('');
    });
    it("should have a pid property", function(){
        expect('pid' in system).toBeTruthy();
        expect(system.pid).toBeGreaterThan(0);
    });

    it("should have a os object", function(){
        expect('os' in system).toBeTruthy();
        expect('architecture' in system.os).toBeTruthy();
        expect('name' in system.os).toBeTruthy();
        expect('version' in system.os).toBeTruthy();
        expect(system.os.architecture).toNotEqual('');
        expect(system.os.name).toNotEqual('');
        if (system.os.name == 'linux') {
            expect(system.os.isWindows()).toEqual(false);
        }
        else {
            expect(system.os.isWindows()).toEqual(true);
        }
        //expect(system.os.version).toNotEqual(''); // it is '' on some system...
    });

    it("should handle command line arguments", function(){
        expect('args' in system).toBeTruthy();
        expect(system.args.length).toEqual(1);
        expect(/launch-main-tests\.js$/.test(system.args[0])).toBeTruthy();
    });
});
