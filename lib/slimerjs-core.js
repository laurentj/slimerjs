/**
 * Helpers made available when requiring this package.
 */
var fs = require('fs')
var path = require('path')


/**
 * Where the slimerjs binary can be found.
 */
try {
  var location = require('./location')
  exports.path = path.resolve(__dirname, location.location)
  exports.platform = location.platform
  exports.arch = location.arch
} catch(e) {
  // Must be running inside install script.
  exports.path = null
}


/**
 * The version of firefox installed by this package.
 * @type {number}
 */
exports.version = '46.0.0'


/**
 * Returns a clean path that helps avoid `which` finding bin files installed
 * by NPM for this repo.
 * @param {string} path
 * @return {string}
 */
exports.cleanPath = function (path) {
  return path
      .replace(/:[^:]*node_modules[^:]*/g, '')
      .replace(/(^|:)\.\/bin(\:|$)/g, ':')
      .replace(/^:+/, '')
      .replace(/:+$/, '')
}


// Make sure the binary is executable.  For some reason doing this inside
// install does not work correctly, likely due to some NPM step.
if (exports.path) {
  try {
    // avoid touching the binary if it's already got the correct permissions
    var st = fs.statSync(exports.path)
    var mode = st.mode | parseInt('0555', 8)
    if (mode !== st.mode) {
      fs.chmodSync(exports.path, mode)
    }
  } catch (e) {
    // Just ignore error if we don't have permission.
    // We did our best. Likely because firefox was already installed.
  }
}
