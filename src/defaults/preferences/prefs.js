
pref("toolkit.defaultChromeURI", "chrome://slimerjs/content/slimerjs.xul");
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.strict", true);
pref("browser.cache.disk.enable", false);
pref("app.update.enable", false);
pref("extensions.update.enable", false);
pref("dom.report_all_js_exceptions", true);

pref("browser.fixup.alternate.enabled", false);

// remove it for releases
pref("nglayout.debug.disable_xul_cache", true);
pref("nglayout.debug.disable_xul_fastload", true);


// for xulrunner, to display error pages instead of alert box
pref("browser.xul.error_pages.enabled", true);