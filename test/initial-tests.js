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

assertEquals("0.0.2", slimer.version, "slimer has the good version");
assertEquals("1.7.0", phantom.version, "phantom has the good version");

dump('\nEND of tests\n');


