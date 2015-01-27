// Wrapper for ISO8601DateUtils.jsm core module 
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/ISO8601DateUtils.jsm
const { Cu } = require('chrome');

Cu.import("resource://gre/modules/ISO8601DateUtils.jsm");

exports.ISO8601DateUtils = ISO8601DateUtils;
