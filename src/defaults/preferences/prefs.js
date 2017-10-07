
pref("toolkit.defaultChromeURI", "chrome://slimerjs/content/slimerjs.xul");
pref("browser.dom.window.dump.enabled", true);
pref("javascript.options.strict", true);
pref("dom.report_all_js_exceptions", true);

pref("browser.cache.disk.enable", false);
pref("app.update.enabled", false);
pref("app.update.auto", false);
pref("toolkit.telemetry.unified", false);
pref("toolkit.telemetry.enabled", false);
pref("toolkit.telemetry.prompted", false);
pref("toolkit.telemetry.archive.enabled", false);
pref("toolkit.telemetry.newProfilePing.enabled", false);
pref("toolkit.telemetry.shutdownPingSender.enabled", false);
pref("toolkit.telemetry.updatePing.enabled", false);


pref("extensions.blocklist.enabled", false);
pref("extensions.screenshots.disabled", true);
pref("extensions.update.enabled", false);
pref("privacy.trackingprotection.enabled", false);
pref("lightweightThemes.update.enabled", false);
pref("browser.selfsupport.url", false);
pref("browser.fixup.alternate.enabled", false);

// enable long running script callback on pages
pref("dom.max_script_run_time", 10);

// disable warnings about long chrome script run time
pref("dom.max_chrome_script_run_time", 0);

// for xulrunner, to display error pages instead of alert box
pref("browser.xul.error_pages.enabled", true);

// disable popup blocker
pref("dom.disable_open_during_load", false);
pref("dom.popup_maximum", -1);

// says how to open new window when window.open is called
pref("browser.link.open_newwindow", 3);
pref("browser.link.open_newwindow.restriction", 0);
pref("browser.link.open_external", 1);

pref("dom.allow_scripts_to_close_windows", true);

// deprecated since Gecko 50
pref("dom.mozTCPSocket.enabled", true);

//Enable plugin crash protection
//http://kb.mozillazine.org/Plugin-container_and_out-of-process_plugins
pref('dom.ipc.plugins.enabled', true);

pref('security.tls.version.min', 1); // no SSLv3 support

pref('extensions.defaultProviders.enabled', false);

// Disable Telemetry.
pref("datareporting.healthreport.service.enabled", false);
pref("datareporting.healthreport.uploadEnabled", false);
pref("datareporting.policy.dataSubmissionEnabled", false);
pref("toolkit.telemetry.unified", false);

// places.sqlite will grow by 500KB, previously 10MB by default.
// This will reduce the profile directory size from 12MB to <3MB.
pref('places.database.growthIncrementKiB', 500);
