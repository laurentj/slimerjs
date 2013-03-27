/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

window.addEventListener("load", function(event) {
    let browser = document.getElementById('webpage');
    if ("arguments" in window
        && window.arguments[0]
        && window.arguments[0].callback) {
        window.arguments[0].callback(browser);
    }
}, true);
