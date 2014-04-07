/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim:set ts=2 sw=2 sts=2 et: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** 
Convenience functions for getting/setting preferences inside Gecko
*/

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;
const CC = Components.Constructor;

var gRootPrefBranch = null;

function getRootPrefBranch()
{
  if (!gRootPrefBranch)
  {
    gRootPrefBranch = Cc["@mozilla.org/preferences-service;1"]
                        .getService(Ci.nsIPrefBranch);
  }
  return gRootPrefBranch;
}

function setGeckoPreference(name, value){
  if(!name){
    throw 'preference name required';
  }
  var pref = getRootPrefBranch();
  if(typeof value === 'string'){
    var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
        str.data = value;
        pref.setComplexValue(name, Ci.nsISupportsString, str);
  }else if(typeof value === 'number'){
    pref.setIntPref(name, value);
  }else if(value === true || value === false){
    pref.setBoolPref(name, value);
  }else{
    throw 'can not save this type of data in prefs system';
  }

}

