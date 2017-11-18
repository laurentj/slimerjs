/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// copy of toolkit/components/prompts/src/nsPrompter.js

"use strict";

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://slimerjs/slUtils.jsm");
Cu.import("resource://slimerjs/slConfiguration.jsm");
Cu.import("resource://gre/modules/SharedPromptUtils.jsm");

var PrompterInterfaces = [Ci.nsIPromptFactory, Ci.nsIPromptService];
if (geckoMajorVersion < 58) {
    PrompterInterfaces.push(Ci.nsIPromptService2);
}


function Prompter() {
    // Note that EmbedPrompter clones this implementation.
}

Prompter.prototype = {
    classID          : Components.ID("{47c45611-1cfe-4f5e-9749-dc5c78ce8b40}"),
    QueryInterface   : XPCOMUtils.generateQI(PrompterInterfaces),


    /* ----------  private members  ---------- */

    pickPrompter : function (domWin) {
        return new ModalPrompter(domWin);
    },


    /* ----------  nsIPromptFactory  ---------- */


    getPrompt : function (domWin, iid) {
        // This is still kind of dumb; the C++ code delegated to login manager
        // here, which in turn calls back into us via nsIPromptService2.
        if (iid.equals(Ci.nsIAuthPrompt2) || iid.equals(Ci.nsIAuthPrompt)) {
            try {
                let pwmgr = Cc["@mozilla.org/passwordmanager/authpromptfactory;1"].
                            getService(Ci.nsIPromptFactory);
                return pwmgr.getPrompt(domWin, iid);
            } catch (e) {
                Cu.reportError("nsPrompter: Delegation to password manager failed: " + e);
            }
        }
        let p = new ModalPrompter(domWin);
        p.QueryInterface(iid);
        return p;
    },


    /* ----------  nsIPromptService  ---------- */


    alert : function (domWin, title, text) {
        let p = this.pickPrompter(domWin);
        p.alert(title, text);
    },

    alertCheck : function (domWin, title, text, checkLabel, checkValue) {
        let p = this.pickPrompter(domWin);
        p.alertCheck(title, text, checkLabel, checkValue);
    },

    confirm : function (domWin, title, text) {
        let p = this.pickPrompter(domWin);
        return p.confirm(title, text);
    },

    confirmCheck : function (domWin, title, text, checkLabel, checkValue) {
        let p = this.pickPrompter(domWin);
        return p.confirmCheck(title, text, checkLabel, checkValue);
    },

    confirmEx : function (domWin, title, text, flags, button0, button1, button2, checkLabel, checkValue) {
        let p = this.pickPrompter(domWin);
        return p.confirmEx(title, text,  flags, button0, button1, button2, checkLabel, checkValue);
    },

    prompt : function (domWin, title, text, value, checkLabel, checkValue) {
        let p = this.pickPrompter(domWin);
        return p.nsIPrompt_prompt(title, text, value, checkLabel, checkValue);
    },

    promptUsernameAndPassword : function (domWin, title, text, user, pass, checkLabel, checkValue) {
        let p = this.pickPrompter(domWin);
        return p.nsIPrompt_promptUsernameAndPassword(title, text, user, pass, checkLabel, checkValue);
    },

    promptPassword : function (domWin, title, text, pass, checkLabel, checkValue) {
        let p = this.pickPrompter(domWin);
        return p.nsIPrompt_promptPassword(title, text, pass, checkLabel, checkValue);
    },

    select : function (domWin, title, text, count, list, selected) {
        let p = this.pickPrompter(domWin);
        return p.select(title, text, count, list, selected);
    },


    /* ----------  nsIPromptService2  ---------- */


    promptAuth : function (domWin, channel, level, authInfo, checkLabel, checkValue) {
        let p = this.pickPrompter(domWin);
        return p.promptAuth(channel, level, authInfo, checkLabel, checkValue);
    },

    asyncPromptAuth : function (domWin, channel, callback, context, level, authInfo, checkLabel, checkValue) {
        let p = this.pickPrompter(domWin);
        return p.asyncPromptAuth(channel, callback, context, level, authInfo, checkLabel, checkValue);
    },

};


