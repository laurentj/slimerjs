/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { classes: Cc, interfaces: Ci, results: Cr, utils: Cu } = Components;
const { XPCOMUtils } = Cu.import('resource://gre/modules/XPCOMUtils.jsm', {});

function DisabledTelemetryStartup() {}

DisabledTelemetryStartup.prototype = {
    classID: Components.ID('{b0836913-f33f-4935-96af-235891cd5815}'),
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver, Ci.nsITimerCallback]),
    _xpcom_factory: XPCOMUtils.generateSingletonFactory(DisabledTelemetryStartup),

    observe(subject, topic, data) {},
};

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([DisabledTelemetryStartup]);
