/*

this is a simple test file.
Since we cannot load external file yet, tests are very very basic
*/
dump('Initial tests\n');

function assertExists(arg, title) {
    dump(title+" ")
    if (arg) {
        dump("OK\n");
    }
    else
        dump("FAIL\n");
}

function assertEquals(expected, result, title) {
    dump(title+" ")
    if (expected == result) {
        dump("OK\n");
    }
    else
        dump("FAIL\n");
}



assertExists(window, "has window object? ");
assertExists(document, "has document object? ");
assertExists(window.document, "has window.document object? ");
assertExists(console, "has console object? ");
assertExists(alert, "has alert object? ");
assertExists(confirm, "has alert object? ");
dump('Message console should be "log ok": ');
console.log('log ok');

assertExists(slimer, "has slimer object? ");
assertExists(phantom, "has phantom object? ");

assertExists(slimer.version, "has slimer.version object? ");

assertEquals("0", slimer.version.major, "slimer has the good major version");
assertEquals("0", slimer.version.minor, "slimer has the good minor version");
assertEquals("2", slimer.version.patch, "slimer has the good patch version");
assertEquals("1", phantom.version.major, "phantom has the good major version");
assertEquals("7", phantom.version.minor, "phantom has the good minor version");
assertEquals("0", phantom.version.patch, "phantom has the good patch version");

dump('\nEND of tests\n');

slimer.exit()