// Common utils not specific to a particular prompter style.
let PromptUtilsTemp = {
    __proto__: PromptUtils,

    getLocalizedString : function (key, formatArgs) {
        if (formatArgs)
            return this.strBundle.formatStringFromName(key, formatArgs, formatArgs.length);
        return this.strBundle.GetStringFromName(key);
    },

    confirmExHelper : function (flags, button0, button1, button2) {

        const BUTTON_DEFAULT_MASK = 0x03000000;
        let defaultButtonNum = (flags & BUTTON_DEFAULT_MASK) >> 24;
        let isDelayEnabled = (flags & Ci.nsIPrompt.BUTTON_DELAY_ENABLE);

        // Flags can be used to select a specific pre-defined button label or
        // a caller-supplied string (button0/button1/button2). If no flags are
        // set for a button, then the button won't be shown.
        let argText = [button0, button1, button2];
        let buttonLabels = [null, null, null];
        for (let i = 0; i < 3; i++) {
            let buttonLabel;
            switch (flags & 0xff) {
              case Ci.nsIPrompt.BUTTON_TITLE_OK:
                buttonLabel = PromptUtils.getLocalizedString("OK");
                break;
              case Ci.nsIPrompt.BUTTON_TITLE_CANCEL:
                buttonLabel = PromptUtils.getLocalizedString("Cancel");
                break;
              case Ci.nsIPrompt.BUTTON_TITLE_YES:
                buttonLabel = PromptUtils.getLocalizedString("Yes");
                break;
              case Ci.nsIPrompt.BUTTON_TITLE_NO:
                buttonLabel = PromptUtils.getLocalizedString("No");
                break;
              case Ci.nsIPrompt.BUTTON_TITLE_SAVE:
                buttonLabel = PromptUtils.getLocalizedString("Save");
                break;
              case Ci.nsIPrompt.BUTTON_TITLE_DONT_SAVE:
                buttonLabel = PromptUtils.getLocalizedString("DontSave");
                break;
              case Ci.nsIPrompt.BUTTON_TITLE_REVERT:
                buttonLabel = PromptUtils.getLocalizedString("Revert");
                break;
              case Ci.nsIPrompt.BUTTON_TITLE_IS_STRING:
                buttonLabel = argText[i];
                break;
            }
            if (buttonLabel)
                buttonLabels[i] = buttonLabel;
            flags >>= 8;
        }

        return [buttonLabels[0], buttonLabels[1], buttonLabels[2], defaultButtonNum, isDelayEnabled];
    },

    getAuthInfo : function (authInfo) {
        let username, password;

        let flags = authInfo.flags;
        if (flags & Ci.nsIAuthInformation.NEED_DOMAIN && authInfo.domain)
            username = authInfo.domain + "\\" + authInfo.username;
        else
            username = authInfo.username;

        password = authInfo.password;

        return [username, password];
    },

    setAuthInfo : function (authInfo, username, password) {
        let flags = authInfo.flags;
        if (flags & Ci.nsIAuthInformation.NEED_DOMAIN) {
            // Domain is separated from username by a backslash
            let idx = username.indexOf("\\");
            if (idx == -1) {
                authInfo.username = username;
            } else {
                authInfo.domain   =  username.substring(0, idx);
                authInfo.username =  username.substring(idx+1);
            }
        } else {
            authInfo.username = username;
        }
        authInfo.password = password;
    },

    // Copied from login manager
    getFormattedHostname : function (uri) {
        let scheme = uri.scheme;
        let hostname = scheme + "://" + uri.host;

        // If the URI explicitly specified a port, only include it when
        // it's not the default. (We never want "http://foo.com:80")
        let port = uri.port;
        if (port != -1) {
            let handler = Services.io.getProtocolHandler(scheme);
            if (port != handler.defaultPort)
                hostname += ":" + port;
        }

        return hostname;
    },

    // Copied from login manager
    getAuthTarget : function (aChannel, aAuthInfo) {
        let hostname, realm;
        // If our proxy is demanding authentication, don't use the
        // channel's actual destination.
        if (aAuthInfo.flags & Ci.nsIAuthInformation.AUTH_PROXY) {
            if (!(aChannel instanceof Ci.nsIProxiedChannel))
                throw "proxy auth needs nsIProxiedChannel";

            let info = aChannel.proxyInfo;
            if (!info)
                throw "proxy auth needs nsIProxyInfo";

            // Proxies don't have a scheme, but we'll use "moz-proxy://"
            // so that it's more obvious what the login is for.
            let idnService = Cc["@mozilla.org/network/idn-service;1"].
                             getService(Ci.nsIIDNService);
            hostname = "moz-proxy://" +
                        idnService.convertUTF8toACE(info.host) +
                        ":" + info.port;
            realm = aAuthInfo.realm;
            if (!realm)
                realm = hostname;

            return [hostname, realm];
        }

        hostname = this.getFormattedHostname(aChannel.URI);

        // If a HTTP WWW-Authenticate header specified a realm, that value
        // will be available here. If it wasn't set or wasn't HTTP, we'll use
        // the formatted hostname instead.
        realm = aAuthInfo.realm;
        if (!realm)
            realm = hostname;

        return [hostname, realm];
    },


    makeAuthMessage : function (channel, authInfo) {
        let isProxy    = (authInfo.flags & Ci.nsIAuthInformation.AUTH_PROXY);
        let isPassOnly = (authInfo.flags & Ci.nsIAuthInformation.ONLY_PASSWORD);

        let username = authInfo.username;
        let [displayHost, realm] = this.getAuthTarget(channel, authInfo);

        // Suppress "the site says: $realm" when we synthesized a missing realm.
        if (!authInfo.realm && !isProxy)
            realm = "";

        // Trim obnoxiously long realms.
        if (realm.length > 150) {
            realm = realm.substring(0, 150);
            // Append "..." (or localized equivalent).
            realm += this.ellipsis;
        }

        let text;
        if (geckoMajorVersion < 50) {
            if (isProxy) {
                text = PromptUtils.getLocalizedString("EnterLoginForProxy", [realm, displayHost]);
            } else if (isPassOnly) {
                text = PromptUtils.getLocalizedString("EnterPasswordFor", [username, displayHost]);
            } else if (!realm) {
                text = PromptUtils.getLocalizedString("EnterUserPasswordFor", [displayHost]);
            } else {
                text = PromptUtils.getLocalizedString("EnterLoginForRealm", [realm, displayHost]);
            }
        }
        else if (geckoMajorVersion == 50) {
            let isCrossOrig = (authInfo.flags &
                               Ci.nsIAuthInformation.CROSS_ORIGIN_SUB_RESOURCE);
            if (isProxy) {
                text = PromptUtils.getLocalizedString("EnterLoginForProxy2", [realm, displayHost]);
            } else if (isPassOnly) {
                text = PromptUtils.getLocalizedString("EnterPasswordFor", [username, displayHost]);
            } else if (isCrossOrig) {
                text = PromptUtils.getLocalizedString("EnterUserPasswordForCrossOrigin", [displayHost]);
            } else if (!realm) {
                text = PromptUtils.getLocalizedString("EnterUserPasswordFor2", [displayHost]);
            } else {
                text = PromptUtils.getLocalizedString("EnterLoginForRealm2", [realm, displayHost]);
            }
        }
        else {
            let isCrossOrig = (authInfo.flags &
                               Ci.nsIAuthInformation.CROSS_ORIGIN_SUB_RESOURCE);
            if (isProxy) {
                text = PromptUtils.getLocalizedString("EnterLoginForProxy3", [realm, displayHost]);
            } else if (isPassOnly) {
                text = PromptUtils.getLocalizedString("EnterPasswordFor", [username, displayHost]);
            } else if (isCrossOrig) {
                text = PromptUtils.getLocalizedString("EnterUserPasswordForCrossOrigin2", [displayHost]);
            } else if (!realm) {
                text = PromptUtils.getLocalizedString("EnterUserPasswordFor2", [displayHost]);
            } else {
                text = PromptUtils.getLocalizedString("EnterLoginForRealm3", [realm, displayHost]);
            }
        }
        return text;
    },

    getTabModalPrompt(domWin) {
        var promptBox = null;

        try {
            // Get the topmost window, in case we're in a frame.
            var promptWin = domWin.top;

            // Get the chrome window for the content window we're using.
            // (Unwrap because we need a non-IDL property below.)
            var chromeWin = promptWin.QueryInterface(Ci.nsIInterfaceRequestor)
                .getInterface(Ci.nsIWebNavigation)
                .QueryInterface(Ci.nsIDocShell)
                .chromeEventHandler.ownerGlobal.wrappedJSObject;

            if (chromeWin.getTabModalPromptBox)
                promptBox = chromeWin.getTabModalPromptBox(promptWin);
        } catch (e) {
            // If any errors happen, just assume no tabmodal prompter.
        }

        return promptBox;
    },

    isSlowScriptDialog : function (title) {
        return this.domBundle.GetStringFromName("KillScriptTitle") === title;
    },
};

