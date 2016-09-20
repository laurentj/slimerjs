/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { Cc, Ci, Cu, Cr } = require('chrome');
Cu.import('resource://slimerjs/slLauncher.jsm');
Cu.import('resource://slimerjs/slUtils.jsm');
Cu.import('resource://slimerjs/slConsole.jsm');
Cu.import('resource://slimerjs/slConfiguration.jsm');
Cu.import('resource://slimerjs/slimer-sdk/phantom.jsm');
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import('resource://slimerjs/slPhantomJSKeyCode.jsm');
Cu.import('resource://slimerjs/slQTKeyCodeToDOMCode.jsm');
Cu.import('resource://slimerjs/webpageUtils.jsm');
Cu.import('resource://slimerjs/slCookiesManager.jsm');
Cu.import('resource://slimerjs/slDebug.jsm');



const de = Ci.nsIDocumentEncoder
const {validateOptions} = require("sdk/deprecated/api-utils");

const fs = require("sdk/io/file");
const base64 = require("sdk/base64");
const Q = require("sdk/core/promise");
const heritage = require("sdk/core/heritage");
const systemPrincipal = Cc['@mozilla.org/systemprincipal;1']
                        .createInstance(Ci.nsIPrincipal);
const netLog = require('net-log');
netLog.startTracer();

/**
 * create a webpage object
 * @module webpage
 */
function create() {
    let [webpage, win] = _create(null);
    return webpage;
}
exports.create = create;

/**
 * @return [webpage, window]
 */
