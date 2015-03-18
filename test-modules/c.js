
// Try to load a module inside the original module path : test/a/other.js
var other = require("a/other.js")


exports.cIsLoaded = 'yes'
exports.identity = new other.Identity('bob')
