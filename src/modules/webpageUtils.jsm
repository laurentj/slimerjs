/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
"use strict";
var EXPORTED_SYMBOLS = ["webpageUtils"];

const Cu = Components.utils;
const Cc = Components.classes;
const Ci = Components.interfaces;

Cu.import("resource://gre/modules/Services.jsm");

var webpageUtils = {
    
    /**
     * ugly hack to wait after click processing.
     * Gecko loads the URI of a <a> element, in an asynchronous manner.
     * This is very annoying when this is a "javascript:" uri, because
     * after executing sendEvent, the developer expect that the javascript
     * is executed (this is the behavior in PhantomJS). Unfortunately, this
     * is not the case. So let's wait a bit before continuing the execution.
     */
    sleepIfJavascriptURI : function(domWindowUtils, x, y) {
        var target = domWindowUtils.elementFromPoint(x, y, true, false);
        if (!target || target.localName.toLowerCase() != 'a') {
            return;
        }
        if (!target.getAttribute('href').startsWith('javascript:')) {
            return;
        }
        let ready = false;
        let timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
        timer.initWithCallback(function(){ready = true;}, 500, timer.TYPE_ONE_SHOT);
        let thread = Services.tm.currentThread;
        while (!ready)
            thread.processNextEvent(true);
    }
}