function _create(parentWebpageInfo) {

    // -----------------------  private properties and functions for the webpage object

    /**
     * the <browser> element loading the webpage content
     */
    var browser = null;

    var browserJustCreated = true;
    /**
     * library path
     */
    var libPath = (slConfiguration.scriptFile ? slConfiguration.scriptFile.parent.clone(): null);

    /**
     * utility function to create a sandbox when executing a
     * user script in the webpage content
     */
    function createSandBox(win) {
        let sandbox = Cu.Sandbox(win,
            {
                'principal':systemPrincipal,
                'sandboxName': browser.currentURI.spec,
                'sandboxPrototype': win,
                'wantXrays': false
            });
        return sandbox;
    }

    var webPageSandbox = null;

    /**
     * evaluate javascript code into a sandbox
     * @see webpage.evaluate(), webpage.evaluateJavascript()...
     * @param string src the source code to evaluate
     * @param string file the file name associated to the source code
     */
    function evalInSandbox (src, file) {
        if (!webPageSandbox) {
            webPageSandbox = new WeakMap();
        }
        let win = getCurrentFrame();
        if (!webPageSandbox.has(win)) {
            webPageSandbox.set(win, createSandBox(win));
        }
        try {
            let res = Cu.evalInSandbox(src, webPageSandbox.get(win), 'ECMAv5', file, 1);
            // QWebFrame.evaluateJavascript() used by PhantomJS
            // always returns null when no value are returned by
            // the script.
            if (res === undefined) {
                return null;
            }
            return res;
        }
        catch(e) {
            if (webpage.onError) {
                let [msg, stackRes] = getTraceException(e, '');
                executePageListener(webpage, 'onError', ['Error: '+msg, stackRes]);
                return null;
            }
            else {
                throw new Error('Error during javascript evaluation in the web page: '+e)
            }
        }
    }

    /**
     * an observer for the Observer Service.
     * It observes console events.
     */
    var webpageObserver = {
        QueryInterface: XPCOMUtils.generateQI([Ci.nsISupportsWeakReference,Ci.nsIObserver]),

        observe: function webpageobserver_observe(aSubject, aTopic, aData) {
            if (aTopic == "console-api-log-event") {
                if (!webpage.onConsoleMessage)
                    return;
                // aData == outer window id
                // aSubject == console event object. see http://mxr.mozilla.org/mozilla-central/source/devtools/shared/Console.jsm#526
                var consoleEvent = aSubject.wrappedJSObject;
                if (webpageUtils.isOurWindow(browser, aData)) {
                    var args = consoleEvent.arguments;
                    if (!Array.isArray(args)) {
                        args = Array.prototype.slice.call(args);
                    }
                    executePageListener(webpage, 'onConsoleMessage', [
                        args.join(' '),
                        consoleEvent.lineNumber,
                        consoleEvent.filename,
                        consoleEvent.level,
                        consoleEvent.functionName,
                        consoleEvent.timeStamp]);
                    return
                }
                return;
            }
        }
    }

    /**
     * a listener for the console service, to track errors in the content window.
     */
    var jsErrorListener = {
        observe:function( aMessage ){
            //dump(" ************** jsErrorListener\n");
            if (!webpage.onError)
                return;
            try {
                let msg = aMessage.QueryInterface(Ci.nsIScriptError);
                /*dump(" on error:"+msg.errorMessage+
                     "("+msg.category+") f:"+msg.flags
                     +" ow:"+msg.outerWindowID
                     +" is:"+webpageUtils.isOurWindow(browser, msg.outerWindowID)+"\n")*/
                let frameUrl = webpageUtils.isOurWindow(browser, msg.outerWindowID);
                if (msg instanceof Ci.nsIScriptError
                    && !(msg.flags & Ci.nsIScriptError.warningFlag)
                    && msg.outerWindowID
                    && frameUrl
                    && msg.category == "content javascript"
                    ) {
                    let [m, stack] = getTraceException(msg, null);
                    webpage.onError(msg.errorMessage, stack);
                }
            }
            catch(e) {
                //dump("**************** jsErrorListener err:"+e+"\n")
            }
        },
        QueryInterface: function (iid) {
            if (!iid.equals(Ci.nsIConsoleListener) &&
                !iid.equals(Ci.nsISupports)) {
                throw Cr.NS_ERROR_NO_INTERFACE;
            }
            return this;
        }
    };

    /**
     * build an object of options for the netlogger
     */
    function getNetLoggerOptions(webpage, deferred, firstRequestHeaders) {
        var wycywigReg = /^wyciwyg:\/\//;
        var firstRequestHeadersUsed = false;
        return {
            _onRequest: function(request) {
                request = request.QueryInterface(Ci.nsIHttpChannel);
                if (webpage.settings.userAgent)
                    request.setRequestHeader("User-Agent", webpage.settings.userAgent, false);
                let h;
                if (firstRequestHeadersUsed) {
                    h = webpage.customHeaders;
                }
                else {
                    h = firstRequestHeaders;
                    firstRequestHeadersUsed = true;
                }
                for (var hname in h) {
                    request.setRequestHeader(hname, h[hname], false);
                }
            },
            onRequest: function(requestData, request) {
                webpage.resourceRequested(requestData, request);
            },
            onResponse:  function(res) {
                webpage.resourceReceived(res);
            },
            onTimeout : function(res) {
                webpage.resourceTimeout(res);
            },
            onError:  function(err) {
                webpage.resourceError(err);
            },
            getCaptureTypes: function() {
                return webpage.captureContent;
            },
            onLoadStarted: function(url){
                if (wycywigReg.test(url)) {
                    return;
                }
                webpage.loadStarted(url, false);
            },
            onURLChanged: function(url){
                if (wycywigReg.test(url)) {
                    return;
                }
                webpage.urlChanged(url);
            },
            onTransferStarted :null,
            onContentLoaded: function(url, success){
                if (wycywigReg.test(url)) {
                    return;
                }
                try {
                    Services.console.unregisterListener(jsErrorListener);
                }catch(e){}

                Services.console.registerListener(jsErrorListener);
                // phantomjs call onInitialized not only at the page creation
                // but also after the content loading.. don't know why.
                // let's imitate it. Only after a success
                if (success) {
                    webpage.initialized();
                }
            },
            onLoadFinished: function(url, success){
                if (wycywigReg.test(url)) {
                    return;
                }
                webpage.loadFinished(success, url, false);
                if (privProp.staticContentLoading) {
                    privProp.staticContentLoading = false;
                }
                if (deferred)
                    deferred.resolve(success);
            },
            onFrameLoadStarted : function(url, duringMainLoad) {
                if (wycywigReg.test(url)) {
                    return;
                }
                if (!duringMainLoad)
                    webpage.loadStarted(url, true)
            },
            onFrameLoadFinished : function(url, success, frameWindow, duringMainLoad) {
                if (wycywigReg.test(url)) {
                    return;
                }
                if (!duringMainLoad)
                    webpage.loadFinished(success, url, true);
            }
        }
    }

    /**
     * object that intercepts all window.open() of the web content
     */
    var slBrowserDOMWindow = {

        QueryInterface : function(aIID) {
            if (aIID.equals(Ci.nsIBrowserDOMWindow) ||
                aIID.equals(Ci.nsISupports))
                return this;
            throw Cr.NS_NOINTERFACE;
        },

        /**
         * called by nsContentTreeOwner::ProvideWindow
         * when a window should be opened (window.open is invoked by a web page)
         * @param aURI in our case, it is always null
         * @param aWhere nsIBDW.OPEN_DEFAULTWINDOW, OPEN_CURRENTWINDOW OPEN_NEWWINDOW OPEN_NEWTAB OPEN_SWITCHTAB
         * @param aContext nsIBDW.OPEN_EXTERNAL (external app which ask to open the url), OPEN_NEW
         * @return the nsIDOMWindow object where to load the URI
         */
        openURI : function(aURI, aOpener, aWhere, aContext)
        {
            // create the webpage object for this child window
            let opener = (webpage.ownsPages?aOpener:null);
            let parentWPInfo = null;
            let childPage, win;
            if (webpage.ownsPages) {
                parentWPInfo = {
                    window: opener,
                    detachChild:function(child){
                        let idx = privProp.childWindows.indexOf(child);
                        if (idx != -1) {
                            privProp.childWindows.splice(0,1);
                        }
                    }
                }
            }
            [childPage, win] = _create(parentWPInfo);

            if (webpage.ownsPages) {
                privProp.childWindows.push(childPage);
            }

            // call the callback
            webpage.rawPageCreated(childPage);

            // returns the contentWindow of the browser element
            // nsContentTreeOwner::ProvideWindow and other will
            // load the expected URI into it.
            return win.content;
        },

        openURIInFrame : function(aURI, aOpener, aWhere, aContext) {
            return null;
        },

        isTabContentWindow : function(aWindow) {
            return false;
        }
    }

    /**
     * some private parameters
     */
    var privProp = {
        clipRect : null,
        framePath : [],
        childWindows : [], // list of webpage of child windows
        settings: {},
        viewportSize : {},
        staticContentLoading : false,
        paperSize : null
    }

    let defaultViewportSize = slConfiguration.getDefaultViewportSize();
    privProp.viewportSize.width = defaultViewportSize.width;
    privProp.viewportSize.height = defaultViewportSize.height;

    let defaultSettings = slConfiguration.getDefaultWebpageConfig();
    for (let p in defaultSettings) {
        privProp.settings[p] = defaultSettings[p]
    }

    function getCurrentFrame() {
        if (!browser)
            return null;
        var win = browser.contentWindow;
        win.name = ''; // it seems that the root window take the name of the xul window
        privProp.framePath.forEach(function(frameName){
            if (win == null)
                return;
            if ((typeof frameName) == 'number') {
                if (frameName < win.frames.length) {
                    win = win.frames[frameName];
                }
                else
                    win = null;
            }
            else if ((typeof frameName) == 'string') {
                let found = false;
                for(let i=0; i < win.frames.length; i++) {
                    if (win.frames[i].name == frameName) {
                        win = win.frames[i];
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    win = null;
                }
            }
            else
                win = null;
        });
        return win;
    }

    /**
     *  @return array 0:the webpage object, 1:the chrome window
     */
    function openBlankBrowser(noInitializedEvent) {
        let options = getNetLoggerOptions(webpage, null, webpage.customHeaders);
        let ready = false;
        let parentWindow = (parentWebpageInfo?parentWebpageInfo.window:null);
        let win = slLauncher.openBrowser(function(nav){
            browser = nav;
            browser.webpage = webpage;
            browserJustCreated = true;
            browser.authAttempts = 0;
            Services.obs.addObserver(webpageObserver, "console-api-log-event", true);
            netLog.registerBrowser(browser, options);
            if (!noInitializedEvent)
                webpage.initialized();
            ready = true;
        }, parentWindow, privProp.viewportSize);

        win.QueryInterface(Ci.nsIDOMChromeWindow)
           .browserDOMWindow = slBrowserDOMWindow;

        // we're waiting synchronously after the initialisation of the new window, because we need
        // to have a ready browser element and then to have an existing win.content.
        // slBrowserDOMWindow.openURI needs to return this win.content so the
        // caller will load the URI into this window object.
        let thread = Services.tm.currentThread;
        while (!ready)
            thread.processNextEvent(true);

        return [webpage, win];
    }

    function prepareJSEval(func, args) {

        if (!(func instanceof Function
              || typeof func === 'function'
              || typeof func === 'string'
              || func instanceof String)) {
            return false;
        }

        let argsList = args.map(
            function(arg){
                  let type = typeof arg;
                  switch(type) {
                      case 'object':
                          if (!arg || arg instanceof RegExp) {
                              return ""+arg;
                          }
                      case 'array':
                      case 'string':
                          return JSON.stringify(arg);
                      case "date":
                          return "new Date(" + JSON.stringify(arg) + ")";
                      default:
                          return ""+arg
                  }
            });

        return '('+func.toString()+').apply(this, [' + argsList.join(",") + ']);';
    }

    // ----------------------------------- webpage

    /**
     * the webpage object itself
     * @module webpage
     */
    var webpage = {

        /**
         * toString on a webpage object indicates
         * qtruntimeobject in PhantomJS.
         * here is an alternate way to know if the
         * object is a webpage object
         */
        __type : 'qtruntimeobject',

        get objectName () {
            return "WebPage";
        },

        /**
          Object containing various settings of the web page

            - javascriptEnabled: false if scripts of the page should not be executed (defaults to true).
            - loadImages: false to not load images (defaults to true).
            - localToRemoteUrlAccessEnabled: defines whether local resource (e.g. from file) can access remote URLs or not (defaults to false).
            - userAgent defines the user agent sent to server when the web page requests resources.
            - userName sets the user name used for HTTP authentication.
            - password sets the password used for HTTP authentication.
            - XSSAuditingEnabled defines whether load requests should be monitored for cross-site scripting attempts (defaults to false).
            - webSecurityEnabled defines whether web security should be enabled or not (defaults to true).
            - maxAuthAttempts: integer
            - resourceTimeout: integer, in milliseconds. warning, it is converted into seconds
            - javascriptCanOpenWindows
            - javascriptCanCloseWindows
            Note: The settings apply only during the initial call to the WebPage#open function. Subsequent modification of the settings object will not have any impact.
         */
        get settings (){
            return privProp.settings;
        },

        set settings (val){
            privProp.settings = heritage.mix(privProp.settings, val);
        },

        /**
         * list of regexp matching content types
         * of resources for which you want to retrieve the content.
         * The content is then set on the body property of the response
         * object received by your onResourceReceived callback
         */
        captureContent : [],

        // ------------------------ cookies and headers

        /**
         * list of headers to set on every request for the webpage
         */
        customHeaders : {},

        /**
         * retrieve the list of cookies of the domain of the current url
         * @return cookie[]
         */
        get cookies() {
            if (!browser || browserJustCreated || !browser.currentURI)
                return [];
            return slCookiesManager.getCookiesForUri(browser.currentURI);
        },

        /**
         * set a list of cookies for the domain of the web page
         * @param cookie[] val
         */
        set cookies(val) {
            if (!browser || browserJustCreated)
                return;
            slCookiesManager.setCookies(val, browser.currentURI);
        },

        /**
         * add a cookie in the cookie manager for the current url
         * @param cookie cookie
         * @return boolean true if the cookie has been set
         */
        addCookie: function(cookie) {
            if (!browser || browserJustCreated)
                return false;
            return slCookiesManager.addCookie(cookie, browser.currentURI);
        },

        /**
         * erase all cookies of the current domain
         */
        clearCookies: function() {
            if (browser && !browserJustCreated)
                slCookiesManager.clearCookies(browser.currentURI);
        },

        /**
         * delete all cookies that have the given name
         * on the current domain
         * @param string cookieName  the cookie name
         * @return boolean true if deletion is ok
         */
        deleteCookie: function(cookieName) {
            if (!browser || browserJustCreated)
                return false;
            return slCookiesManager.deleteCookie(cookieName, browser.currentURI);
        },

        // -------------------------------- History

        get canGoBack () {
            return browser.canGoBack;
        },

        get canGoForward () {
            return browser.canGoForward;
        },

        go : function(indexIncrement) {
            let h = browser.sessionHistory;
            let index = h.index + indexIncrement;
            if (index >= h.count || index < 0)
                return;
            browser.gotoIndex(index);
        },

        goBack : function() {
            browser.goBack();
        },

        goForward : function() {
            browser.goForward();
        },

        navigationLocked : false,

        reload : function() {
            browser.reload();
        },

        stop : function() {
            browser.stop();
        },

        // -------------------------------- Window manipulation

        /**
         * Open a web page in a browser
         *
         * It can accept several arguments and only the first
         * one is required:
         *
         * open(url)
         * open(url, callback)
         * open(url, httpConf)
         * open(url, httpConf, callback)
         * open(url, operation, data)
         * open(url, operation, data, callback)
         * open(url, operation, data, headers, callback)
         *
         * @param string url    the url of the page to open
         * @param function callback  a function called when the page is loaded. it
         *                           receives "success" or "fail" as parameter.
         * @param string|object httpConf see httpConf arg of openUrl
         * @param string operation
         * @param string data
         * @param object headers
         */
        open: function(url, arg1, arg2, arg3, arg4) {

            switch(arguments.length) {
                case 1:
                    return this.openUrl(url, 'get');
                    break;
                case 2:
                    if (typeof arg1 === 'function') {
                        return this.openUrl(url, 'get', null, arg1);
                    }
                    else {
                        return this.openUrl(url, arg1);
                    }
                    break;
                case 3:
                    if (typeof arg2 === 'function') {
                        return this.openUrl(url, arg1, null, arg2);
                    }
                    else {
                        return this.openUrl(url, {
                            operation: arg1,
                            data: arg2
                        });
                    }
                    break;
                case 4:
                    return this.openUrl(url, {
                            operation: arg1,
                            data: arg2
                        }, null, arg3);
                    break;
                case 5:
                    return this.openUrl(url, {
                            operation: arg1,
                            data: arg2,
                            headers: arg3
                        }, null, arg4);
                    break;
            }
            throw "open: arguments are missing";
        },

        /**
         * open a webpage
         * @param string url       the url of the page to load
         * @param string httpConf  the http method 'get', 'post', 'head', 'post', 'delete'
         * @param object httpConf  an object with two properties
         *          operation: http method (default: get)
         *          data: body of the request
         *          headers: (optional)
         *          encoding: (optional, default utf8)
         * @param object settings  it replaces webpage.settings.
         * @return void
         */
        openUrl: function(url, httpConf, settings, callback) {

            if (settings) {
                this.settings = settings;
            }

            if (!httpConf) {
                httpConf = {
                    operation: 'get',
                }
            }
            else if (typeof httpConf == 'string') {
                httpConf = {
                    operation: httpConf,
                }
            }

            var me = this;

            // create a promise that we will return
            let deferred = Q.defer();
            deferred.promise.then(function(result) {
                if (callback) {
                    try {
                        callback(result);
                        callback = null;
                    }
                    catch(e) {
                        slLauncher.showError(e);
                    }
                }
                return result;
            });

            let options = getNetLoggerOptions(this, deferred, this.customHeaders);

            let loadUri = function() {
                netLog.registerBrowser(browser, options);
                try {
                    webpageUtils.browserLoadURI(browser, url, httpConf);
                }
                catch(e) {
                    // we simulate PhantomJS behavior on url errors
                    options.onLoadStarted('');
                    options.onURLChanged('about:blank');
                    if (e.message == 'NS_ERROR_UNKNOWN_PROTOCOL') {
                        options.onRequest({
                            id: 1,
                            method: httpConf.operation,
                            url: url,
                            time: new Date(),
                            headers: (('headers' in httpConf)?httpConf.headers:[])
                            }, null
                        );
                        options.onError({id: 1,
                            url: url,
                            errorCode:301,
                            errorString:"Protocol is unknown"
                        });
                        options.onResponse( {
                            id: 1,
                            url: url,
                            time: new Date(),
                            headers: [],
                            bodySize: 0,
                            contentType: null,
                            contentCharset: null,
                            redirectURL: null,
                            stage: "end",
                            status: null,
                            statusText: null,
                            // Extensions
                            referrer: "",
                            isFileDownloading : false,
                            body: ""
                        });
                    }
                    options.onLoadFinished(url, "fail");
                }
            }
            
            if (DEBUG_WEBPAGE)
                slDebugLog("webpage: openUrl "+url+" conf:"+slDebugGetObject(httpConf));

            if (browser) {
                if (browserJustCreated){
                    webpage.initialized();
                    browserJustCreated = false;
                }
                // don't recreate a browser if already opened.
                loadUri();
                return deferred.promise;
            }

            var win = slLauncher.openBrowser(function(nav){
                browser = nav;
                browser.webpage = me;
                Services.obs.addObserver(webpageObserver, "console-api-log-event", true);
                browser.stop();
                me.initialized();
                browserJustCreated = false;
                browser.authAttempts = 0;
                loadUri();
            }, null, privProp.viewportSize);
            // to catch window.open()
            win.QueryInterface(Ci.nsIDOMChromeWindow)
               .browserDOMWindow= slBrowserDOMWindow;
            return deferred.promise;
        },

        /**
         * close the browser
         */
        close: function() {
            if (browser) {
                browser.closing = true;
                try {
                    Services.console.unregisterListener(jsErrorListener);
                }catch(e){}
                try {
                    Services.obs.removeObserver(webpageObserver, "console-api-log-event");
                }catch(e){}
                netLog.unregisterBrowser(browser);
                this.closing(this);
                slLauncher.closeBrowser(browser);
                browser.webpage = null;
                if (parentWebpageInfo) {
                    parentWebpageInfo.detachChild(this);
                }
            }
            webPageSandbox = null;
            browser=null;
            if (DEBUG_WEBPAGE)
                slDebugLog("webpage: close");
        },

        /**
         * function called when the browser is being closed, during a call of WebPage.close()
         * or during a call of window.close() inside the web page
         */
        onClosing: null,

        /**
         * This boolean indicates if pages opening by the webpage (by window.open())
         * should be children of the webpage (true) or not (false). Default is true.
         *
         * If true, children pages can be retrieved by getPage(), pages, pagesWindowName
         */
        ownsPages : true,

        /**
         * Returns a Child Page that matches the given "window.name".
         *
         * @param string windowName
         * @return webpage the found webpage
         */
        getPage: function (windowName) {
            let pages = privProp.childWindows.filter(function(page){
                if(page.windowName == windowName)
                    return true;
                return false;
            });
            if (pages.length)
                return pages[0];
            return null;
        },

        /**
         * Returns a list of child pages that this page has currently opened
         * with `window.open()`.
         * If a child page is closed (by `window.close()` or by `webpage.close()`),
         * the page is automatically removed from this list.
         *
         * You should not keep a strong reference to this array since you obtain
         * only a copy, so you won't see changes.
         *
         * If "ownsPages" is "false", this list won't owns the child pages.
         *
         * @return array list of child pages currently opened.
         */
        get pages () {
            return privProp.childWindows.filter(function(page){ return true;});
        },

        /**
         * Returns a list of window name of child pages.
         *
         * The window name is the name given to `window.open()`.
         *
         * The list is only from child pages that have been created when
         * ownsPages was true.
         *
         * @return array  list of strings
         */
        get pagesWindowName () {
            return privProp.childWindows.map(function(page){ return page.windowName;});
        },

        release : function() {
            this.close();
        },

        get scrollPosition() {
            let pos = {top:0, left:0}
            pos.top = browser.contentWindow.scrollY;
            pos.left = browser.contentWindow.scrollX;
            return pos;
        },

        set scrollPosition(val) {
            let pos = heritage.mix({top:0, left:0}, val);
            browser.contentWindow.scrollTo(pos.left, pos.top);
        },

        get url() {
            if (browser && !browserJustCreated)
                return browser.currentURI.spec;
            return "";
        },

        get viewportSize() {
            if (!browser)
                return {
                    width: privProp.viewportSize.width,
                    height: privProp.viewportSize.height
                };
            let win = browser.ownerDocument.defaultView.top;
            return {
                width: win.innerWidth,
                height: win.innerHeight
            }
        },

        set viewportSize(val) {

            if (typeof val != "object")
                throw new Error("Bad argument type");

            val = heritage.mix({width:privProp.viewportSize.width,
                               height:privProp.viewportSize.height}, val);
            let w = val.width || privProp.viewportSize.width;
            let h = val.height || privProp.viewportSize.height;

            if (typeof w != "number") {
                w = parseInt(w, 10);
            }
            if (typeof h != "number") {
                h = parseInt(h, 10);
            }
            if (w < 0 || h < 0) {
                return;
            }

            privProp.viewportSize.width = w;
            privProp.viewportSize.height = h;

            if (!browser)
                return;

            let win = browser.ownerDocument.defaultView.top;

            let domWindowUtils = win.QueryInterface(Ci.nsIInterfaceRequestor)
                                    .getInterface(Ci.nsIDOMWindowUtils);
            if ('setCSSViewport' in domWindowUtils) {
                domWindowUtils. setCSSViewport(w,h);
            }
            win.resizeTo(w,h);
            domWindowUtils.redraw(1);
        },

        get windowName () {
            if (!browser)
                return null;
            return browser.contentWindow.name;
        },

        // -------------------------------- frames manipulation

        childFramesCount: function () {
            return this.framesCount;
        },

        childFramesName : function () {
            return this.framesName;
        },

        currentFrameName : function () {
            return this.frameName;
        },

        get frameUrl() {
            var win = getCurrentFrame();
            if (!win){
                return '';
            }
            return win.location.href;
        },

        get focusedFrameName () {
            if (!browser) {
                return '';
            }
            var win = webpageUtils.getFocusedWindow();
            if (win && win.name && win.name != 'webpage')
                return win.name;
            return '';
        },

        get framesCount () {
            var win = getCurrentFrame();
            if (!win){
                return 0;
            }
            return win.frames.length;
        },

        get frameName () {
            var win = getCurrentFrame();
            if (!win){
                return false;
            }
            return win.name;
        },

        get framesName () {
            var win = getCurrentFrame();
            if (!win){
                return [];
            }
            let l = [];
            for(let i = 0; i < win.frames.length; i++) {
                l.push(win.frames[i].name);
            }
            return l;
        },

        switchToFocusedFrame: function() {
            if (!browser) {
                return false;
            }
            var win = webpageUtils.getFocusedWindow();
            if (!win)
                return -1;
            var l = [];
            while(browser.contentWindow != win) {
                if (win.name) {
                    l.unshift(win.name)
                }
                else {
                    let f = win.parent.frames;
                    let found = false;
                    for (let i=0; i < f.length;i++) {
                        if (f[i] == win) {
                            l.unshift(i);
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        return -2;
                }
                win = win.parent;
            }
            privProp.framePath = l;
            return true;
        },

        switchToFrame: function(frameName) {
            privProp.framePath.push(frameName);
            var win = getCurrentFrame();
            if (!win){
                privProp.framePath.pop();
                return false;
            }
            return true;
        },

        switchToChildFrame: function(frame) {
            return this.switchToFrame(frame);
        },

        switchToMainFrame: function() {
            privProp.framePath = [];
        },

        switchToParentFrame: function() {
            if (privProp.framePath.length) {
                privProp.framePath.pop();
                return true;
            }
            else
                return false;
        },

        get frameContent() {
            var win = getCurrentFrame();
            if (!win){
                return false;
            }
            return webpageUtils.getWindowContent(win, null, false);
        },

        set frameContent(val) {
            var win = getCurrentFrame();
            if (!win){
                return;
            }

            let webNav = win.QueryInterface(Ci.nsIInterfaceRequestor)
                            .getInterface(Ci.nsIWebNavigation);
            let docShell = webNav.QueryInterface(Ci.nsIDocShell);

            if ((typeof content) != "string") {
                // for given DOM node, serialize it
                let encoder = Cc["@mozilla.org/layout/documentEncoder;1?type=text/html"]
                                .createInstance(Ci.nsIDocumentEncoder);
                encoder.init(document, "text/html", de.OutputLFLineBreak | de.OutputRaw);
                encoder.setNode(content);
                content = encoder.encodeToString();
            }

            privProp.staticContentLoading = true;
            webpageUtils.setWindowContent (docShell, content, webNav.currentURI.clone());

            // wait until the content is loaded
            let thread = Services.tm.currentThread;
            while (privProp.staticContentLoading)
                thread.processNextEvent(true);
        },

        get framePlainText() {
            var win = getCurrentFrame();
            if (!win){
                return false;
            }

            return webpageUtils.getWindowContent(win, null, true, privProp.settings.plainTextAllContent);
        },

        get frameTitle() {
            var win = getCurrentFrame();
            if (!win){
                return '';
            }
            return win.document.title;
        },

        // -------------------------------- Javascript evaluation

        /**
         * Evaluate the given function into the context of the web page content
         * 
         * @param function  func    the function to evaluate
         * @param ...       args    arguments for the function
         *
         * FIXME: modifying a variable in a sandbox
         * that inherits of the context of a window,
         * does not propagate the modification into
         * this context. We have same
         * issue that https://bugzilla.mozilla.org/show_bug.cgi?id=783499
         * the only solution is to do window.myvariable = something in the
         * given function, instead of myvariable = something
         * @see a solution used for the Firefox webconsole
         * https://hg.mozilla.org/mozilla-central/rev/f5d6c95a9de9#l6.374
         */
        evaluate: function(func, ...args) {
            if (!browser)
                throw new Error("WebPage not opened");

            let f = prepareJSEval(func, args);
            if (f === false) {
                throw new Error("Wrong use of WebPage#evaluate");
            }
            return evalInSandbox(f, 'phantomjs://webpage.evaluate()');
        },

        evaluateJavaScript: function(src) {
            if (!browser)
                throw new Error("WebPage not opened");

            return evalInSandbox(src, 'phantomjs://webpage.evaluateJavaScript()');
        },

        /**
         * @param function  func  the function to evaluate
         * @param integer   timeMs  time to wait before execution
         * @param ...       args    other args are arguments for the function
         */
        evaluateAsync: function(func, timeMs, ...args) {
            if (!browser) {
                throw new Error("WebPage not opened");
            }

            let f = prepareJSEval(func, args);
            if (f === false) {
                throw new Error("Wrong use of WebPage#evaluateAsync");
            }

            if (timeMs == undefined) {
                timeMs = 0;
            }
            browser.contentWindow.setTimeout(function() {
                evalInSandbox(f, 'phantomjs://webpage.evaluateAsync()');
            }, timeMs)
        },

        includeJs: function(url, callback) {
            if (!browser)
                throw new Error("WebPage not opened");
            var win = getCurrentFrame();
            if (!win){
                throw new Error("No window available");
            }
            webpageUtils.evalInWindow (win, null, url, callback);
        },

        get libraryPath () {
            if (!libPath)
                return "";
            return libPath.path;
        },

        set libraryPath (path) {
            libPath = slUtils.getMozFile(path);
        },

        /**
         * FIXME: modifying a variable in a sandbox
         * that inherits of the context of a window,
         * does not propagate the modification into
         * this context. We have same
         * issue that https://bugzilla.mozilla.org/show_bug.cgi?id=783499
         * the only solution is to do window.myvariable = something in the
         * given function, instead of myvariable = something
         */
        injectJs: function(filename) {
            if (!browser) {
                throw new Error("WebPage not opened");
            }
            let f = slUtils.getAbsMozFile(filename, slUtils.workingDirectory);
            if (!f.exists()) {
                // filename resolved against the libraryPath property
                f = slUtils.getAbsMozFile(filename, libPath);
                if (!f.exists()) {
                    dump("Error injectJs: can't open '"+filename+"'\n");
                    return false;
                }
            }
            let source = slUtils.readSyncStringFromFile(f);
            evalInSandbox(source, filename);
            return true;
        },

        
        /**
         * Stop JavaScript within a onLongRunningScript callback.
         * Called outside of onLongRunningScript it does nothing. 
         */
        stopJavaScript : function stopJavaScript () {
            stopJavaScript.__interrupt__ = true;
        },
        
        onError : phantom.defaultErrorHandler,

        // --------------------------------- content manipulation

        get content () {
            if (!browser)
                throw new Error("WebPage not opened");

            return webpageUtils.getWindowContent(browser.contentWindow,
                                    browser.docShell, false);
        },

        set content(val) {
            this.setContent(val, null);
        },

        get offlineStoragePath() {
            return slConfiguration.offlineStoragePath;
        },

        get offlineStorageQuota() {
            return slConfiguration.offlineStorageDefaultQuota;
        },

        get plainText() {
            if (!browser)
                throw new Error("WebPage not opened");

            return webpageUtils.getWindowContent(browser.contentWindow,
                                    browser.docShell, true, privProp.settings.plainTextAllContent);
        },

        sendEvent: function(eventType, arg1, arg2, button, modifier) {

            if (!browser)
                throw new Error("WebPage not opened");

            eventType = eventType.toLowerCase();
            browser.contentWindow.focus();
            let domWindowUtils = browser.contentWindow
                                        .QueryInterface(Ci.nsIInterfaceRequestor)
                                        .getInterface(Ci.nsIDOMWindowUtils);
            if (modifier) {
                let  m = 0;
                let mod = this.event.modifier;
                if (modifier & mod.shift) m |= domWindowUtils.MODIFIER_SHIFT;
                if (modifier & mod.alt) m |= domWindowUtils.MODIFIER_ALT;
                if (modifier & mod.ctrl) m |= domWindowUtils.MODIFIER_CONTROL;
                if (modifier & mod.meta) m |= domWindowUtils.MODIFIER_META;
                modifier = m;
            }
            else
                modifier = 0;

            if (eventType == 'keydown' || eventType == 'keyup') {
                var keyCode = arg1;
                if ((typeof keyCode) != "number") {
                    if (keyCode.length == 0)
                        return;
                    keyCode = keyCode.charCodeAt(0);
                }

                let DOMKeyCode = convertQTKeyCode(keyCode);
                if (DOMKeyCode.modifier && modifier == 0)
                    modifier = DOMKeyCode.modifier;

                if (DEBUG_WEBPAGE) {
                    slDebugLog("webpage: sendEvent DOMEvent:"+eventType+" keycode:"+DOMKeyCode.keyCode+" charCode:"+DOMKeyCode.charCode+" mod:"+modifier)
                }
                domWindowUtils.sendKeyEvent(eventType, DOMKeyCode.keyCode, DOMKeyCode.charCode, modifier);
                return;
            }
            else if (eventType == 'keypress') {
                let key = arg1;
                if (typeof key == "number") {
                    let DOMKeyCode = convertQTKeyCode(key);
                    if (DEBUG_WEBPAGE) {
                        slDebugLog("webpage: sendEvent DOMEvent:keypress keycode:"+DOMKeyCode.keyCode+" charCode:"+DOMKeyCode.charCode+" mod:"+modifier)
                    }
                    domWindowUtils.sendKeyEvent("keypress", DOMKeyCode.keyCode, DOMKeyCode.charCode, modifier);
                }
                else if (key.length == 1) {
                    let charCode = key.charCodeAt(0);
                    let DOMKeyCode = convertQTKeyCode(charCode);
                    if (DEBUG_WEBPAGE) {
                        slDebugLog("webpage: sendEvent DOMEvent:keypress keycode:"+DOMKeyCode.keyCode+" charCode:"+charCode+" mod:"+modifier)
                    }
                    domWindowUtils.sendKeyEvent("keypress", DOMKeyCode.keyCode, charCode, modifier);
                }
                else {
                    if (DEBUG_WEBPAGE) {
                        slDebugLog("webpage: sendEvent keydown,keypress,keyup for the string:'"+key+"' mod:"+modifier)
                    }
                    for(let i=0; i < key.length;i++) {
                        let charCode = key.charCodeAt(i);
                        let DOMKeyCode = convertQTKeyCode(charCode);
                        domWindowUtils.sendKeyEvent("keydown", DOMKeyCode.keyCode, DOMKeyCode.charCode, modifier);
                        domWindowUtils.sendKeyEvent("keypress", DOMKeyCode.keyCode, charCode, modifier);
                        domWindowUtils.sendKeyEvent("keyup", DOMKeyCode.keyCode, DOMKeyCode.charCode, modifier);
                    }
                }
                return;
            }

            let btn = 0;
            if (button == 'middle')
                btn = 1;
            else if (button == 'right')
                btn = 2;

            let x = arg1 || 0;
            let y = arg2 || 0;

            if (DEBUG_WEBPAGE) {
                slDebugLog("webpage: sendEvent "+eventType+" x:"+x+" y:"+y+" btn:"+btn+" mod:"+modifier)
            }

            // mouse events
            if (eventType == "mousedown" ||
                eventType == "mouseup" ||
                eventType == "mousemove") {
                domWindowUtils.sendMouseEvent(eventType,
                        x, y, btn, 1, modifier);
                webpageUtils.sleepIfJavascriptURI(domWindowUtils, x, y)
                return;
            }
            else if (eventType == "mousedoubleclick") {
                // this type allowed by phantomjs has no really equivalence
                // and tests in phantomjs show that it is simply... buggy
                // note that is undocumented (2013-02-22)
                domWindowUtils.sendMouseEvent("mousedown",
                        x, y, btn, 2, modifier);
                webpageUtils.sleepIfJavascriptURI(domWindowUtils, x, y)
                return;
            }
            else if (eventType == "doubleclick") {
                domWindowUtils.sendMouseEvent("mousedown",
                        x, y, btn, 1, modifier);
                domWindowUtils.sendMouseEvent("mouseup",
                        x, y, btn, 1, modifier);
                domWindowUtils.sendMouseEvent("mousedown",
                        x, y, btn, 2, modifier);
                domWindowUtils.sendMouseEvent("mouseup",
                        x, y, btn, 2, modifier);
                webpageUtils.sleepIfJavascriptURI(domWindowUtils, x, y)
                return;
            }
            else if (eventType == "click") {
                domWindowUtils.sendMouseEventToWindow("mousedown",
                        x, y, btn, 1, modifier);
                domWindowUtils.sendMouseEventToWindow("mouseup",
                        x, y, btn, 1, modifier);
                webpageUtils.sleepIfJavascriptURI(domWindowUtils, x, y)
                return;
            }

            throw new Error("Unknown event type");
        },

        event : {
            modifier : {
                shift:  0x02000000,
                ctrl:   0x04000000,
                alt:    0x08000000,
                meta:   0x10000000,
                keypad: 0x20000000
            },
            key : phantomJSKeyCodeList.key // unicode values
        },

        get title() {
            if (!browser) {
                return '';
            }
            return browser.contentDocument.title;
        },

        setContent: function(content, url) {
            if (!browser) {
                openBlankBrowser(true);
            }
            browserJustCreated = false;
            browser.webNavigation.stop(3);
            let uri = browser.currentURI.clone();
            if (url) {
                // if url given, take it
                uri = Services.io.newURI(url, null, null);
            }
            else {
                url = uri.spec;
            }

            this.navigationRequested(url, 'Other', true, true);

            if ((typeof content) != "string") {
                // for given DOM node, serialize it
                let encoder = Cc["@mozilla.org/layout/documentEncoder;1?type=text/html"]
                                .createInstance(Ci.nsIDocumentEncoder);
                encoder.init(document, "text/html", de.OutputLFLineBreak | de.OutputRaw);
                encoder.setNode(content);
                content = encoder.encodeToString();
            }

            privProp.staticContentLoading = true;

            webpageUtils.setWindowContent (browser.docShell, content, uri);

            // wait until the content is loaded
            let thread = Services.tm.currentThread;
            while (privProp.staticContentLoading)
                thread.processNextEvent(true);
        },

        /**
         * set a file to an <input type="file">. this can be a list of files.
         * a click event is generated on the element.
         * @param string selector  a CSS selector to an <input type="file">
         * @param string|array      list of files to select
         */
        uploadFile: function(selector, filename) {

            if (!browser) {
                return;
            }
            // check the selector
            let exists = this.evaluate(function(sel){
                    var el = document.querySelector(sel)
                    return (el?true:false);
                }, selector);

            if (!exists) {
                console.log("Warning uploadFile: "+selector+" does not exist");
                return;
            }

            // set files. Only take existing files.
            let files;
            if (!Array.isArray(filename))
                files = [filename];
            else
                files = filename;

            browser.uploadFiles = [];
            files.forEach(function(file) {
                try {
                    let selectedFile = slUtils.getMozFile(file);
                    if (selectedFile.exists()) {
                        browser.uploadFiles.push(selectedFile);
                    }
                }
                catch(e) {
                }
            });

            if (!browser.uploadFiles.length) {
                return
            }
            browser.uploadFilesReaded = false;
            // send a click. It will open the file picker which will
            // take browser.uploadFiles
            this.evaluate(function(sel){
                    var el = document.querySelector(sel);
                    if (!el) {
                        return;
                    }
                    var ev = document.createEvent('MouseEvents');
                    ev.initEvent("click", true, true);
                    el.dispatchEvent(ev);
                }, selector);

            slUtils.sleep(500, function(){ return browser.uploadFilesReaded;} ); // wait after the file picker opening
        },

        // ------------------------------- Screenshot and pdf export

        /**
         * clipRect defines the rectangle to render from the webpage
         * when calling render*() methods
         */
        get clipRect () {
            if (privProp.clipRect)
                return privProp.clipRect;
            return {top:0, left:0, width:0, height:0}
        },
        set clipRect (value) {
            let requirements = {
                top: {
                    is: ["undefined", "number"],
                    ok: (val) => val === undefined || val >= 0,
                    msg: "clipRect.top should be a positive integer"
                },
                left: {
                    is: ["undefined", "number"],
                    ok: (val) => val === undefined || val >= 0,
                    msg: "clipRect.left should be a positive integer"
                },
                width: {
                    is: ["undefined", "number"],
                    ok: (val) => val === undefined || val >= 0,
                    msg: "clipRect.width should be a positive integer"
                },
                height: {
                    is: ["undefined", "number"],
                    ok: (val) => val === undefined || val >= 0,
                    msg: "clipRect.height should be a positive integer"
                },
            }
            if (typeof(value) === "object") {
                privProp.clipRect = heritage.mix({top:0, left:0, width:0, height:0},
                                                 validateOptions(value, requirements));
            } else {
                privProp.clipRect = null;
            }
        },
        /**
         * dimensions for the PDF rendering
         *  {width:'', height:'', margin:''}
         *  or
         *  {format:'', orientation:'', margin:''}
         *
         *  margin can be a single dimension or an object containing
         *  one or more of the following properties: 'top', 'left', 'bottom', 'right'
         *
         *  format: "A4" etc.
         *  orientation: "landscape" or "portrait"
         *  dimension: supported unit 
         */
        get paperSize () {
            return privProp.paperSize;
        },
        set paperSize (val) {
            privProp.paperSize = val;
        },
        get zoomFactor () {
            if (!browser)
                throw new Error("WebPage not opened");
            return browser.markupDocumentViewer.fullZoom;
        },
        set zoomFactor (val) {
            if (!browser)
                throw new Error("WebPage not opened");
            browser.markupDocumentViewer.fullZoom = val;
            let domWindowUtils = browser.contentWindow
                                        .QueryInterface(Ci.nsIInterfaceRequestor)
                                        .getInterface(Ci.nsIDOMWindowUtils);
            domWindowUtils.redraw(1);
        },

        render: function(filename, options) {
            if (!browser)
                throw new Error("WebPage not opened");

            let file = fs.absolute(filename);

            try {
                let finalOptions = webpageUtils.getScreenshotOptions(this, options, fs.extension(file, true));
                if (finalOptions.format == 'pdf') {
                    let printOptions = webpageUtils.getPrintOptions(this, browser.contentWindow, file, finalOptions);
                    if (printOptions === null) {
                        return false;
                    }
                    return webpageUtils.renderPageAsPDF(browser.contentWindow, printOptions);
                }

                let canvas = webpageUtils.getScreenshotCanvas(
                                            browser.contentWindow,
                                            finalOptions.ratio,
                                            finalOptions.onlyViewport, this);
                let content = null;
                canvas.toBlob(function(blob) {
                    let reader = new browser.contentWindow.FileReader();
                    reader.onloadend = function() {
                        content = reader.result;
                    }
                    reader.readAsBinaryString(blob);
                }, finalOptions.contentType, finalOptions.quality);

                let thread = Services.tm.currentThread;
                while (content === null) {
                    thread.processNextEvent(true);
                }

                let dir = fs.directory(file);
                if (!fs.exists(dir)) {
                    fs.makeTree(dir);
                }

                fs.write(file, content, "wb");
                return true;
            }
            catch(e) {
                if (DEBUG_WEBPAGE) {
                    dumpex(e);
                }
                return false;
            }
        },

        renderBytes: function(options) {
            if (!browser)
                throw new Error("WebPage not opened");
            try {
                let finalOptions = webpageUtils.getScreenshotOptions(this, options);
                let canvas = webpageUtils.getScreenshotCanvas(
                                            browser.contentWindow,
                                            finalOptions.ratio,
                                            finalOptions.onlyViewport, this);
                let content = null;
                canvas.toBlob(function(blob) {
                    let reader = new browser.contentWindow.FileReader();
                    reader.onloadend = function() {
                        content = reader.result;
                    }
                    reader.readAsBinaryString(blob);
                }, finalOptions.contentType, finalOptions.quality);

                let thread = Services.tm.currentThread;
                while (content === null) {
                    thread.processNextEvent(true);
                }
                return content;
            }
            catch(e) {
                if (DEBUG_WEBPAGE) {
                    dumpex(e);
                }
                return null;
            }
        },

        renderBase64: function(options) {
            if (!browser)
                throw new Error("WebPage not opened");
            let finalOptions = webpageUtils.getScreenshotOptions(this, options)

            let canvas = webpageUtils.getScreenshotCanvas(browser.contentWindow,
                                            finalOptions.ratio, finalOptions.onlyViewport, this);

            return canvas.toDataURL(finalOptions.contentType, finalOptions.quality).split(",", 2)[1];
        },

        //--------------------------------------------------- window popup callback

        onAlert : null,

        onAuthPrompt: null,

        onCallback : null,

        onConfirm : null,

        onConsoleMessage : null,

        onFilePicker : null,

        onPrompt : null,
        
        onLongRunningScript : null,

        // ------------------------------ browsing callbacks

        // This callback is invoked after the web page is created but before a URL is loaded. The callback may be used to change global objects (document...)
        onInitialized: null,

        //This callback is invoked when the page finishes the loading. It may accept a single argument indicating the page's status: 'success' if no network errors occurred, otherwise 'fail'.
        onLoadFinished: null,

        //This callback is invoked when the page starts the loading. There is no argument passed to the callback.
        onLoadStarted: null,

        onNavigationRequested: null,

        // This callback is invoked when a new child window (but not deeper descendant windows) is created by the page, e.g. using window.open
        onPageCreated: null,

        onResourceError : null,

        onResourceTimeout : null,

        onResourceRequested : null,

        onResourceReceived : null,

        //This callback is invoked when the URL changes, e.g. as it navigates away from the current URL.
        onUrlChanged : null,

        // Callback invoked when a file is downloaded .
        onFileDownload : null,

        onFileDownloadError: null,

        // -------------------------------- private methods to send some events
        closing:function (page) {
            executePageListener(this, 'onClosing', [page]);
        },

        initialized: function() {
            webPageSandbox = null;
            if (browser) {
                let ds = browser.docShell;
                ds.allowImages = privProp.settings.loadImages;
                ds.allowJavascript = privProp.settings.javascriptEnabled;
            }
            if (DEBUG_WEBPAGE_LOADING) {
                slDebugLog("webpage: onInitialized");
            }
            executePageListener(this, 'onInitialized');
        },

        javaScriptAlertSent: function(message) {
            executePageListener(this, 'onAlert', [message]);
        },

        javaScriptConsoleMessageSent: function(message, lineNumber, fileName) {
            executePageListener(this, 'onConsoleMessage', [message, lineNumber, fileName]);
        },

        loadFinished: function(status, url, isFrame) {
            browserJustCreated = false;
            webPageSandbox = null;
            if (DEBUG_WEBPAGE_LOADING) {
                slDebugLog("webpage: onLoadFinished status:"+status+" url:"+url+" isFrame:"+isFrame);
            }
            executePageListener(this, 'onLoadFinished', [status, url, isFrame]);
        },

        loadStarted: function(url, isFrame) {
            webPageSandbox = null;
            if (DEBUG_WEBPAGE_LOADING) {
                slDebugLog("webpage: onLoadStarted url:"+url+" isFrame:"+isFrame);
            }
            executePageListener(this, 'onLoadStarted', [url, isFrame]);
        },

        /**
         * @param string url  the url of the requested page
         * @param string navigationType a string indicated the origin:
         *          "Undefined" "LinkClicked" "FormSubmitted" "BackOrForward" "Reload" "FormResubmitted" "Other"
         * @param boolean willNavigate  true if the navigation is not locked
         * @param boolean isMainFrame true if it comes from the mainFrame
         */

        navigationRequested: function(url, navigationType, willNavigate, isMainFrame) {
            if (DEBUG_WEBPAGE_LOADING) {
                slDebugLog("webpage: onNavigationRequested url:"+url+" navigationType:"+navigationType+" willNavigate:"+willNavigate+" isMainFrame:"+isMainFrame);
            }
            executePageListener(this, 'onNavigationRequested', [url, navigationType, willNavigate, isMainFrame]);
        },

        rawPageCreated: function(page) {
            executePageListener(this, 'onPageCreated', [page]);
        },

        resourceError: function(error) {
            if (DEBUG_WEBPAGE_LOADING) {
                slDebugLog("webpage: onResourceError error:"+slDebugGetObject(error));
            }
            executePageListener(this, 'onResourceError', [error]);
        },

        resourceTimeout: function(error) {
            if (DEBUG_WEBPAGE_LOADING) {
                slDebugLog("webpage: onResourceTimeout error:"+slDebugGetObject(error));
            }
            executePageListener(this, 'onResourceTimeout', [error]);
        },

        resourceReceived: function(resource) {
            if (DEBUG_WEBPAGE_LOADING) {
                slDebugLog("webpage: onResourceReceived resource:"+slDebugGetObject(resource, ['body']));
            }

            executePageListener(this, 'onResourceReceived', [resource])
        },

        resourceRequested: function(resource, request) {
            if (DEBUG_WEBPAGE_LOADING) {
                slDebugLog("webpage: onResourceRequested resource:"+slDebugGetObject(resource));
            }
            executePageListener(this, 'onResourceRequested', [resource, request]);
        },

        urlChanged: function(url) {
            if (DEBUG_WEBPAGE_LOADING) {
                slDebugLog("webpage: onUrlChanged url:"+url);
            }
            webPageSandbox = null;
            executePageListener(this, 'onUrlChanged', [url]);
        },

        fileDownload : function(url, responseData) {
            if (DEBUG_WEBPAGE_LOADING) {
                slDebugLog("webpage: onFileDownload "+url);
            }
            return executePageListener(this, 'onFileDownload', [url, responseData]);
        },

        fileDownloadError : function(message) {
            if (DEBUG_WEBPAGE_LOADING) {
                slDebugLog("webpage: onFileDownloadError: "+message);
            }
            executePageListener(this, 'onFileDownloadError', [message]);
        }
    };

    function executePageListener(page, listener, args) {
        if (page[listener]) {
            try {
                return page[listener].apply(page, args);
            } catch(e) {
                console.log("Error "+listener+": ["+e.name+"] "+e.message+" ("+e.fileName+" ; line:"+e.lineNumber+" col:"+e.columnNumber+")");
            }
        }
    }

    // initialization
    return openBlankBrowser(false);
} // end of _create

