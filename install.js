// Copyright 2012 The Obvious Corporation.

/*
 * This simply fetches the right version of slimer for the current platform.
 */

'use strict'

var cp = require('child_process')
var fs = require('fs-extra')
var helper = require('./lib/slimerjs-core')
var kew = require('kew')
var path = require('path')
var request = require('request')
var url = require('url')
var util = require('./lib/util')
var which = require('which')

var originalPath = process.env.PATH

var checkSlimerjsVersion = util.checkSlimerjsVersion
var getTargetPlatform = util.getTargetPlatform
var getTargetArch = util.getTargetArch
var maybeLinkLibModule = util.maybeLinkLibModule
var writeLocationFile = util.writeLocationFile

// If the process exits without going through exit(), then we did not complete.
var validExit = false

process.on('exit', function () {
  if (!validExit) {
    console.log('Install exited unexpectedly')
    exit(1)
  }
})

// NPM adds bin directories to the path, which will cause `which` to find the
// bin for this package not the actual slimerjs bin.  Also help out people who
// put ./bin on their path
process.env.PATH = helper.cleanPath(originalPath)

var libPath = path.join(__dirname, 'lib')
var pkgPath = path.join(__dirname, 'src')
var slimerPath = null

// If the user manually installed SlimerJS, we want
// to use the existing version.
//
// Do not re-use a manually-installed SlimerJS with
// a different version.
//
// Do not re-use an npm-installed SlimerJS, because
// that can lead to weird circular dependencies between
// local versions and global versions.
// https://github.com/Obvious/phantomjs/issues/85
// https://github.com/Medium/phantomjs/pull/184
kew.resolve(true)
  .then(trySlimerjsInLib)
  .then(trySlimerjsOnPath)
  .then(function () {
    var location = getTargetPlatform() === 'win32' ?
        path.join(pkgPath, 'slimerjs.bat') :
        path.join(pkgPath, 'slimerjs')

    try {
      // Ensure executable is executable by all users
      fs.chmodSync(location, '755')
    } catch (err) {
      if (err.code == 'ENOENT') {
        console.error('chmod failed: slimerjs was not successfully copied to', location)
        exit(1)
      }
      throw err
    }

    var relativeLocation = path.relative(libPath, location)
    writeLocationFile(relativeLocation)

    console.log('Done. SlimerJS binary available at', location)
    exit(0)
  })
  .fail(function (err) {
    console.error('Slimer installation failed', err, err.stack)
    exit(1)
  })

function exit(code) {
  validExit = true
  process.env.PATH = originalPath
  process.exit(code || 0)
}


function findSuitableTempDirectory() {
  var now = Date.now()
  var candidateTmpDirs = [
    process.env.TMPDIR || process.env.TEMP || process.env.npm_config_tmp,
    '/tmp',
    path.join(process.cwd(), 'tmp')
  ]

  for (var i = 0; i < candidateTmpDirs.length; i++) {
    var candidatePath = path.join(candidateTmpDirs[i], 'slimerjs')

    try {
      fs.mkdirsSync(candidatePath, '0777')
      // Make double sure we have 0777 permissions; some operating systems
      // default umask does not allow write by default.
      fs.chmodSync(candidatePath, '0777')
      var testFile = path.join(candidatePath, now + '.tmp')
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
      return candidatePath
    } catch (e) {
      console.log(candidatePath, 'is not writable:', e.message)
    }
  }

  console.error('Can not find a writable tmp directory, please report issue ' +
      'on https://github.com/graingert/slimerjs/issues with as much ' +
      'information as possible.')
  exit(1)
}

function handleRequestError(error) {
  if (error && error.stack && error.stack.indexOf('SELF_SIGNED_CERT_IN_CHAIN') != -1) {
      console.error('Error making request, SELF_SIGNED_CERT_IN_CHAIN. ' +
          'Please read https://github.com/graingert/slimerjs#i-am-behind-a-corporate-proxy-that-uses-self-signed-ssl-certificates-to-intercept-encrypted-traffic')
      exit(1)
  } else if (error) {
    console.error('Error making request.\n' + error.stack + '\n\n' +
        'Please report this full log at https://github.com/graingert/slimerjs')
    exit(1)
  } else {
    console.error('Something unexpected happened, please report this full ' +
        'log at https://github.com/graingert/slimerjs')
    exit(1)
  }
}

/**
 * Check to see if the binary in lib is OK to use. If successful, exit the process.
 */
function trySlimerjsInLib() {
  return kew.fcall(function () {
    return maybeLinkLibModule(path.resolve(__dirname, './lib/location.js'))
  }).then(function (success) {
    if (success) exit(0)
  }).fail(function () {
    // silently swallow any errors
  })
}

/**
 * Check to see if the binary on PATH is OK to use. If successful, exit the process.
 */
function trySlimerjsOnPath() {
  if (getTargetPlatform() != process.platform || getTargetArch() != process.arch) {
    console.log('Building for target platform ' + getTargetPlatform() + '/' + getTargetArch() +
                '. Skipping PATH search')
    return kew.resolve(false)
  }

  return kew.nfcall(which, 'slimerjs')
  .then(function (result) {
    slimerPath = result
    console.log('Considering SlimerJS found at', slimerPath)

    // Horrible hack to avoid problems during global install. We check to see if
    // the file `which` found is our own bin script.
    if (slimerPath.indexOf(path.join('npm', 'slimerjs')) !== -1) {
      console.log('Looks like an `npm install -g` on windows; skipping installed version.')
      return
    }

    var contents = fs.readFileSync(slimerPath, 'utf8')
    if (/NPM_INSTALL_MARKER/.test(contents)) {
      console.log('Looks like an `npm install -g`')

      return maybeLinkLibModule(path.resolve(fs.realpathSync(slimerPath), '../../lib/location'))
      .then(function (success) {
        if (success) exit(0)
        console.log('Could not link global install, skipping...')
      })
    } else {
      return checkSlimerjsVersion(slimerPath).then(function (matches) {
        if (matches) {
          writeLocationFile(slimerPath)
          console.log('SlimerJS is already installed on PATH at', slimerPath)
          exit(0)
        }
      })
    }
  }, function () {
    console.log('SlimerJS not found on PATH')
  })
  .fail(function (err) {
    console.error('Error checking path, continuing', err)
    return false
  })
}
