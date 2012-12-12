
/*
data = { id: "string",
        version: "",
        installPath: nsiFile,
        resourceURI: nsIURI
        }
*/


/*
 * Reason types:
 *   APP_STARTUP
 *   ADDON_ENABLE
 *   ADDON_INSTALL
 *   ADDON_UPGRADE
 *   ADDON_DOWNGRADE
 */ 
function startup(data, reason) {

}
/*
 * Reason types:
 *   APP_SHUTDOWN
 *   ADDON_DISABLE
 *   ADDON_UNINSTALL
 *   ADDON_UPGRADE
 *   ADDON_DOWNGRADE
 */ 
function shutdown(data, reason) {
}
/*
 * Reason types:
 *   ADDON_INSTALL
 *   ADDON_UPGRADE
 *   ADDON_DOWNGRADE
 */ 
function install(data, reason) {
}
/*
 * Reason types:

 *   ADDON_UNINSTALL
 *   ADDON_UPGRADE
 *   ADDON_DOWNGRADE
 */ 
function uninstall(data, reason) {
}