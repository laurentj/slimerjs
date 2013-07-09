/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var EXPORTED_SYMBOLS = ["slConfiguration"];

const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;

Cu.import('resource://slimerjs/slErrorLogger.jsm');

var defaultUA =  Cc["@mozilla.org/network/protocol;1?name=http"]
                      .getService(Ci.nsIHttpProtocolHandler)
                      .userAgent;

var optionsSpec = {
    // name: [ 'cmdline option name', 'parser function name', 'default value',  supported],
    cookiesFile : ['cookies-file', 'file', '', false],
    diskCacheEnabled : ['disk-cache', 'bool', false, false],
    maxDiskCacheSize : ['max-disk-cache-size', 'int', -1, false],
    ignoreSslErrors : ['ignore-ssl-errors', 'bool', false, false],
    loadImages: ['load-images', 'bool', true, true],
    localToRemoteUrlAccessEnabled : ['local-to-remote-url-access', 'bool', false, false],
    outputEncoding : ['output-encoding', 'encoding', 'UTF-8', false],
    proxyType : ['proxy-type', 'proxytype', 'http', false],
    proxy : ['proxy', 'proxy', null, false],
    proxyHost : ['', '', '', false],
    proxyPort : ['', '', 1080, false],
    proxyAuth : ['proxy-auth', 'proxyauth', null, false],
    proxyAuthUser : ['', '', '', false],
    proxyAuthPassword : ['', '', '', false],
    scriptEncoding : ['script-encoding', 'encoding', 'UTF-8', false],
    webSecurityEnabled : ['web-security', 'bool', true, false],
    offlineStoragePath : ['local-storage-path', 'file', '', false],
    offlineStorageDefaultQuota : ['local-storage-quota', 'int', -1, false],
    printDebugMessages : ['debug', 'bool', false, false],
    javascriptCanOpenWindows : ['', '', true, false],
    javascriptCanCloseWindows : ['', '', true, false],
    remoteDebuggerPort : ['remote-debugger-port', 'int', -1, false],
    remoteDebuggerAutorun : ['remote-debugger-autorun', 'bool', false, false],
    sslProtocol : ['ssl-protocol', 'ssl', 'sslv3', false],
    sslCertificatesPath : ['ssl-certificates-path', 'path', '', false],
    webdriver : [['webdriver', 'wd','w'], 'webdriver', null, false],
    webdriverIp : ['', '', '127.0.0.1', false],
    webdriverPort : ['', '', '8910', false],
    webdriverLogFile : ['webdriver-logfile', 'file', '', false],
    webdriverLogLevel : ['webdriver-loglevel', 'loglevel', 'INFO', false],
    webdriverSeleniumGridHub : ['webdriver-selenium-grid-hub', 'url', '', false],
};

