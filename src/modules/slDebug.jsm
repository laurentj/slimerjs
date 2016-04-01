/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";
var EXPORTED_SYMBOLS = ["DEBUG", "DEBUG_CONFIG", "DEBUG_CLI", "DEBUG_WEBPAGE",
                        "DEBUG_FILES", "DEBUG_COOKIES", "DEBUG_WEBPAGE_LOADING",
                        "DEBUG_NETWORK_PROGRESS", "slDebugInit", "slDebugLog",
                        "slDebugGetObject"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

var DEBUG_CONFIG = false;
var DEBUG_CLI = false;
var DEBUG_FILES = false;
var DEBUG_COOKIES = false;
var DEBUG_WEBPAGE = false;
var DEBUG_WEBPAGE_LOADING = false; // network listeners in webpage
var DEBUG_NETWORK_PROGRESS = false; // low level network listeners (in net-log.js)
var DEBUG_ERRORS = false; 
var DEBUG = false;

const debugKeywords = {
    'config': 'DEBUG_CONFIG',
    'cli':'DEBUG_CLI',
    'files':'DEBUG_FILES',
    'cookies':'DEBUG_COOKIES',
    'page':'DEBUG_WEBPAGE',
    'pageload':'DEBUG_WEBPAGE_LOADING',
    'netprogress': 'DEBUG_NETWORK_PROGRESS',
    'network': 'DEBUG_NETWORK_PROGRESS',
    'net': 'DEBUG_NETWORK_PROGRESS',
    'errors': 'DEBUG_ERRORS' // this value is checked only in the calling script to output gecko errors
}

var defaultDebug="config,cli,files,cookies,page,net,netprogress";

var module = this;

function slDebugInit(descriptor){
    DEBUG = false;
    for (let i in debugKeywords) {
        module[debugKeywords[i]] = false;
    }
    if (descriptor === true) {
        descriptor = defaultDebug;
    }
    else if (descriptor === false) {
        return false;
    }
    descriptor.split(/\s*,\s*/).forEach(function(desc) {
        if (desc in debugKeywords) {
            module[debugKeywords[desc]] = true;
            DEBUG = true;
        }
    });
    return DEBUG;
}

function slDebugLog(message) {
    dump((new Date()).toISOString()+" [DEBUG] "+ message+"\n");
}

function slDebugGetObject(obj, excludedFields) {
    if (typeof obj != 'object') {
        return JSON.stringify(obj)
    }
    let s = "{";
    for(let p in obj) {
        if (excludedFields && excludedFields.indexOf(p) > -1) {
            s += p+":..., ";
            continue;
        }
        s += p+": ";
        s += slDebugGetObject(obj[p])
        s += ", ";
    }
    return s+"} ";
}
