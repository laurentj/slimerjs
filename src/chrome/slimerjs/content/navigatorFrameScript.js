/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


/*
 This file is the content script for the process that loads the web page.
 
 See https://developer.mozilla.org/en-US/docs/The_message_manager

*/



addEventListener('load', function(event) {
    if (event.target == content.document)
        sendAsyncMessage('pageloaded', "");
}, true)