PromptUtils = PromptUtilsTemp;

XPCOMUtils.defineLazyGetter(PromptUtils, "strBundle", function () {
    let bunService = Cc["@mozilla.org/intl/stringbundle;1"].
                     getService(Ci.nsIStringBundleService);
    let bundle = bunService.createBundle("chrome://global/locale/commonDialogs.properties");
    if (!bundle)
        throw "String bundle for Prompter not present!";
    return bundle;
});

XPCOMUtils.defineLazyGetter(PromptUtils, "domBundle", function () {
    let bunService = Cc["@mozilla.org/intl/stringbundle;1"].
                     getService(Ci.nsIStringBundleService);
    let bundle = bunService.createBundle("chrome://global/locale/dom/dom.properties");
    if (!bundle)
        throw "String dom bundle for Prompter not present!";
    return bundle;
});

XPCOMUtils.defineLazyGetter(PromptUtils, "ellipsis", function () {
    let ellipsis = "\u2026";
    try {
        ellipsis = Services.prefs.getComplexValue("intl.ellipsis", Ci.nsIPrefLocalizedString).data;
    } catch (e) { }
    return ellipsis;
});


function openModalWindow(domWin, uri, args) {
    // There's an implied contract that says modal prompts should still work
    // when no "parent" window is passed for the dialog (eg, the "Master
    // Password" dialog does this).  These prompts must be shown even if there
    // are *no* visible windows at all.
    // There's also a requirement for prompts to be blocked if a window is
    // passed and that window is hidden (eg, auth prompts are supressed if the
    // passed window is the hidden window).
    // See bug 875157 comment 30 for more...
    if (domWin) {
        // a domWin was passed, so we can apply the check for it being hidden.
        let winUtils = domWin.QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIDOMWindowUtils);

        if (winUtils && !winUtils.isParentWindowMainWidgetVisible) {
            throw Components.Exception("Cannot call openModalWindow on a hidden window",
                Cr.NS_ERROR_NOT_AVAILABLE);
        }
    } else {
        // We try and find a window to use as the parent, but don't consider
        // if that is visible before showing the prompt.
        domWin = Services.ww.activeWindow;
        // domWin may still be null here if there are _no_ windows open.
    }
    // Note that we don't need to fire DOMWillOpenModalDialog and
    // DOMModalDialogClosed events here, wwatcher's OpenWindowInternal
    // will do that. Similarly for enterModalState / leaveModalState.

    Services.ww.openWindow(domWin, uri, "_blank", "centerscreen,chrome,modal,titlebar", args);
}

