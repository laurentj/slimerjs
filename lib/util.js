/**
 * @fileoverview Package-private helpers for the installer.
 */

'use strict'

var cp = require('child_process')
var fs = require('fs-extra')
var helper = require('./slimerjs-core')
var kew = require('kew')
var path = require('path')

var DEFAULT_CDN = 'https://github.com/graingert/slimer-downloads/releases/download/'
var libPath = __dirname

/**
 * Given a lib/location file of a PhantomJS previously installed with NPM,
 * try to link the binary to this lib/location.
 * @return {Promise<boolean>} True on success
 */
function maybeLinkLibModule(libPath) {
  return kew.fcall(function () {
    var libModule = require(libPath)
    if (libModule.location &&
        getTargetPlatform() == libModule.platform &&
        getTargetArch() == libModule.arch) {
      var resolvedLocation = path.resolve(path.dirname(libPath), libModule.location)
      if (fs.statSync(resolvedLocation)) {
        return checkSlimerjsVersion(resolvedLocation).then(function (matches) {
          if (matches) {
            writeLocationFile(resolvedLocation)
            console.log('SlimerJS linked at', resolvedLocation)
            return kew.resolve(true)
          }
        })
      }
    }
    return false
  }).fail(function () {
    return false
  })
}

/**
 * Check to make sure a given binary is the right version.
 * @return {kew.Promise.<boolean>}
 */
function checkSlimerjsVersion(slimerPath) {
  console.log('Found SlimerJS at', slimerPath, '...verifying')
  return kew.nfcall(cp.execFile, slimerPath, ['--version']).then(function (stdout) {
    if (stdout.indexOf('SlimerJS ' + helper.version + ',') !== -1) {
      return true
    } else {
      console.log('SlimerJS detected, but wrong version', stdout, '@', slimerPath + '.')
      return false
    }
  }).fail(function (err) {
    console.error('Error verifying slimerjs, continuing', err)
    return false
  })
}

/**
 * Writes the location file with location and platform/arch metadata about the
 * binary.
 */
function writeLocationFile(location) {
  console.log('Writing location.js file')
  if (getTargetPlatform() === 'win32') {
    location = location.replace(/\\/g, '\\\\')
  }

  var platform = getTargetPlatform()
  var arch = getTargetArch()

  var contents = 'module.exports.location = "' + location + '"\n'

  if (/^[a-zA-Z0-9]*$/.test(platform) && /^[a-zA-Z0-9]*$/.test(arch)) {
    contents +=
        'module.exports.platform = "' + getTargetPlatform() + '"\n' +
        'module.exports.arch = "' + getTargetArch() + '"\n'
  }

  fs.writeFileSync(path.join(libPath, 'location.js'), contents)
}

/**
 * @return {string}
 */
function getTargetPlatform() {
  return process.env.SLIMERJS_PLATFORM || process.platform
}

/**
 * @return {string}
 */
function getTargetArch() {
  return process.env.SLIMERJS_ARCH || process.arch
}

module.exports = {
  checkSlimerjsVersion: checkSlimerjsVersion,
  getTargetPlatform: getTargetPlatform,
  getTargetArch: getTargetArch,
  maybeLinkLibModule: maybeLinkLibModule,
  writeLocationFile: writeLocationFile
}