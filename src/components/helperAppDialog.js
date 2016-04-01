"use strict";

/*
 * overrides nsHelperAppDlg.js
 *
 * the goal is to avoid dialog when a file is downloaded
 */

const Ci = Components.interfaces;
const Cc = Components.classes;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import('resource://slimerjs/slUtils.jsm');

/*
XPCOMUtils.defineLazyModuleGetter(this, "Downloads",
  "resource://gre/modules/Downloads.jsm");
*/
XPCOMUtils.defineLazyModuleGetter(this, "Services",
  "resource://gre/modules/Services.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "FileUtils",
  "resource://gre/modules/FileUtils.jsm");

//XPCOMUtils.defineLazyModuleGetter(this, "Task",
// "resource://gre/modules/Task.jsm");

//let downloadModule = {};
//Cu.import("resource://gre/modules/DownloadLastDir.jsm", downloadModule);


function unknownContentTypeDialog() {
}

unknownContentTypeDialog.prototype = {
    show: function(aLauncher, aWindowContext, aReason)  {
        try {
            aLauncher.saveToDisk(null, false);
        } catch(e) {
            Cu.reportError("nsUnknownContentTypeDialog.show "+e)
        }
    },

    promptForSaveToFileAsync: function(aLauncher, aWindowContext, aDefaultFileName,
                                       aSuggestedFileExtension, aForcePrompt) {
        let webpage = slUtils.getWebpageFromContentWindow(aWindowContext);

        let suggestedFile = aDefaultFileName? aDefaultFileName: aLauncher.suggestedFileName;
        if (suggestedFile == '') {
            if (aLauncher.source.path != '/') {
                suggestedFile = aLauncher.source.path.replace("/", "_") + "." + aSuggestedFileExtension;
            }
            else {
                suggestedFile = aLauncher.source.host + "." + aSuggestedFileExtension;
            }
        }

        let responseData = {
            filename: suggestedFile,
            size : aLauncher.contentLength,
            contentType: aLauncher.MIMEInfo.type
        };

        let filename = webpage.fileDownload(aLauncher.source.spec, responseData);
        if (!filename) {
            aLauncher.saveDestinationAvailable(null);
            return;
        }
        let file = slUtils.getAbsMozFile(filename, slUtils.workingDirectory);

        if (file.exists() && file.isDirectory()) {
            if (!file.isWritable()) {
                webpage.fileDownloadError("Requested path is not writable");
                aLauncher.saveDestinationAvailable(null);
                return;
            }
            file.append(aDefaultFileName);
        }
        else if (file.parent.exists() && !file.parent.isWritable()) {
            webpage.fileDownloadError("Requested path is not writable");
            aLauncher.saveDestinationAvailable(null);
            return;
        }
        aLauncher.saveDestinationAvailable(file);
    },
    classDescription: 'Unknown Content Type Dialog placeholder',
    classID: Components.ID("{04c5992d-c6a5-4138-9b75-b03ead2be0f1}"),
    contractID: '@mozilla.org/helperapplauncherdialog;1',
    QueryInterface : XPCOMUtils.generateQI([Ci.nsIHelperAppLauncherDialog, Ci.nsITimerCallback])
};

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([unknownContentTypeDialog]);
