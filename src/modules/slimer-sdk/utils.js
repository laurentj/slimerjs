/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const {Cc, Ci, Cu} = require("chrome");
const base64 = require("sdk/base64");
const {mix} = require("sdk/core/heritage");
const {URL} = require("sdk/url");

const {validateOptions} = require("sdk/deprecated/api-utils");

const AppShellService = Cc["@mozilla.org/appshell/appShellService;1"]
                        .getService(Ci.nsIAppShellService);
const ioService = Cc["@mozilla.org/network/io-service;1"]
                        .getService(Ci.nsIIOService);
const STS = Cc["@mozilla.org/stsservice;1"]
                        .getService(Ci.nsIStrictTransportSecurityService);
const wm = Cc["@mozilla.org/appshell/window-mediator;1"]
                        .getService(Ci.nsIWindowMediator);

const NS = "http://www.w3.org/1999/xhtml";
const COLOR = "rgb(255,255,255)";


const getScreenshotCanvas = function(window, clip, ratio) {
    let scrollbarWidth = window.innerWidth - window.document.body.clientWidth;

    if (clip) {
        window.resizeTo(clip.width + scrollbarWidth, clip.height);
    }
    if (!ratio || (ratio && (ratio <= 0 || ratio > 1))) {
        ratio = 1;
    }

    let top = clip && clip.top || 0;
    let left = clip && clip.left || 0;
    let width = clip && clip.width || null;
    let height = clip && clip.height || null;

    if (width === null) {
        width = window.innerWidth;
    }
    if (height === null) {
        height = window.innerHeight;
    }

    let canvas = AppShellService.hiddenDOMWindow.document.createElementNS(NS, "canvas");
    canvas.mozOpaque = true;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    let ctx = canvas.getContext("2d");
    ctx.fillStyle = COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(ratio, ratio);
    ctx.drawWindow(window, left, top, width, height, COLOR);
    ctx.restore();

    return canvas;
};
exports.getScreenshotCanvas = getScreenshotCanvas;


const discardSTSInfo = function(request) {
    try {
        request.QueryInterface(Ci.nsIHttpChannel);
    } catch(e) {
        return;
    }

    if (STS.isStsHost(request.URI.host, null)) {
        STS.removeStsState(request.URI, null);
    }
};
exports.discardSTSInfo = discardSTSInfo;


const setAuthHeaders = function(request, originURL, username, password) {
    try {
        request.QueryInterface(Ci.nsIHttpChannel);
    } catch(e) {
        return;
    }

    // Remove auth info in any case
    request.setRequestHeader("Authorization", null, false);

    if (!username && !password) {
        return;
    }
    let auth = "Basic " + base64.encode(username + ":" + password);

    // No referer = original page, set it
    if (request.referrer === null) {
        request.setRequestHeader("Authorization", auth, false);
        return;
    }

    // Resources, test hostname and base path
    let url = ioService.newURI(originURL, null, null);
    if (url.host == request.URI.host &&
        url.port == request.URI.port &&
        url.scheme == request.URI.scheme
    ) {
        request.setRequestHeader("Authorization", auth, false);
    }
};
exports.setAuthHeaders = setAuthHeaders;


const removeAuthPrompt = function() {
    // Ok, this one is very ugly and we should look at a better idea :)
    let winEnum = wm.getXULWindowEnumerator(null, true);
    let win, dcEnum, ds, doc;
    while (winEnum.hasMoreElements()) {
        try {
            win = winEnum.getNext();
            win.QueryInterface(Ci.nsIXULWindow);

            dcEnum = win.docShell.getDocShellEnumerator(
                Ci.nsIDocShellTreeItem.typeChrome,
                Ci.nsIDocShell.ENUMERATE_FORWARDS
            );
            while (dcEnum.hasMoreElements()) {
                ds = dcEnum.getNext();
                ds.QueryInterface(Ci.nsIDocShell);
                doc = ds.contentViewer.DOMDocument;
                if (doc.location.href == "chrome://global/content/commonDialog.xul") {
                    doc.documentElement._buttons.cancel.click();
                };
            }
        } catch(e) {
            // Didn't read, LOL
        }
    }
};
exports.removeAuthPrompt = removeAuthPrompt;
