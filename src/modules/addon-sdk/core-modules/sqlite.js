// CommonJS wrapper for Sqlite.jsm core module 
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Sqlite.jsm
const { Cu } = require('chrome');

Cu.import("resource://gre/modules/Sqlite.jsm")

exports.Sqlite = Sqlite;
