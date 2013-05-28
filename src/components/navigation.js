
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;
dump("Navigation file loaded\n")
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://slimerjs/slUtils.jsm");

const IDS = Ci.nsIDocShell;
const IWN = Ci.nsIWebNavigation;


function makeLoadFlag(type, flags) { return type | (flags << 16);}

const LOAD_LINK = makeLoadFlag(IDS.LOAD_CMD_NORMAL, IWN.LOAD_FLAGS_IS_LINK);
const LOAD_HISTORY = makeLoadFlag(IDS.LOAD_CMD_HISTORY, IWN.LOAD_FLAGS_NONE);


dump("LOAD_LINK="+LOAD_LINK+"\n")
/*

    LOAD_NORMAL = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_NONE),
    LOAD_NORMAL_REPLACE = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_REPLACE_HISTORY),
    LOAD_NORMAL_EXTERNAL = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_FROM_EXTERNAL),
    LOAD_NORMAL_BYPASS_CACHE = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_BYPASS_CACHE),
    LOAD_NORMAL_BYPASS_PROXY = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_BYPASS_PROXY),
    LOAD_NORMAL_BYPASS_PROXY_AND_CACHE = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_BYPASS_CACHE | nsIWebNavigation::LOAD_FLAGS_BYPASS_PROXY),

    LOAD_LINK = makeLoadFlag(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_IS_LINK),

    LOAD_REFRESH = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_IS_REFRESH),
    LOAD_BYPASS_HISTORY = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_BYPASS_HISTORY),
    LOAD_STOP_CONTENT = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_STOP_CONTENT),
    LOAD_STOP_CONTENT_AND_REPLACE = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_STOP_CONTENT | nsIWebNavigation::LOAD_FLAGS_REPLACE_HISTORY),
    LOAD_REPLACE_BYPASS_CACHE = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, nsIWebNavigation::LOAD_FLAGS_REPLACE_HISTORY | nsIWebNavigation::LOAD_FLAGS_BYPASS_CACHE),
    LOAD_ERROR_PAGE = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_NORMAL, LOAD_FLAGS_ERROR_PAGE)



    LOAD_RELOAD_NORMAL = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_RELOAD, nsIWebNavigation::LOAD_FLAGS_NONE),
    LOAD_RELOAD_BYPASS_CACHE = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_RELOAD, nsIWebNavigation::LOAD_FLAGS_BYPASS_CACHE),
    LOAD_RELOAD_BYPASS_PROXY = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_RELOAD, nsIWebNavigation::LOAD_FLAGS_BYPASS_PROXY),
    LOAD_RELOAD_ALLOW_MIXED_CONTENT = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_RELOAD, nsIWebNavigation::LOAD_FLAGS_ALLOW_MIXED_CONTENT | nsIWebNavigation::LOAD_FLAGS_BYPASS_CACHE),
    LOAD_RELOAD_BYPASS_PROXY_AND_CACHE = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_RELOAD, nsIWebNavigation::LOAD_FLAGS_BYPASS_CACHE | nsIWebNavigation::LOAD_FLAGS_BYPASS_PROXY),
    LOAD_RELOAD_CHARSET_CHANGE = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_RELOAD, nsIWebNavigation::LOAD_FLAGS_CHARSET_CHANGE),

    LOAD_PUSHSTATE = MAKE_LOAD_TYPE(nsIDocShell::LOAD_CMD_PUSHSTATE, nsIWebNavigation::LOAD_FLAGS_NONE),
*/







function Navigation() {
dump("Navigation loaded\n")
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

dump("-------Navigation shouldLoad "+aContentLocation.spec+"\n")
        // ignore content that is not a document
        if (Ci.nsIContentPolicy.TYPE_DOCUMENT != aContentType
            && Ci.nsIContentPolicy.TYPE_SUBDOCUMENT != aContentType) {
          return result;
        }
dump("Navigation doc ok\n")

        // ignore content that is loaded from chrome, about, resource protocols etc..
        if (aContentLocation.scheme != 'http'
            && aContentLocation.scheme != 'https'
            && aContentLocation.scheme != 'ftp'
            && aContentLocation.scheme != 'file'
            ){
dump("Navigation ignore scheme \n")
            return result;
        }
            
dump("Navigation scheme ok\n")

        //------ retrieve the corresponding webpage object
        let [webpage, navtype] = this._findWebpage(aContext);
        if (!webpage)
            return result;
dump("Navigation webpage \n")
        // call the navigationRequest callback

        webpage.navigationRequested(aContentLocation.spec, navtype, !webpage.navigationLocked,
                                    (Ci.nsIContentPolicy.TYPE_DOCUMENT == aContentType));
dump("Navigation navigationRequested ok\n")

        // if the navigation request is blocked, refuse the content
        if (webpage.navigationLocked) {
            result = Ci.nsIContentPolicy.REJECT_REQUEST;
            dump("Navigation rejected\n")
        }
        else dump("Navigation accepted\n")
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
            let docshell = this._getDocShell(node.contentWindow.top);
            let navType = this._getNavType(docshell);

            if (node.localName == 'browser'
                || node.localName == 'iframe'
                || node.localName == 'frame') {
                dump("_findWebpage browser "+node.localName+" "+(node.webpage?"wb":"no wb")+"\n");
                return [(node.webpage?node.webpage: null), navType];
            }
            dump("_findWebpage from defaultview??\n");

            // FIXME: is this an <iframe> from the content or a XUL iframe?
            return this._getWebPageAndNavType(node.ownerDocument.defaultView);
        }
        catch(e){}

        // in the case where we receive a window
        // FIXME do we receive always a chrome window?
        try {
            aContext = aContext.QueryInterface(Ci.nsIDOMWindow);
            dump("_findWebpage win\n");
            if (aContext instanceof Ci.nsIDOMChromeWindow) {
                dump("_findWebpage chromewin\n");
                let browser = aContext.document.getElementById('webpage');
                if (browser) {
                    let navType = this._getNavType(browser.docShell);
                    return [browser.webpage, navType];
                }
                dump("_findWebpage chromewin has no browser\n");
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
            dump("_findWebpage doc\n");
            return this._getWebPageAndNavType(doc.defaultView);
        }
        catch(e){}
        dump("_findWebpage not found\n");
        return [null, null];
    },

    _getDocShell : function(contentWindow) {
        try {
            return contentWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                        .getInterface(IWN)
                        .QueryInterface(IDS)
        }
        catch(e) {
            dump("_getDocShell error: "+e+"\n");
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
        return getWebpageFromDocShell(docshell);
    },
    _getNavType : function(docshell) {
        let navType = "Undefined";
        dump("loadType="+docshell.loadType+"\n")
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
        }
        //FIXME: "FormSubmitted" "FormResubmitted"

        return navType;
    }
}

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([Navigation]);