function openTabPrompt(domWin, tabPrompt, args) {
    let docShell = domWin.QueryInterface(Ci.nsIInterfaceRequestor)
        .getInterface(Ci.nsIDocShell);
    let inPermitUnload = docShell.contentViewer && docShell.contentViewer.inPermitUnload;
    let eventDetail = Cu.cloneInto({tabPrompt: true, inPermitUnload}, domWin);
    PromptUtils.fireDialogEvent(domWin, "DOMWillOpenModalDialog");

    let winUtils = domWin.QueryInterface(Ci.nsIInterfaceRequestor)
                         .getInterface(Ci.nsIDOMWindowUtils);
    winUtils.enterModalState();

    let frameMM = docShell.QueryInterface(Ci.nsIInterfaceRequestor)
        .getInterface(Ci.nsIContentFrameMessageManager);
    frameMM.QueryInterface(Ci.nsIDOMEventTarget);

    // We provide a callback so the prompt can close itself. We don't want to
    // wait for this event loop to return... Otherwise the presence of other
    // prompts on the call stack would in this dialog appearing unresponsive
    // until the other prompts had been closed.
    let callbackInvoked = false;
    let newPrompt;
    function onPromptClose(forceCleanup) {
        if (!newPrompt && !forceCleanup)
            return;
        callbackInvoked = true;
        if (newPrompt)
            tabPrompt.removePrompt(newPrompt);

        frameMM.removeEventListener("pagehide", pagehide, true);

        winUtils.leaveModalState();

        PromptUtils.fireDialogEvent(domWin, "DOMModalDialogClosed");
    }

    frameMM.addEventListener("pagehide", pagehide, true);
    function pagehide(e) {
        // Check whether the event relates to our window or its ancestors
        let window = domWin;
        let eventWindow = e.target.defaultView;
        while (window != eventWindow && window.parent != window) {
            window = window.parent;
        }
        if (window != eventWindow) {
            return;
        }
        frameMM.removeEventListener("pagehide", pagehide, true);

        if (newPrompt) {
            newPrompt.abortPrompt();
        }
    }

    try {
        let topPrincipal = domWin.top.document.nodePrincipal;
        let promptPrincipal = domWin.document.nodePrincipal;
        args.showAlertOrigin = topPrincipal.equals(promptPrincipal);
        args.promptActive = true;

        newPrompt = tabPrompt.appendPrompt(args, onPromptClose);

        // TODO since we don't actually open a window, need to check if
        // there's other stuff in nsWindowWatcher::OpenWindowInternal
        // that we might need to do here as well.

        Services.tm.spinEventLoopUntil(() => !args.promptActive);
        delete args.promptActive;

        if (args.promptAborted)
            throw Components.Exception("prompt aborted by user", Cr.NS_ERROR_NOT_AVAILABLE);
    } finally {
        // If the prompt unexpectedly failed to invoke the callback, do so here.
        if (!callbackInvoked)
            onPromptClose(true);
    }
}

function openRemotePrompt(domWin, args, tabPrompt) {
    let docShell = domWin.QueryInterface(Ci.nsIInterfaceRequestor)
        .getInterface(Ci.nsIDocShell);
    let messageManager = docShell.QueryInterface(Ci.nsIInterfaceRequestor)
        .getInterface(Ci.nsITabChild)
        .messageManager;

    let inPermitUnload = docShell.contentViewer && docShell.contentViewer.inPermitUnload;
    let eventDetail = Cu.cloneInto({tabPrompt, inPermitUnload}, domWin);
    PromptUtils.fireDialogEvent(domWin, "DOMWillOpenModalDialog", null, eventDetail);

    let winUtils = domWin.QueryInterface(Ci.nsIInterfaceRequestor)
        .getInterface(Ci.nsIDOMWindowUtils);
    winUtils.enterModalState();
    let closed = false;

    let frameMM = docShell.getInterface(Ci.nsIContentFrameMessageManager);
    frameMM.QueryInterface(Ci.nsIDOMEventTarget);

    // It should be hard or impossible to cause a window to create multiple
    // prompts, but just in case, give our prompt an ID.
    let id = "id" + Cc["@mozilla.org/uuid-generator;1"]
        .getService(Ci.nsIUUIDGenerator).generateUUID().toString();

    messageManager.addMessageListener("Prompt:Close", function listener(message) {
        if (message.data._remoteId !== id) {
            return;
        }

        messageManager.removeMessageListener("Prompt:Close", listener);
        frameMM.removeEventListener("pagehide", pagehide, true);

        winUtils.leaveModalState();
        PromptUtils.fireDialogEvent(domWin, "DOMModalDialogClosed");

        // Copy the response from the closed prompt into our args, it will be
        // read by our caller.
        if (message.data) {
            for (let key in message.data) {
                args[key] = message.data[key];
            }
        }

        // Exit our nested event loop when we unwind.
        closed = true;
    });

    frameMM.addEventListener("pagehide", pagehide, true);
    function pagehide(e) {
        // Check whether the event relates to our window or its ancestors
        let window = domWin;
        let eventWindow = e.target.defaultView;
        while (window != eventWindow && window.parent != window) {
            window = window.parent;
        }
        if (window != eventWindow) {
            return;
        }
        frameMM.removeEventListener("pagehide", pagehide, true);
        messageManager.sendAsyncMessage("Prompt:ForceClose", { _remoteId: id });
    }

    let topPrincipal = domWin.top.document.nodePrincipal;
    let promptPrincipal = domWin.document.nodePrincipal;
    args.promptPrincipal = promptPrincipal;
    args.showAlertOrigin = topPrincipal.equals(promptPrincipal);
    args.inPermitUnload = inPermitUnload;

    args._remoteId = id;

    messageManager.sendAsyncMessage("Prompt:Open", args, {});

    Services.tm.spinEventLoopUntil(() => closed);
}

