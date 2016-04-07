/*
 * Jasmine reports which writes TAP text files.
 * 
 * This uses the "fs" module.
 */
 
jasmine.TAPReporter = function(tap_filename) {
    var fs = require("fs");

    var num_tests = 0;
    var test_results = []; // list of objects.

    this.reportSpecStarting = function(spec) {
        num_tests += 1;
    };
    
    this.reportSpecResults = function(spec) {
        var results = spec.results();
        var title = spec.suite.description + ': ' + spec.description;
        var ok = results.passed();        
        test_results.push( {
            "name" : title, "ok": ok }
            );
    };
    
    this.reportRunnerResults = function(runner) {
        try {
            // Create parent directory if necessary.
            try {
                fs.makeDirectory(fs.directory(tap_filename));
            } catch (e) { /* ignore */ }
            // Try to open the file.
            var f = fs.open(tap_filename, 'w');
        } catch(e) {
            // opening file failed, even if we created the dir.
            console.log("TAPReporter: failed to write " + tap_filename);
            return;
        }
        f.write("1.." + num_tests + "\n"); // e.g. 1..10
        var i=1;
        for (var res of test_results) {
            if (res.ok) {
                f.write("ok " + i + " " + res.name + "\n");
            } else {
                f.write("not ok " + i + " " + res.name + "\n");
            }
            i += 1;
        }
        f.close();
    };
}
