// CommonJS wrapper for Task.jsm core module
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Task.jsm
const { Cu } = require('chrome');

Cu.import("resource://gre/modules/Task.jsm");

exports.Task = Task;
