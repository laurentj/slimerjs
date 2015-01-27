// CommonJS wrapper for FileUtils.jsm core module
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/FileUtils.jsm
const { Cu } = require('chrome');

Cu.import("resource://gre/modules/FileUtils.jsm");

exports.FileUtils = FileUtils;
