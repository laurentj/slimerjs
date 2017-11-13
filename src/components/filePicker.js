 
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://slimerjs/slUtils.jsm");

if (geckoMajorVersion >= 54) {
    Cu.importGlobalProperties(['File']);
}


/**
 * implements a file picker that replaces the default filepicker
 * of mozilla. This file picker does not show a dialog
 * and gives file setted by webpage.onFilePicker or webpage.uploadFile
 */
function filePicker() {
    this.fileName = null;
    /**
     * @type {nsIFile[]}
     * @private
     */
    this._nsfiles = [];
    this._nsDOMFiles = [];
    this.browser = null;
    this.supportsMultiple = false;
    this.domWindowUtils = null;
    this.parentWindow = null;
}

filePicker.prototype = {
    classID          : Components.ID("{4d447d76-5205-4685-9237-9a35c7349adf}"),
    classDescription: "file picker for SlimerJS",
    QueryInterface   : XPCOMUtils.generateQI([Ci.nsIFilePicker]),

    _filterFiles : function(list) {
        let finalList = []
        list.forEach(function(file){
            try {
                let selectedFile = Cc['@mozilla.org/file/local;1']
                                .createInstance(Ci.nsIFile);
                selectedFile.initWithPath(file);
                if (selectedFile.exists()) {
                    finalList.push(selectedFile);
                }
            }
            catch(e) {
            }
        });
        return finalList;
    },

    // ------------------------------------- nsIFilePicker interface

    /**
     * Initialize the file picker widget.  The file picker is not valid until this
     * method is called.
     *
     * @param   nsIDOMWindow   parent   nsIDOMWindow parent.  This dialog will be dependent
     *                                   on this parent. parent must be non-null.
     * @param   string   title    The title for the file widget
     * @param   int   mode     load, save, or get folder (nsIFilePicker.mod*)
     *
     */
    init : function (parent, title, mode) {
        this.parentWindow = parent;
        // retrieve the webpage object corresponding to the parent
        this.browser = slUtils.getBrowserFromContentWindow(parent);
        this.domWindowUtils = parent.QueryInterface(Ci.nsIInterfaceRequestor)
                                    .getInterface(Ci.nsIDOMWindowUtils);
        this._mode = mode;
        // take account of mode if multi files
        if (mode & Ci.nsIFilePicker.modeOpenMultiple) {
            this.supportsMultiple = true;
        }
        else {
            this.supportsMultiple = false;
        }

    },

    _mode : 0,

    /**
     * The picker's mode, as set by the 'mode' argument passed to init()
     * (one of the modeOpen et. al. constants specified above).
     */
    get mode() {
        return this._mode;
    },

    /**
     * Append to the  filter list with things from the predefined list
     *
     * @param   long   filterMask  mask of filters i.e. (filterAll | filterHTML)
     *
     */
    appendFilters : function (filterMask) {
        // nothing: let's ignore
    },

    /**
     * Add a filter
     *
     * @param   string   title    name of the filter
     * @param   string   filter   extensions to filter -- semicolon and space separated
     *
     */
    appendFilter : function (title, filter) {
        // nothing: let's ignore
    },

    /**
     * The filename that should be suggested to the user as a default. This should
     * include the extension.
     *
     * @throws NS_ERROR_FAILURE on attempts to get
     */
    defaultString : '',

    /**
     * The extension that should be associated with files of the type we
     * want to work with.  On some platforms, this extension will be
     * automatically appended to filenames the user enters, if needed.  
     */
    defaultExtension : '.*',

    /**
     * The filter which is currently selected in the File Picker dialog
     *
     * @return long Returns the index (0 based) of the selected filter in the filter list. 
     */
    filterIndex : 0,

    /**
     * Set the directory that the file open/save dialog initially displays
     *
     * @param   nsIFile   displayDirectory  the name of the directory
     *
     */
    displayDirectory : null,


    /**
     * Set the directory that the file open/save dialog initially displays
     * using one of the special name as such as 'Desk', 'TmpD', and so on.
     */
    displaySpecialDirectory: '',

    /**
     * Get the nsIFile for the file or directory.
     *
     * @return nsIFile Returns the file currently selected
     * @readonly
     */
    get file () {
        return (this._nsfiles.length?this._nsfiles[0]:null);
    },

    /**
     * Get the nsIURI for the file or directory.
     *
     * @return nsIURI Returns the file currently selected
     * @readonly
     */
    get fileURL () {
        if (this._nsfiles.length)
            return Services.io.newFileURI(this._nsfile[0]);
        return null;
    },

    /**
     * Get the enumerator for the selected files
     * only works in the modeOpenMultiple mode
     *
     * @return nsISimpleEnumerator Returns the files currently selected
     * @readonly
     */
    get files () {
        return slUtils.createSimpleEnumerator(this._nsfiles);
    },

    /**
     * Get the nsIDOMFile for the file.
     *
     * @return nsIDOMFile Returns the file currently selected as DOMFile
     * @readonly
     * @deprecated GECKO 46
     */
    get domfile () {
        return this.domFileOrDirectory;
    },

    /**
     * Get the enumerator for the selected files
     * only works in the modeOpenMultiple mode
     *
     * @return nsISimpleEnumerator Returns the files currently selected as DOMFiles
     * @readonly
     * @deprecated GECKO 46
     */
    get domfiles () {
        return this.domFileOrDirectoryEnumerator;
    },

    /**
     * Get the nsIDOMFile for the file.
     *
     * @return nsIDOMFile Returns the file currently selected as DOMFile
     * @readonly
     * @since GECKO 46
     */
    get domFileOrDirectory () {
        return (this._nsDOMFiles.length?this._nsDOMFiles[0]:null);
    },

    /**
     * Get the enumerator for the selected files
     * only works in the modeOpenMultiple mode
     *
     * @return nsISimpleEnumerator Returns the files currently selected as DOMFiles
     * @readonly
     * @since GECKO 46
     */
    get domFileOrDirectoryEnumerator () {
        return slUtils.createSimpleEnumerator(this._nsDOMFiles);
    },

    /**
     * Controls whether the chosen file(s) should be added to the system's recent
     * documents list. This attribute will be ignored if the system has no "Recent
     * Docs" concept, or if the application is in private browsing mode (in which
     * case the file will not be added). Defaults to true.
     */
    addToRecentDocs: false,

    /**
     * Show File Dialog. The dialog is displayed modally.
     *
     *
     * @return short returnOK if the user selects OK, returnCancel if the user selects cancel
     * @deprecated GECKO 57
     */
    show : function () {
        if (!this.browser || !this.browser.webpage) {
            return Ci.nsIFilePicker.returnCancel;
        }

        let oldFile = '';
        if (this.defaultString !== '' && this.displayDirectory) {
            let f = this.displayDirectory.clone();
            f.append(this.defaultString);
            oldFile = f.path;
        }

        // call the onFilePicker callback on the corresponding webpage
        let selectedFileName = '';
        let selectedFiles = [];
        if (this.browser.webpage.onFilePicker) {
            // the callback receives the old selected file
            // and should returns the new file.
            selectedFileName = this.browser.webpage.onFilePicker(oldFile);
            if (selectedFileName) {
                if (!Array.isArray(selectedFileName))
                    selectedFiles = this._filterFiles([selectedFileName]);
                else
                    selectedFiles = this._filterFiles(selectedFileName);
            }
        }

        // if no file is given, take the file set by webpage.uploadFile()
        if (!selectedFiles.length
            && 'uploadFiles' in this.browser
            && this.browser.uploadFiles.length !== 0) {
            selectedFiles = this.browser.uploadFiles;
        }
        this._nsfiles = selectedFiles;
        if (selectedFiles.length) {
            if (!this.supportsMultiple) {
                this._nsfiles = [selectedFiles[0]];
            }
            this.browser.uploadFilesReaded = true;
            return Ci.nsIFilePicker.returnOK;
        }
        else {
            this.browser.uploadFilesReaded = true;
            return Ci.nsIFilePicker.returnCancel;
        }
    },

    /**
     * Opens the file dialog asynchrounously.
     * The passed in object's done method will be called upon completion.
     * @param {nsIFilePickerShownCallback} aFilePickerShownCallback
     */
    open : function (aFilePickerShownCallback) {
        let tm = Cc["@mozilla.org/thread-manager;1"].getService(Ci.nsIThreadManager);
        tm.mainThread.dispatch(() => {
            let result = Ci.nsIFilePicker.returnCancel;
            try {
                result = this.show();
            } catch (ex) {
            }
            let promises = [];
            this._nsDOMFiles = [];
            if (this._nsfiles.length) {
                for (let i = 0; i < this._nsfiles.length; ++i) {
                    if (this._nsfiles[i].exists()) {
                        if (geckoMajorVersion < 54) {
                            this._nsDOMFiles.push(this.domWindowUtils.wrapDOMFile(this._nsfiles[i]));
                        }
                        else {
                            let promise =
                                this.parentWindow.File.createFromNsIFile(this._nsfiles[i])
                                    .then(file => { this._nsDOMFiles.push(file);});
                            promises.push(promise);
                        }
                    }
                }
            }
            if (promises.length) {
                Promise.all(promises).then(() => {
                    if (aFilePickerShownCallback) {
                        aFilePickerShownCallback.done(result);
                    }
                });
            }
            else {
                if (aFilePickerShownCallback) {
                    aFilePickerShownCallback.done(result);
                }
            }
        }, Ci.nsIThread.DISPATCH_NORMAL);
    },

    okButtonLabel : ''
};

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([filePicker]);
