/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/UserAgentOverrides.jsm");
Cu.import("resource://slimerjs/slUtils.jsm");

const HTTP_PROTO_HANDLER = Cc["@mozilla.org/network/protocol;1?name=http"]
                             .getService(Ci.nsIHttpProtocolHandler);

function SiteSpecificUserAgent() {}

SiteSpecificUserAgent.prototype = {
    // GECKO 22+
  getUserAgentForURIAndWindow: function ssua_getUserAgentForURIAndWindow(aURI, aWindow) {    
    let webpage = slUtils.getWebpageFromContentWindow(aWindow);
    if (webpage && 'userAgent' in webpage.settings && webpage.settings.userAgent) {
        return webpage.settings.userAgent;
    }
    else {
        return UserAgentOverrides.getOverrideForURI(aURI) || HTTP_PROTO_HANDLER.userAgent;
    }
  },

  //  GECKO < 22
  getUserAgentForURI: function ssua_getUserAgentForURI(aURI) {
    let webpage = slUtils.getWebpageFromURI(aURI);
    if (webpage && 'userAgent' in webpage.settings && webpage.settings.userAgent) {
        return webpage.settings.userAgent;
    }
    else {
        return UserAgentOverrides.getOverrideForURI(aURI) || HTTP_PROTO_HANDLER.userAgent;
    }
  },

  classID: Components.ID("{7602b9c0-6413-4769-893b-271245785445}"),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsISiteSpecificUserAgent])
};

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([SiteSpecificUserAgent]);