function ModalPrompter(domWin) {
    // Before Fx57, this is the content window. Since Fx57, this is the XUL
    // window.
    this.domWin = domWin;
}
ModalPrompter.prototype = {
    domWin : null,
    /*
     * Default to not using a tab-modal prompt, unless the caller opts in by
     * QIing to nsIWritablePropertyBag and setting the value of this property
     * to true.
     */
    allowTabModal : false,

    QueryInterface : XPCOMUtils.generateQI([Ci.nsIPrompt, Ci.nsIAuthPrompt,
        Ci.nsIAuthPrompt2,
        Ci.nsIWritablePropertyBag2]),


    /* ---------- internal methods ---------- */


    openPrompt : function (args) {
//FIXME HERE: call webpage callback

        // Check pref, if false/missing do not ever allow tab-modal prompts.
        const prefName = "prompts.tab_modal.enabled";
        let prefValue = false;
        if (Services.prefs.getPrefType(prefName) == Services.prefs.PREF_BOOL)
            prefValue = Services.prefs.getBoolPref(prefName);

        let allowTabModal = this.allowTabModal && prefValue;

        if (allowTabModal && this.domWin) {
            if (Services.appinfo.processType == Services.appinfo.PROCESS_TYPE_CONTENT) {
                openRemotePrompt(this.domWin, args, true);
                return;
            }

            let tabPrompt = PromptUtils.getTabModalPrompt(this.domWin);
            if (tabPrompt) {
                openTabPrompt(this.domWin, tabPrompt, args);
                return;
            }
        }
        // If we can't do a tab modal prompt, fallback to using a window-modal dialog.
        const COMMON_DIALOG = "chrome://global/content/commonDialog.xul";
        const SELECT_DIALOG = "chrome://global/content/selectDialog.xul";

        let uri = (args.promptType == "select") ? SELECT_DIALOG : COMMON_DIALOG;

        if (Services.appinfo.processType === Services.appinfo.PROCESS_TYPE_CONTENT) {
            args.uri = uri;
            openRemotePrompt(this.domWin, args);
            return;
        }

        let propBag = PromptUtils.objectToPropBag(args);
        openModalWindow(this.domWin, uri, propBag);
        PromptUtils.propBagToObject(propBag, args);
    },

    _findWebPage : function () {
        return slUtils.getWebpageFromContentWindow(this.domWin)
    },

    /*
     * ---------- interface disambiguation ----------
     *
     * nsIPrompt and nsIAuthPrompt share 3 method names with slightly
     * different arguments. All but prompt() have the same number of
     * arguments, so look at the arg types to figure out how we're being
     * called. :-(
     */
    prompt : function() {
        // also, the nsIPrompt flavor has 5 args instead of 6.
        if (typeof arguments[2] == "object")
            return this.nsIPrompt_prompt.apply(this, arguments);
        return this.nsIAuthPrompt_prompt.apply(this, arguments);
    },

    promptUsernameAndPassword : function() {
        // Both have 6 args, so use types.
        if (typeof arguments[2] == "object")
            return this.nsIPrompt_promptUsernameAndPassword.apply(this, arguments);
        return this.nsIAuthPrompt_promptUsernameAndPassword.apply(this, arguments);
    },

    promptPassword : function() {
        // Both have 5 args, so use types.
        if (typeof arguments[2] == "object")
            return this.nsIPrompt_promptPassword.apply(this, arguments);
        return this.nsIAuthPrompt_promptPassword.apply(this, arguments);
    },


    /* ----------  nsIPrompt  ---------- */


    alert : function (title, text) {
        if (!title)
            title = PromptUtils.getLocalizedString("Alert");
        let webpage = this._findWebPage();
        if (webpage) {
            if (webpage.onAlert) {
                webpage.onAlert(text);
            }
            return;
        }

        let args = {
            promptType: "alert",
            title,
            text,
        };

        this.openPrompt(args);
    },

    alertCheck : function (title, text, checkLabel, checkValue) {
        if (!title)
            title = PromptUtils.getLocalizedString("Alert");

        let args = {
            promptType: "alertCheck",
            title,
            text,
            checkLabel,
            checked:    checkValue.value,
        };

        this.openPrompt(args);

        // Checkbox state always returned, even if cancel clicked.
        checkValue.value = args.checked;
    },

    confirm : function (title, text) {
        if (!title)
            title = PromptUtils.getLocalizedString("Confirm");

        let webpage = this._findWebPage();
        if (webpage) {
            if (webpage.onConfirm) {
                let ok = webpage.onConfirm(text, title);
                return !!ok;
            }
            return false;
        }

        let args = {
            promptType: "confirm",
            title,
            text,
            ok:         false,
        };

        //this.openPrompt(args);

        // Did user click Ok or Cancel?
        return args.ok;
    },

    confirmCheck : function (title, text, checkLabel, checkValue) {
        if (!title)
            title = PromptUtils.getLocalizedString("ConfirmCheck");

        let webpage = this._findWebPage();
        if (webpage) {
            if (webpage.onConfirm) {
                let chk = { label: checkLabel, checked: checkValue.value };
                let buttons = ["Ok", "Cancel"];
                let ok = webpage.onConfirm(text, title, buttons, chk);
                checkValue.value = !!chk.checked;
                if (ok === 0) {
                    ok = true;
                }
                else if (ok === 1) {
                    ok = false;
                }
                return (!!ok);
            }
            return false;
        }

        let args = {
            promptType: "confirmCheck",
            title,
            text,
            checkLabel,
            checked:    checkValue.value,
            ok:         false,
        };

        //this.openPrompt(args);

        // Checkbox state always returned, even if cancel clicked.
        //checkValue.value = args.checked;

        // Did user click Ok or Cancel?
        return args.ok;
    },

    confirmEx : function (title, text, flags, button0, button1, button2,
                          checkLabel, checkValue) {

        if (!title)
            title = PromptUtils.getLocalizedString("Confirm");

        let args = {
            promptType:  "confirmEx",
            title,
            text,
            checkLabel,
            checked:     checkValue.value,
            ok:          false,
            buttonNumClicked: 1,
        };

        let [label0, label1, label2, defaultButtonNum, isDelayEnabled] =
            PromptUtils.confirmExHelper(flags, button0, button1, button2);

        args.defaultButtonNum = defaultButtonNum;
        args.enableDelay = isDelayEnabled;

        let buttons = [];
        if (label0) {
            args.button0Label = label0;
            buttons.push(label0);
            if (label1) {
                args.button1Label = label1;
                buttons.push(label1);
                if (label2) {
                    args.button2Label = label2;
                    buttons.push(label2);
                }
            }
        }
        let webpage = this._findWebPage();
        if (webpage) {
            if (PromptUtils.isSlowScriptDialog(title)) {
                if (webpage.onLongRunningScript) {
                    webpage.stopJavaScript.__interrupt__ = false;
                    webpage.onLongRunningScript(text.split('\n')[2]);
                    return Number(webpage.stopJavaScript.__interrupt__);
                }
                return 0;
            }
            if (webpage.onConfirm) {
                let chk = { label: checkLabel, checked: checkValue.value };
                let ok = webpage.onConfirm(text, title, buttons, chk);
                checkValue.value = !!chk.checked;
                if (ok === true) {
                    ok = 0;
                }
                else if (ok === false) {
                    ok = 1;
                }
                else {
                    ok = parseInt(ok, 10);
                    if (isNaN(ok)) {
                        ok = 0;
                    }
                }
                return ok;
            }
            return 0;
        }

        //this.openPrompt(args);

        // Checkbox state always returned, even if cancel clicked.
        //checkValue.value = args.checked;

        // Get the number of the button the user clicked.
        return args.buttonNumClicked;
    },

    nsIPrompt_prompt : function (title, text, value, checkLabel, checkValue) {
        if (!title)
            title = PromptUtils.getLocalizedString("Prompt");

        let webpage = this._findWebPage();
        if (webpage) {
            if (!webpage.onPrompt) {
                return false;
            }
            var result = webpage.onPrompt(text, value.value);

            if (result === null) {
                return false;
            }
            value.value = result;
            return true;
        }

        let args = {
            promptType: "prompt",
            title,
            text,
            value:      value.value,
            checkLabel,
            checked:    checkValue.value,
            ok:         false,
        };

        //this.openPrompt(args);

        // Did user click Ok or Cancel?
        let ok  = args.ok;
        if (ok) {
            checkValue.value = args.checked;
            value.value      = args.value;
        }

        return ok;
    },

    nsIPrompt_promptUsernameAndPassword : function (title, text, user, pass, checkLabel, checkValue) {
        if (!title)
            title = PromptUtils.getLocalizedString("PromptUsernameAndPassword2");

        let args = {
            promptType: "promptUserAndPass",
            title,
            text,
            user:       user.value,
            pass:       pass.value,
            checkLabel,
            checked:    checkValue.value,
            ok:         false,
        };

        this.openPrompt(args);

        // Did user click Ok or Cancel?
        let ok  = args.ok;
        if (ok) {
            checkValue.value = args.checked;
            user.value       = args.user;
            pass.value       = args.pass;
        }

        return ok;
    },

    nsIPrompt_promptPassword : function (title, text, pass, checkLabel, checkValue) {
        if (!title)
            title = PromptUtils.getLocalizedString("PromptPassword2");

        let args = {
            promptType: "promptPassword",
            title,
            text,
            pass:       pass.value,
            checkLabel,
            checked:    checkValue.value,
            ok:         false,
        }

        this.openPrompt(args);

        // Did user click Ok or Cancel?
        let ok  = args.ok;
        if (ok) {
            checkValue.value = args.checked;
            pass.value       = args.pass;
        }

        return ok;
    },

    select : function (title, text, count, list, selected) {
        if (!title)
            title = PromptUtils.getLocalizedString("Select");

        let args = {
            promptType: "select",
            title,
            text,
            list,
            selected:   -1,
            ok:         false,
        };

        this.openPrompt(args);

        // Did user click Ok or Cancel?
        let ok  = args.ok;
        if (ok)
            selected.value = args.selected;

        return ok;
    },


    /* ----------  nsIAuthPrompt  ---------- */


    nsIAuthPrompt_prompt : function (title, text, passwordRealm, savePassword, defaultText, result) {
        // The passwordRealm and savePassword args were ignored by nsPrompt.cpp
        if (defaultText)
            result.value = defaultText;
        return this.nsIPrompt_prompt(title, text, result, null, {});
    },

    nsIAuthPrompt_promptUsernameAndPassword : function (title, text, passwordRealm, savePassword, user, pass) {
        // The passwordRealm and savePassword args were ignored by nsPrompt.cpp
        return this.nsIPrompt_promptUsernameAndPassword(title, text, user, pass, null, {});
    },

    nsIAuthPrompt_promptPassword : function (title, text, passwordRealm, savePassword, pass) {
        // The passwordRealm and savePassword args were ignored by nsPrompt.cpp
        return this.nsIPrompt_promptPassword(title, text, pass, null, {});
    },


    /* ----------  nsIAuthPrompt2  ---------- */


    promptAuth : function (channel, level, authInfo, checkLabel, checkValue) {
        let message = PromptUtils.makeAuthMessage(channel, authInfo);

        let [username, password] = PromptUtils.getAuthInfo(authInfo);

        let [host, realm]  = PromptUtils.getAuthTarget(channel, authInfo);
        let credentials = {
            username:       username,
            password:       password
        };

        let ok = this._slimerPromptUsernameAndPassword(channel.URI.spec, authInfo, credentials, realm);
        if (ok) {
            if (checkValue) {
                checkValue.value = false;
            }
            PromptUtils.setAuthInfo(authInfo, credentials.username, credentials.password);
        }
        return ok;
    },

    asyncPromptAuth : function (channel, callback, context, level, authInfo, checkLabel, checkValue) {
        // Nothing calls this directly; netwerk ends up going through
        // nsIPromptService::GetPrompt, which delegates to login manager.
        // Login manger handles the async bits itself, and only calls out
        // promptAuth, never asyncPromptAuth.
        //
        // Bug 565582 will change this.
        throw Cr.NS_ERROR_NOT_IMPLEMENTED;
    },

    _slimerPromptUsernameAndPassword : function (url, authInfo, credentials, realm) {
        let webpage = null;

        if (authInfo.flags & Ci.nsIAuthInformation.AUTH_PROXY) {
            if (slConfiguration.proxyType === 'http' ||
                slConfiguration.proxyType === 'socks5' ||
                slConfiguration.proxyType === 'socks' ||
                (slConfiguration.proxyType === 'config-url' &&
                    slConfiguration.proxy &&
                    slConfiguration.proxy.startsWith('http'))
            ) {

                credentials.username = slConfiguration.proxyAuthUser;
                credentials.password = slConfiguration.proxyAuthPassword;

                if (authInfo.flags & Ci.nsIAuthInformation.PREVIOUS_FAILED) {
                    let errorMessage = 'Proxy authentication failed: the credentials you supplied were not correct.';

                    webpage = this._findWebPage();
                    if (webpage) {
                        webpage.resourceError({
                            id: null,
                            url: url,
                            errorCode: 105, // QNetworkReply::ProxyAuthenticationRequiredError
                            errorString: errorMessage
                        });
                    } else {
                        throw new Error(errorMessage);
                    }

                    return false;
                }

                let usernameProvided =
                    ('undefined' !== typeof credentials.username) &&
                    (null !== credentials.username) &&
                    ('' !== credentials.username);
                let passwordProvided =
                    ('undefined' !== typeof credentials.password) &&
                    (null !== credentials.password) &&
                    ('' !== credentials.password);
                let onlyPassword = (authInfo.flags & Ci.nsIAuthInformation.ONLY_PASSWORD);
                let credentialsProvided =
                    onlyPassword
                        ? passwordProvided
                        : usernameProvided && passwordProvided;

                if (!credentialsProvided) {
                    let errorMessage =
                        onlyPassword
                            ? 'Missing password required by proxy!'
                            : 'Missing username or password required by proxy!';

                    webpage = this._findWebPage();
                    if (webpage) {
                        webpage.resourceError({
                            id: null,
                            url: url,
                            errorCode: 105, // QNetworkReply::ProxyAuthenticationRequiredError
                            errorString: errorMessage
                        });
                    } else {
                        throw new Error(errorMessage);
                    }

                    return false;
                }

                return true;
            }

            return false;
        }

        let browser = slUtils.getBrowserFromContentWindow(this.domWin);
        if (browser) {
            webpage = browser.webpage;
        }

        if (!webpage) {
            return false;
        }

        let onlyPassword = (authInfo.flags & Ci.nsIAuthInformation.ONLY_PASSWORD);
        if (authInfo.flags & Ci.nsIAuthInformation.PREVIOUS_FAILED) {
            browser.authAttempts ++;
            let max = (webpage.settings.maxAuthAttempts === undefined?3:webpage.settings.maxAuthAttempts);
            if (browser.authAttempts >= max) {
                return false;
            }
        }

        if (onlyPassword
            && webpage.settings.password != ''
            && webpage.settings.password != null
            && webpage.settings.password != undefined
            ) {
            credentials.password = webpage.settings.password;
        }
        else if (!onlyPassword
                 && webpage.settings.userName != ''
                 && webpage.settings.userName != null
                 && webpage.settings.userName != undefined 
                 && webpage.settings.password != ''
                 && webpage.settings.password != null
                 && webpage.settings.password != undefined
                 ) {
            credentials.username = webpage.settings.userName;
            credentials.password = webpage.settings.password;
        }
        else if (webpage.onAuthPrompt) {
            let type = (authInfo.flags & Ci.nsIAuthInformation.AUTH_PROXY? 'proxy': 'http');
            return webpage.onAuthPrompt(type, url, realm, credentials);
        }

        return true;
    },

    /* ----------  nsIWritablePropertyBag2 ---------- */

    // Only a partial implementation, for one specific use case...

    setPropertyAsBool : function(name, value) {
        if (name == "allowTabModal")
            this.allowTabModal = value;
        else
            throw Cr.NS_ERROR_ILLEGAL_VALUE;
    },
};


