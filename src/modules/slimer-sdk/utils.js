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
    let scrollbarWidth = 0;
    scrollbarWidth = window.innerWidth - window.document.body.clientWidth;

    if (clip) {
        window.resizeTo(clip.width + scrollbarWidth, clip.height);
    }
    if (!ratio || (ratio && (ratio <= 0 || ratio > 1))) {
        ratio = 1;
    }

    let top = clip && clip.top || 0;
    let left = clip && clip.left || 0;
    let width = clip && clip.width;
    let height = clip && clip.height || window.document.body.scrollHeight;

    if (width === null) {
        width = window.document.body.clientWidth;
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


const setCookies = function(request, cookies) {
    try {
        request.QueryInterface(Ci.nsIHttpChannel);
    } catch(e) {
        return;
    }

    // Remove cookies on original page
    request.setRequestHeader("Cookie", null, false);

    cookies.forEach(function(cookie) {
        if (cookie.check(request.URI.spec)) {
            request.setRequestHeader("Cookie", cookie.name + "=" + cookie.value, true);
        }
    });

};
exports.setCookies = setCookies;


const getCookies = function(request) {
    try {
        request.QueryInterface(Ci.nsIHttpChannel);
    } catch(e) {
        return [];
    }
    try {
        let cookies = request.getResponseHeader("Set-Cookie").split("\n");
        return cookies.map(function(cookie) {
            return parseCookie(cookie, request.URI.spec);
        });
    } catch(e) {
        return [];
    }
};
exports.getCookies = getCookies;


function Cookie(data) {
    let requirements = {
        name: {
            is: ["string"],
        },
        value: {
            map: function(val) val.toString(),
            ok: function(val) val != "",
            msg: "cookie value is required"
        },
        domain: {
            is: ["string"],
        },
        path: {
            map: function(val) val && val.toString() || "/"
        },
        httponly: {
            map: function(val) typeof(val) === "boolean" ? val : true,
        },
        secure: {
            map: function(val) typeof(val) === "boolean" ? val : false,
        },
        expires: {
            map: function(val) !val ? null : val,
            ok: function(val) val === undefined || val === null || val instanceof Date,
            msg: "expires should be a Date, null, undefined"
        }
    };

    data = validateOptions(data, requirements);

    return mix(data, {
        toString: function() {
            let res = [this.name + "=" + this.value];
            if (this.domain) {
                res.push("domain=" + this.domain);
            }
            if (this.path) {
                res.push("path=" + this.path);
            }
            if (this.expires) {
                res.push("expires=" + this.expires.toUTCString());
            }
            if (this.httponly) {
                res.push("httponly");
            }
            if (this.secure) {
                res.push("secure");
            }

            return res.join("; ");
        },
        check: function(url) {
            url = URL(url);
            return this._checkHost(url) && this._checkPath(url) && this._checkSec(url);
        },
        _checkHost: function(url) {
            if (this.domain.indexOf('.') == 0) {
                return this.domain.substr(1) === url.host || (
                    this.domain.length < url.host.length &&
                    url.host.substr(url.host.length - this.domain.length) == this.domain
                );
            }
            return this.domain == url.host;
        },
        _checkSec: function(url) {
            return (
                (!this.httponly || (this.httponly && ["http", "https"].indexOf(url.scheme) !== -1)) &&
                (!this.secure || (this.secure && url.scheme === "https"))
            );
        },
        _checkPath: function(url) {
            return url.path.indexOf(this.path) === 0;
        }
    });
};
exports.Cookie = Cookie;

function parseCookie(cookieString, url) {
    url = URL(url);
    let data = {
        domain: url.host,
        httponly: false,
        secure: false
    };
    cookieString.split(";").forEach(function(v, i, p) {
        v = v.trim();
        let eq = v.indexOf("=");
        let name, value, expires;
        if (eq == -1) {
            name = v;
            value = true;
        } else {
            name = v.slice(0, eq);
            value = v.slice(eq + 1);
        }

        if (i == 0) {
            data.name = name;
            data.value = decodeURIComponent(value);
        } else if (name.toLowerCase() == "domain") {
            data.domain = value;
        } else if (name.toLowerCase() == "path") {
            data.path = value;
        } else if (name.toLowerCase() == "expires") {
            expires = Date.parse(value.replace("-", " ", "g"));
            if (expires > 0) {
                data.expires = new Date(expires);
            }
        } else if (name.toLowerCase() == "httponly") {
            data.httponly = true;
        } else if (name.toLowerCase() == "secure" && url.scheme === "https") {
            data.secure = true;
        }
    });

    return Cookie(data);
};
exports.parseCookie = parseCookie;
