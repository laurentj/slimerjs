
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

function slCommandLine() {

}

slCommandLine.prototype = {

    classID: Components.ID("{00995ba2-223f-4efb-b656-ce98aff7019b}"),
    classDescription: "Command line handler for SlimerJS",
    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsICommandLineHandler]),

    // ------- nsICommandLineHandler interface

    handle : function (cmdLine) {

        if (!cmdLine.handleFlag("slimerjs", false)) {
            return;
        }

        cmdLine.preventDefault = true;

        if (cmdLine.length > 1) {
            Components.utils.reportError("two many arguments");
            return;
        }

        if (cmdLine.length > 0) {
            // script parameter
            let scriptFileName = '';
            let scriptFile = null;
            try {
                scriptFileName = cmdLine.getArgument(0);
                if(scriptFileName) {
                    scriptFile = cmdLine.resolveFile(scriptFileName);
                }
            }
            catch (e) {
                Components.utils.reportError("incorrect script filename ("+e+")");
                return;
            }
        }

        Services.ww.openWindow(null, "chrome://slimerjs/content/slimerjs.xul", "_blank",
                "chrome,menubar,toolbar,status,resizable,dialog=no",
                null);
    },

    helpInfo : "  --slimerjs       launch SlimerJS instead of Firefox\n"

}

var NSGetFactory = XPCOMUtils.generateNSGetFactory([slCommandLine]);