var slConfiguration = {

    /**
     * list of script arguments
     */
    args : [],

    /**
     * @var nsIFile
     */
    scriptFile: null,

    /**
     * @var nsIFile
     */
    workingDirectory: null,

    setEnvNames : function(envvars) {
        this.envs = envvars.filter(function(element, index, array) {
            return /^[a-z0-9_]+$/i.test(element);
        });
    },

    /**
     * list of environment variable name
     */
    envs : [],

    handleFlags : function(cmdline) {

        let filename = cmdline.handleFlagWithParam("error-log-file", false);
        if (filename) {
            initErrorLogger(filename, this.workingDirectory);
        }

        for (let opt in optionsSpec) {
            let [ cmdlineOpt, parser, defaultValue, supported] = optionsSpec[opt];
            if (cmdlineOpt == '')
                continue;
            let optValue = cmdline.handleFlagWithParam(cmdlineOpt, false);
            if (optValue) {
                if (!supported) {
                    dump("--"+cmdlineOpt+" not supported yet\n");
                    continue;
                }
                if (parser) {
                    this[opt] = this['parse_'+parser](optValue, cmdlineOpt);
                }
                else
                    this[opt] = optValue;
            }
        }
    },

    parse_int : function (val, cmdlineOpt) {
        return parseInt(val);
    },

    parse_bool : function (val, cmdlineOpt) {
        if (val == 'true' || val == 'yes') {
            return true;
        }
        if (val == 'false' || val == 'no') {
            return false;
        }
        throw new Error("Invalid value for '"+cmdlineOpt+"' option. It should be yes or no");
    },

    parse_file : function (val, cmdlineOpt) {
        // @TODO check if file exists ?
        return val;
    },

    parse_encoding : function (val, cmdlineOpt) {
        return val;
    },

    parse_proxytype : function (val, cmdlineOpt) {
        if (val != 'http' && val != 'socks5' && val != 'none' && val != '') {
            throw new Error("Invalid value for '"+cmdlineOpt+"' option. It should be http or socks5");
        }
        if (val == 'none')
            return '';
        return val;
    },

    parse_proxyauth : function (val, cmdlineOpt) {
        let pos = val.lastIndexOf(':')
        if ( pos > 0) {
            [this.proxyAuthUser, this.proxyAuthPassword] = val.split(":");
        }
        else
            this.proxyAuthUser = val
        return val;
    },

    parse_proxy : function (val, cmdlineOpt) {
        let pos = val.lastIndexOf(':')
        if ( pos > 0) {
            [this.proxyHost, this.proxyPort] = val.split(":");
        }
        else {
            this.proxyHost = val;
            this.proxyPort = 80;
        }
        return val;
    },

    parse_ssl : function (val, cmdlineOpt) {
        if (!(val == 'SSLv3' || val == 'SSLv2' || val=='TLSv1' || val == 'any')) {
            throw new Error("Invalid value for '"+cmdlineOpt+"' option. It should be SSLv3, SSMv2, TLSv1, any");
        }
        if (val == 'any')
            return '';
        return val;
    },

    parse_path : function (val, cmdlineOpt) {
        return val;
    },

    parse_loglevel : function (val, cmdlineOpt) {
        if (!(val == 'ERROR' || val == 'WARN' || val=='INFO' || val == 'DEBUG')) {
            throw new Error("Invalid value for '"+cmdlineOpt+"' option. It should be ERROR, WARN, INFO or DEBUG");
        }
        return val;
    },

    parse_url : function (val, cmdlineOpt) {
        return val;
    },

    parse_webdriver : function (val, cmdlineOpt) {
        let pos = val.lastIndexOf(':')
        if ( pos > 0) {
            [this.webdriverHost, this.webdriverPort] = val.split(":");
        }
        else
            this.webdriverHost = val
        return val;
    },

    getDefaultWebpageConfig : function() {
        
        return Object.freeze({
            javascriptEnabled: true,
            loadImages: this.loadImages,
            localToRemoteUrlAccessEnabled: this.localToRemoteUrlAccessEnabled,
            XSSAuditingEnabled : false,
            webSecurityEnabled: this.webSecurityEnabled,
            javascriptCanOpenWindows: this.javascriptCanOpenWindows,
            javascriptCanCloseWindows: this.javascriptCanCloseWindows,
            userAgent: defaultUA,
            userName: undefined,
            password: undefined,
            maxAuthAttempts: undefined,
            resourceTimeout: undefined,
        })
    },

    cookiesFile : '',
    diskCacheEnabled : true,
    maxDiskCacheSize : null,
    ignoreSslErrors : false,
    loadImages: true,
    localToRemoteUrlAccessEnabled : false,
    outputEncoding : 'UTF-8',
    proxyType : null,
    proxy : null,
    proxyHost:null,
    proxyPort:null,
    proxyAuth : null,
    proxyAuthUser : null,
    proxyAuthPassword : null,
    scriptEncoding : 'UTF-8',
    webSecurityEnabled : true,
    offlineStoragePath : null,
    offlineStorageDefaultQuota : null,
    printDebugMessages : null,
    javascriptCanOpenWindows : true,
    javascriptCanCloseWindows : true,
    sslProtocol : null,
    sslCertificatesPath : null,
    webdriver : '127.0.0.1:8910',
    webdriverIP: '127.0.0.1',
    webdriverPort: 8910,
    webdriverLogFile : '',
    webdriverLogLevel : 'INFO',
    webdriverSeleniumGridHub : null,
}
