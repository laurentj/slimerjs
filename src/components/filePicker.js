 
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://slimerjs/slUtils.jsm");
 
function filePicker() {
}

filePicker.prototype = {
    classID          : Components.ID("{4d447d76-5205-4685-9237-9a35c7349adf}"),
    classDescription: "file picker for SlimerJS",
    QueryInterface   : XPCOMUtils.generateQI([Ci.nsIFilePicker]), // "@mozilla.org/filepicker;1"

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
        // retrieve the webpage object corresponding to the parent
        // take account of mode if multi files
        // set displayDirectory
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
    defaultExtension : '',

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
     * Get the nsIFile for the file or directory.
     *
     * @return nsIFile Returns the file currently selected
     * @readonly
     */
    get file () {
        return null;
    },

    /**
     * Get the nsIURI for the file or directory.
     *
     * @return nsIURI Returns the file currently selected
     * @readonly
     */
    get fileURL () {
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
        return null;
    },

    /**
     * Get the nsIDOMFile for the file.
     *
     * @return nsIDOMFile Returns the file currently selected as DOMFile
     * @readonly
     */
    get domfile () {
        // see nsDOMWindowUtils::WrapDOMFile
        return null;
    },

    /**
     * Get the enumerator for the selected files
     * only works in the modeOpenMultiple mode
     *
     * @return nsISimpleEnumerator Returns the files currently selected as DOMFiles
     * @readonly
     */
    get domfiles () {
        // see nsDOMWindowUtils::WrapDOMFile
        return null;
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
     * @return short returnOK if the user selects OK, returnCancel if the user selects cancel
     *
     */
    show : function () {
        // call the onFilePicker callback on the corresponding webpage
            // the callback receives the old selected file
            // and should returns the new file. this returned file is taken
            // account only if the file exists

        // if no file is given, take the file set by webpage.uploadFile()
        return Ci.nsIFilePicker.returnCancel;
    },

    /**
     * Opens the file dialog asynchrounously.
     * The passed in object's done method will be called upon completion.
     * @param nsIFilePickerShownCallback aFilePickerShownCallback
     */
    open : function (aFilePickerShownCallback) {
        let res = this.show;
        aFilePickerShownCallback.done(res);
    }
}

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([Navigation]);