function AuthPromptAdapterFactory() {
}
AuthPromptAdapterFactory.prototype = {
    classID          : Components.ID("{d49b3b06-afc2-4f72-9f9e-baffae1a4d8c}"),
    QueryInterface   : XPCOMUtils.generateQI([Ci.nsIAuthPromptAdapterFactory]),

    /* ----------  nsIAuthPromptAdapterFactory ---------- */

    createAdapter : function (oldPrompter) {
        return new AuthPromptAdapter(oldPrompter);
    }
};


// Takes an nsIAuthPrompt implementation, wraps it with a nsIAuthPrompt2 shell.
function AuthPromptAdapter(oldPrompter) {
    this.oldPrompter = oldPrompter;
}
AuthPromptAdapter.prototype = {
    QueryInterface : XPCOMUtils.generateQI([Ci.nsIAuthPrompt2]),
    oldPrompter    : null,

    /* ----------  nsIAuthPrompt2 ---------- */

    promptAuth : function (channel, level, authInfo, checkLabel, checkValue) {
        let message = PromptUtils.makeAuthMessage(channel, authInfo);

        let [username, password] = PromptUtils.getAuthInfo(authInfo);
        let userParam = { value: username };
        let passParam = { value: password };

        let [host, realm]  = PromptUtils.getAuthTarget(channel, authInfo);
        let authTarget = host + " (" + realm + ")";

        let ok;
        if (authInfo.flags & Ci.nsIAuthInformation.ONLY_PASSWORD)
            ok = this.oldPrompter.promptPassword(null, message, authTarget, Ci.nsIAuthPrompt.SAVE_PASSWORD_PERMANENTLY, passParam);
        else
            ok = this.oldPrompter.promptUsernameAndPassword(null, message, authTarget, Ci.nsIAuthPrompt.SAVE_PASSWORD_PERMANENTLY, userParam, passParam);

        if (ok)
            PromptUtils.setAuthInfo(authInfo, userParam.value, passParam.value);
        return ok;
    },

    asyncPromptAuth : function (channel, callback, context, level, authInfo, checkLabel, checkValue) {
        throw Cr.NS_ERROR_NOT_IMPLEMENTED;
    }
};


// Wrapper using the old embedding contractID, since it's already common in
// the addon ecosystem.
function EmbedPrompter() {
}
EmbedPrompter.prototype = new Prompter();
EmbedPrompter.prototype.classID          = Components.ID("{5598347d-7573-47b9-ae3c-a9c4e3f0e56b}");

var component = [Prompter, EmbedPrompter, AuthPromptAdapterFactory];
this.NSGetFactory = XPCOMUtils.generateNSGetFactory(component);
