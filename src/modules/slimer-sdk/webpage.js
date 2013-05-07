/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { Cc, Ci, Cu, Cr } = require('chrome');
Cu.import('resource://slimerjs/slLauncher.jsm');
Cu.import('resource://slimerjs/slUtils.jsm');
Cu.import('resource://slimerjs/slConfiguration.jsm');
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import('resource://slimerjs/slPhantomJSKeyCode.jsm');
Cu.import('resource://slimerjs/slQTKeyCodeToDOMCode.jsm');

const fm = Cc['@mozilla.org/focus-manager;1'].getService(Ci.nsIFocusManager);

const {validateOptions} = require("sdk/deprecated/api-utils");
const {
    getScreenshotCanvas, setAuthHeaders, removeAuthPrompt,
    getCookies, setCookies, Cookie
} = require("./utils");

const fs = require("sdk/io/file");
const base64 = require("sdk/base64");
const Q = require("sdk/core/promise");
const timer = require("sdk/timers");
const heritage = require("sdk/core/heritage");

const netLog = require('net-log');
netLog.startTracer();

/**
 * create a webpage object
 * @module webpage
 */
function create() {

    // -----------------------  private properties and functions for the webpage object

    /**
     * the <browser> element loading the webpage content
     */
    var browser = null;

    /**
     * library path
     */
    var libPath = slConfiguration.scriptFile.parent.clone();

    /**
     * utility function to create a sandbox when executing a
     * user script in the webpage content
     */
    function createSandBox(win) {
        let sandbox = Cu.Sandbox(win,
            {
                'sandboxName': browser.currentURI.spec,
                'sandboxPrototype': win,
                'wantXrays': false
            });
        return sandbox;
    }

    var webPageSandbox = null;

    function evalInSandbox (src) {
        if (!webPageSandbox)
            webPageSandbox = new WeakMap();
        let win = getCurrentFrame();
        if (!webPageSandbox.has(win))
            webPageSandbox.set(win, createSandBox(win));
        try {
            return Cu.evalInSandbox(src, webPageSandbox.get(win));
        }
        catch(e) {
            throw new Error('Error during javascript evaluation in the web page: '+e)
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
                // aSubject == console event object. see http://mxr.mozilla.org/mozilla-central/source/dom/base/ConsoleAPI.js#254
                let domWindowUtils = browser.contentWindow
                            .QueryInterface(Ci.nsIInterfaceRequestor)
                            .getInterface(Ci.nsIDOMWindowUtils);
                var consoleEvent = aSubject.wrappedJSObject;
                if (domWindowUtils.outerWindowID == aData) {
                    webpage.onConsoleMessage(consoleEvent.arguments[0], consoleEvent.lineNumber, consoleEvent.filename);
                    return
                }
                // probably the window is an iframe of the webpage. check if this is
                // the case
                let iframe = domWindowUtils.getOuterWindowWithId(aData);
                if (iframe) {
                    let dwu = iframe.top.QueryInterface(Ci.nsIInterfaceRequestor)
                            .getInterface(Ci.nsIDOMWindowUtils);
                    if (dwu.outerWindowID == domWindowUtils.outerWindowID) {
                        webpage.onConsoleMessage(consoleEvent.arguments[0], consoleEvent.lineNumber, consoleEvent.filename);
                        return;
                    }
                }
                return;
            }
        }
    }

    /**
     * build an object of options for the netlogger
     */
    function getNetLoggerOptions(webpage, deferred) {
        return {
            onRequest: function(request) {webpage.resourceRequested(request);},
            onResponse:  function(res) {webpage.resourceReceived(res);},
            captureTypes: webpage.captureContent,
            onLoadStarted: function(url){ webpage.loadStarted(); },
            onURLChanged: function(url){ webpage.urlChanged(url);},
            onTransferStarted :null,
            onContentLoaded: function(url, success){
                // phantomjs call onInitialized not only at the page creation
                // but also after the content loading.. don't know why.
                // let's imitate it. Only after a success
                if (success)
                    webpage.initialized();
                else {
                    // in case of a network fail, phantomjs send
                    // a resourceReceived event.
                    webpage.resourceReceived({
                        id: 0,
                        url: url,
                        time: new Date(),
                        headers: {},
                        bodySize: 0,
                        contentType: null,
                        contentCharset: null,
                        redirectURL: null,
                        stage: "end",
                        status: null,
                        statusText: null,
                        referrer: "",
                        body: ""
                    });
                }
            },
            onLoadFinished: function(url, success){
                webpage.loadFinished(success);
                if (deferred)
                    deferred.resolve(success);
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
            var childPage = create();
            // open the window
            var win = childPage._openBlankBrowser(aOpener);

            privProp.childWindows.push(childPage);

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
        childWindows : [],
        settings: heritage.mix({}, slConfiguration.getDefaultWebpageConfig())
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

    function isChromeWindow(win) {
        try  {
            win.QueryInterface(Ci.nsIDOMChromeWindow)
            return true;
        }catch(e) {
            return false;
        }
    }

    /**
     * a function to return the focusedWindow.
     * The focus given to a window can take time asynchronously
     * so we're waiting that the focus is done.
     */
    function getFocusedWindow() {
        let win = fm.focusedWindow;
        let stop = false;
        timer.setTimeout(function(){ stop = true},300);
        let thread = Services.tm.currentThread;
        while (!stop && (!win || isChromeWindow(win))) {
            thread.processNextEvent(true);
            win = fm.focusedWindow;
        }
        if (stop)
            return null;
        return win;
    }

    // ----------------------------------- webpage

    /**
     * the webpage object itself
     * @module webpage
     */
    var webpage = {

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
            - resourceTimeout: integer
            - javascriptCanOpenWindows
            - javascriptCanCloseWindows
            Note: The settings apply only during the initial call to the WebPage#open function. Subsequent modification of the settings object will not have any impact.

            @notimplemented
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
        get cookies() {
            throw "Not Implemented"
        },

        set cookies(val) {
            throw "Not Implemented"
        },

        get customHeaders() {
            throw "Not Implemented"
        },

        set customHeaders(val) {
            throw "Not Implemented"
        },

        addCookie: function(cookie) {
            throw "Not Implemented"
        },

        clearCookies: function() {
            throw "Not Implemented"
        },

        deleteCookie: function(cookieName) {
            throw "Not Implemented"
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

        get navigationLocked() {
            throw "Not Implemented"
        },

        set navigationLocked(val) {
            throw "Not Implemented"
        },

        reload : function() {
            browser.reload();
        },

        stop : function() {
            browser.stop();
        },

        // -------------------------------- Window manipulation

        /**
         * Open a web page in a browser
         * @param string url    the url of the page to open
         * @param function callback  a function called when the page is loaded. it
         *                           receives "success" or "fail" as parameter.
         */
        open: function(url, callback) {
            var me = this;
            let deferred = Q.defer();

            deferred.promise.then(function(result) {
                if (callback) {
                    callback(result);
                    callback = null;
                }
                return result;
            });

            var options = getNetLoggerOptions(this, deferred);

            if (browser) {
                // don't recreate a browser if already opened.
                netLog.registerBrowser(browser, options);
                browser.loadURI(url);
                return deferred.promise;
            }

            var win = slLauncher.openBrowser(function(nav){
                browser = nav;
                browser.webpage = me;
                Services.obs.addObserver(webpageObserver, "console-api-log-event", true);
                browser.stop();
                me.initialized();
                netLog.registerBrowser(browser, options);
                browser.loadURI(url);
            });
            // to catch window.open()
            win.QueryInterface(Ci.nsIDOMChromeWindow)
               .browserDOMWindow= slBrowserDOMWindow;
            return deferred.promise;
        },

        /**
         * @private
         */
        _openBlankBrowser: function(parentWindow) {
            var me = this;

            if (browser) {
                throw Cr.NS_ERROR_UNEXPECTED;
            }
            var options = getNetLoggerOptions(this, null);
            var ready = false;
            var win = slLauncher.openBrowser(function(nav){
                browser = nav;
                browser.webpage = me;
                Services.obs.addObserver(webpageObserver, "console-api-log-event", true);
                netLog.registerBrowser(browser, options);
                me.initialized();
                ready = true;
            }, parentWindow);

            win.QueryInterface(Ci.nsIDOMChromeWindow)
               .browserDOMWindow = slBrowserDOMWindow;

            // we're waiting synchronously after the initialisation of the new window, because we need
            // to have a ready browser element and then to have an existing win.content.
            // slBrowserDOMWindow.openURI needs to return this win.content so the
            // caller will load the URI into this window object.
            let thread = Services.tm.currentThread;
            while (!ready)
                thread.processNextEvent(true);
            return win;
        },

        openUrl: function(url, httpConf, settings) {
            throw "Not Implemented"
        },

        /**
         * close the browser
         */
        close: function() {
            if (browser) {
                Services.obs.removeObserver(webpageObserver, "console-api-log-event");
                netLog.unregisterBrowser(browser);
                this.closing(this);
                browser.webpage = null;
                slLauncher.closeBrowser(browser);
            }
            webPageSandbox = null;
            browser=null;
        },

        /**
         * function called when the browser is being closed, during a call of WebPage.close()
         * or during a call of window.close() inside the web page (not implemented yet)
         */
        onClosing: null,

        get ownsPages () {
            throw "Not Implemented"
        },

        getPage: function (windowName) {
            throw "Not Implemented"
        },

        get pages () {
            throw "Not Implemented"
        },

        get pagesWindowName () {
            throw "Not Implemented"
        },

        release : function() {
            throw "Not Implemented"
        },

        get scrollPosition() {
            throw "Not Implemented"
        },

        set scrollPosition(val) {
            throw "Not Implemented"
        },
        get url() {
            if (browser)
                return browser.currentURI.spec;
            return "";
        },

        get viewportSize() {
            if (!browser)
                return {width:0, height:0};
            let win = browser.ownerDocument.defaultView.top;
            return {
                width: win.innerWidth,
                height: win.innerHeight
            }
        },

        set viewportSize(val) {
            if (!browser)
                return;
            let win = browser.ownerDocument.defaultView.top;

            if (typeof val != "object")
                throw new Error("Bad argument type");

            let w = val.width || 0;
            let h = val.height || 0;

            if (w <= 0 || h <= 0)
                return;

            let domWindowUtils = win.QueryInterface(Ci.nsIInterfaceRequestor)
                                    .getInterface(Ci.nsIDOMWindowUtils);
            domWindowUtils. setCSSViewport(w,h);
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
            var win = getFocusedWindow();
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
            var win = getFocusedWindow();
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
            const de = Ci.nsIDocumentEncoder
            let encoder = Cc["@mozilla.org/layout/documentEncoder;1?type=text/plain"]
                            .createInstance(Ci.nsIDocumentEncoder);
            let doc = win.document;
            encoder.init(doc, "text/html", de.OutputLFLineBreak | de.OutputRaw);
            encoder.setNode(doc);
            return encoder.encodeToString();
        },

        set frameContent(val) {
            throw "Not Implemented"
        },

        get framePlainText() {
            var win = getCurrentFrame();
            if (!win){
                return false;
            }
            const de = Ci.nsIDocumentEncoder
            let encoder = Cc["@mozilla.org/layout/documentEncoder;1?type=text/plain"]
                            .createInstance(Ci.nsIDocumentEncoder);
            let doc = win.document;
            encoder.init(doc, "text/plain", de.OutputLFLineBreak | de.OutputBodyOnly | de.OutputRaw);
            encoder.setNode(doc);
            return encoder.encodeToString();
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
        evaluate: function(func) {
            if (!browser)
                throw "WebPage not opened";

            let args = JSON.stringify(Array.prototype.slice.call(arguments).slice(1));
            func = '('+func.toString()+').apply(this, ' + args + ');';
            return evalInSandbox(func);
        },

        evaluateJavaScript: function(src) {
            if (!browser)
                throw "WebPage not opened";

            return evalInSandbox(src);
        },

        evaluateAsync: function(func) {
            if (!browser)
                throw "WebPage not opened";
            func = '('+func.toSource()+')();';
            browser.contentWindow.setTimeout(function() {
                evalInSandbox(func);
            }, 0)
        },

        includeJs: function(url, callback) {
            if (!browser)
                throw "WebPage not opened";
            // we don't use the sandbox, because with it, scripts
            // of the loaded page cannot access to variables/functions
            // created by the injected script. And this behavior
            // is necessary to be compatible with phantomjs.
            var win = getCurrentFrame();
            if (!win){
                throw "No window available";
            }
            let doc = win.document;
            let body = doc.documentElement.getElementsByTagName("body")[0];
            let script = doc.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', url);
            let listener = function(event){
                script.removeEventListener('load', listener, true);
                callback();
            }
            script.addEventListener('load', listener, true);
            body.appendChild(script);
        },

        get libraryPath () {
            return libPath.path;
        },

        set libraryPath (path) {
            libPath = Cc['@mozilla.org/file/local;1']
                            .createInstance(Ci.nsILocalFile);
            libPath.initWithPath(path);
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
                throw "WebPage not opened";
            }
            // filename resolved against the libraryPath property
            let f = getMozFile(filename, libPath);
            let source = readSyncStringFromFile(f);
            evalInSandbox(source);
        },
        get onError() {
            throw "Not Implemented"
        },
        set onError(callback) {
            throw "Not Implemented"
        },

        // --------------------------------- content manipulation

        get content () {
            if (!browser)
                throw "WebPage not opened";

            const de = Ci.nsIDocumentEncoder
            let encoder = Cc["@mozilla.org/layout/documentEncoder;1?type=text/html"]
                            .createInstance(Ci.nsIDocumentEncoder);
            let doc = browser.contentDocument;
            encoder.init(doc, "text/html", de.OutputLFLineBreak | de.OutputRaw);
            encoder.setNode(doc);
            return encoder.encodeToString();
        },

        set content(val) {
            throw "Not Implemented"
        },

        get offlineStoragePath() {
            throw "Not Implemented"
        },

        set offlineStoragePath(val) {
            throw "Not Implemented"
        },

        get offlineStorageQuota() {
            throw "Not Implemented"
        },

        set offlineStorageQuota(val) {
            throw "Not Implemented"
        },

        get plainText() {
            if (!browser)
                throw "WebPage not opened";

            const de = Ci.nsIDocumentEncoder
            let encoder = Cc["@mozilla.org/layout/documentEncoder;1?type=text/plain"]
                            .createInstance(Ci.nsIDocumentEncoder);
            let doc = browser.contentDocument;
            encoder.init(doc, "text/plain", de.OutputLFLineBreak | de.OutputBodyOnly);
            encoder.setNode(doc);
            return encoder.encodeToString();
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
                let mod = this.event.modifiers;
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

                domWindowUtils.sendKeyEvent(eventType, DOMKeyCode.keyCode, DOMKeyCode.charCode, modifier);
                return;
            }
            else if (eventType == 'keypress') {
                let key = arg1;
                if (typeof key == "number") {
                    let DOMKeyCode = convertQTKeyCode(key);
                    domWindowUtils.sendKeyEvent("keypress", DOMKeyCode.keyCode, DOMKeyCode.charCode, modifier);
                }
                else if (key.length == 1) {
                    let charCode = key.charCodeAt(0);
                    let DOMKeyCode = convertQTKeyCode(charCode);
                    domWindowUtils.sendKeyEvent("keypress", DOMKeyCode.keyCode, charCode, modifier);
                }
                else {
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

            // mouse events
            if (eventType == "mousedown" ||
                eventType == "mouseup" ||
                eventType == "mousemove") {

                domWindowUtils.sendMouseEvent(eventType,
                        x, y, btn, 1, modifier);
                return;
            }
            else if (eventType == "mousedoubleclick") {
                // this type allowed by phantomjs has no really equivalence
                // and tests in phantomjs show that it is simply... buggy
                // note that is undocumented (2013-02-22)
                domWindowUtils.sendMouseEvent("mousedown",
                        x, y, btn, 2, modifier);
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
                return;
            }
            else if (eventType == "click") {
                domWindowUtils.sendMouseEventToWindow("mousedown",
                        x, y, btn, 1, modifier);
                domWindowUtils.sendMouseEventToWindow("mouseup",
                        x, y, btn, 1, modifier);
                return;
            }

            throw "Unknown event type";
        },

        event : {
            modifiers : {
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
            throw "Not Implemented"
        },

        uploadFile: function(selector, filename) {
            throw "Not Implemented"
        },

        // ------------------------------- Screenshot and pdf export

        /**
         * clipRect defines the rectangle to render from the webpage
         * when calling render*() methods
         */
        get clipRect () {
            return privProp.clipRect;
        },
        set clipRect (value) {
            let requirements = {
                top: {
                    is: ["number"],
                    ok: function(val) val >= 0,
                    msg: "top should be a positive integer"
                },
                left: {
                    is: ["number"],
                    ok: function(val) val >= 0,
                    msg: "left should be a positive integer"
                },
                width: {
                    is: ["number"],
                    ok: function(val) val > 0,
                    msg: "width should be a positive integer"
                },
                height: {
                    is: ["number"],
                    ok: function(val) val > 0,
                    msg: "height should be a positive integer"
                },
            }
            if (typeof(value) === "object") {
                privProp.clipRect = validateOptions(value, requirements);
            } else {
                privProp.clipRect = null;
            }
        },
        paperSize : null,
        get zoomFactor () {
            if (!browser)
                throw "WebPage not opened";
            return browser.markupDocumentViewer.fullZoom;
        },
        set zoomFactor (val) {
            if (!browser)
                throw "WebPage not opened";
            browser.markupDocumentViewer.fullZoom = val;
        },
        render: function(filename, ratio) {
            if (!browser)
                throw "WebPage not opened";
            let format = fs.extension(filename).toLowerCase() || 'png';
            let content = this.renderBytes(format, ratio);
            fs.write(filename, content, "wb");
        },

        renderBytes: function(format, ratio) {
            return base64.decode(this.renderBase64(format, ratio));
        },

        renderBase64: function(format, ratio) {
            if (!browser)
                throw "WebPage not opened";

            format = (format || "png").toString().toLowerCase();
            let qual = undefined;
            if (format == "png") {
                format = "image/png";
            } else if (format == "jpeg") {
                format = "image/jpeg";
                qual = 0.8;
            } else {
                throw new Error("Render format \"" + format + "\" is not supported");
            }

            let canvas = getScreenshotCanvas(browser.contentWindow,
                                             privProp.clipRect, ratio);

            return canvas.toDataURL(format, qual).split(",", 2)[1];
        },

        //--------------------------------------------------- window popup callback

        onAlert : null,

        get onCallback() {
            throw "Not Implemented"
        },

        set onCallback(callback) {
            throw "Not Implemented"
        },

        onConfirm : null,

        onConsoleMessage : null,

        get onFilePicker() {
            throw "Not Implemented"
        },

        set onFilePicker(callback) {
            throw "Not Implemented"
        },

        onPrompt : null,

        // ------------------------------ browsing callbacks

        // This callback is invoked after the web page is created but before a URL is loaded. The callback may be used to change global objects (document...)
        onInitialized: null,

        //This callback is invoked when the page finishes the loading. It may accept a single argument indicating the page's status: 'success' if no network errors occurred, otherwise 'fail'.
        onLoadFinished: null,

        //This callback is invoked when the page starts the loading. There is no argument passed to the callback.
        onLoadStarted: null,

        get onNavigationRequested() {
            throw "Not Implemented"
        },

        set onNavigationRequested(callback) {
            throw "Not Implemented"
        },

        // This callback is invoked when a new child window (but not deeper descendant windows) is created by the page, e.g. using window.open
        onPageCreated: null,

        onResourceRequested : null,

        onResourceReceived : null,

        //This callback is invoked when the URL changes, e.g. as it navigates away from the current URL.
        onUrlChanged : null,

        // -------------------------------- private methods to send some events
        closing:function (page) {
            if (this.onClosing)
                this.onClosing(page);
        },

        initialized: function() {
            webPageSandbox = null;
            if (this.onInitialized)
                this.onInitialized();
        },

        javaScriptAlertSent: function(message) {
            if (this.onAlert)
                this.onAlert(message);
        },

        javaScriptConsoleMessageSent: function(message, lineNumber, fileName) {
            if (this.onConsoleMessage)
                onConsoleMessage(message, lineNumber, fileName);
        },

        loadFinished: function(status) {
            webPageSandbox = null;
            if (this.onLoadFinished)
                this.onLoadFinished(status);
        },

        loadStarted: function() {
            webPageSandbox = null;
            if (this.onLoadStarted)
                this.onLoadStarted();
        },

        navigationRequested: function(url, navigationType, navigationLocked, isMainFrame) {
            throw "Not Implemented"
        },

        rawPageCreated: function(page) {
            if (this.onPageCreated)
                this.onPageCreated(page);
        },

        resourceReceived: function(request) {
            if (this.onResourceReceived)
                this.onResourceReceived(request);
        },

        resourceRequested: function(resource) {
            if (this.onResourceRequested)
                this.onResourceRequested(resource);
        },

        urlChanged: function(url) {
            webPageSandbox = null;
            if (this.onUrlChanged)
                this.onUrlChanged(url);
        }
    };

    return webpage;
}
exports.create = create;

/*
function WebPage() {
    this.prototype = create();
}
*/