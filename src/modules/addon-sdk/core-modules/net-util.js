// CommonJS wrapper for NetUtil.jsm core module
// https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/NetUtil.jsm

const { Cu } = require('chrome');

Cu.import('resource:///gre/modules/NetUtil.jsm');

exports.NetUtil = NetUtil;
