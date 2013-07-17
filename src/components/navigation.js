
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://slimerjs/slUtils.jsm");

const IDS = Ci.nsIDocShell;
const IWN = Ci.nsIWebNavigation;


function makeLoadFlag(type, flags) { return type | (flags << 16);}

const LOAD_LINK = makeLoadFlag(IDS.LOAD_CMD_NORMAL, IWN.LOAD_FLAGS_IS_LINK);
const LOAD_HISTORY = makeLoadFlag(IDS.LOAD_CMD_HISTORY, IWN.LOAD_FLAGS_NONE);

function Navigation() {
}

Navigation.prototype = {
    classID          : Components.ID("{5a5f9d66-53b5-4541-8225-cae868541bc2}"),
    classDescription: "Navigation manager for SlimerJS",
    QueryInterface   : XPCOMUtils.generateQI([Ci.nsIContentPolicy]),

    // short shouldLoad(in unsigned long aContentType, in nsIURI aContentLocation,
    //                  in nsIURI aRequestOrigin, in nsISupports aContext,
    //                  in ACString aMimeTypeGuess, in nsISupports aExtra, in nsIPrincipal aRequestPrincipal);
    shouldLoad : function(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
        let result = Ci.nsIContentPolicy.ACCEPT;

        // ignore content that is not a document
        if (Ci.nsIContentPolicy.TYPE_DOCUMENT != aContentType
            && Ci.nsIContentPolicy.TYPE_SUBDOCUMENT != aContentType) {
          return result;
        }

        // ignore content that is loaded from chrome, about, resource protocols etc..
        if (aContentLocation.scheme != 'http'
            && aContentLocation.scheme != 'https'
            && aContentLocation.scheme != 'ftp'
            && aContentLocation.scheme != 'file'
            ){
            return result;
        }

        //------ retrieve the corresponding webpage object
        let [webpage, navtype] = this._findWebpage(aContext);
        if (!webpage)
            return result;

        // call the navigationRequest callback
        webpage.navigationRequested(aContentLocation.spec, navtype, !webpage.navigationLocked,
                                    (Ci.nsIContentPolicy.TYPE_DOCUMENT == aContentType));


        // if the navigation request is blocked, refuse the content
        if (webpage.navigationLocked) {
            result = Ci.nsIContentPolicy.REJECT_REQUEST;
        }
        return result;
    },

    // short shouldProcess(in unsigned long aContentType, in nsIURI aContentLocation,
    //                  in nsIURI aRequestOrigin, in nsISupports aContext,
    //                  in ACString aMimeType, in nsISupports aExtra, in nsIPrincipal aRequestPrincipal);
    shouldProcess : function(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeType, aExtra) {
        return Ci.nsIContentPolicy.ACCEPT;
    },

    /**
     * @param mixed aContext it could be
     *     - the element that own the content (<browser>, <iframe>...)
     *     - or the window
     *     - or the document (of the content ?).
     */
    _findWebpage : function(aContext) {
        // this function mimic NS_CP_GetDocShellFromContext
        if (!aContext) {
            return [null, null];
        }

        // in the case where we receive a DOM element: this is can be a xul <browser>
        // for top window or an html <(i)frame> ...
        try {
            let node = aContext.QueryInterface(Ci.nsIDOMElement);
            let docshell = this._getDocShell(node.contentWindow);

            if (node.localName != 'browser') {
                // this is an html frame : retrieve the corresponding browser
                node = docshell.chromeEventHandler;
                if (!node) {
                   return [null, null];
                }
                docshell = node.docShell;
            }

            let navType = this._getNavType(docshell);
            return [(node.webpage?node.webpage: null), navType];
        }
        catch(e){}

        // in the case where we receive a window
        // FIXME do we receive always a chrome window?
        try {
            aContext = aContext.QueryInterface(Ci.nsIDOMWindow);
            if (aContext instanceof Ci.nsIDOMChromeWindow) {
                let browser = aContext.document.getElementById('webpage');
                if (browser) {
                    let navType = this._getNavType(browser.docShell);
                    return [browser.webpage, navType];
                }
                return [null, null];
            }
            else {
                return this._getWebpageAndNavType(aContext);
            }
        }
        catch(e){}

        // in the case where we receive a document
        let doc;
        try {
            doc = aContext.QueryInterface(Ci.nsIDOMDocument);
            return this._getWebPageAndNavType(doc.defaultView);
        }
        catch(e){}
        return [null, null];
    },

    _getDocShell : function(contentWindow) {
        try {
            return contentWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                        .getInterface(IWN)
                        .QueryInterface(IDS)
        }
        catch(e) {
            return null;
        }
    },
    _getWebPageAndNavType : function (contentWindow) {
        let dc = this._getDocShell(contentWindow);
        if (dc)
            return [this._getWebPage(dc), this._getNavType(dc)];
        return [null, null]
    },
    _getWebPage : function(docshell) {
        return slUtils.getWebpageFromDocShell(docshell);
    },
    _getNavType : function(docshell) {
        let navType = "Undefined";

        // FIXME it seems that the loadType on the docshell is not updated
        // at this time, and we have the value of the previous loading.
        // so the value of navtype is not correct. We should not use it :-/
        /*dump("loadType="+docshell.loadType+"\n")
        if (docshell.loadType & IDS.LOAD_CMD_RELOAD) {
            navType = "Reload";
        }
        else if (docshell.loadType & IDS.LOAD_CMD_HISTORY
                 ||docshell.loadType & IDS.LOAD_CMD_PUSHSTATE) {
            navType = "BackOrForward";
        }
        else if (docshell.loadType == LOAD_LINK) {
            navType = "LinkClicked";
        }
        else if (docshell.loadType & IDS.LOAD_CMD_NORMAL) {
            navType = "Other"
        }*/
        //FIXME: "FormSubmitted" "FormResubmitted"

        return navType;
    }
}

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([Navigation]);
