You want to contribute? Here is a little doc on how SlimerJS works.

Firefox and documentation
===========================

SlimerJS is a XUL application. So it is built on top
Mozilla technologies like XUL, XPCom, and use Javascript as main language.

All documentation about XUL application development, is
on https://developer.mozilla.org/.

You can also take a look at:

- [Javascript language](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [JSM](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules), the internal
  javascript module system of Mozilla (*.jsm that you can find in src/modules/)
- [How to use and create XPCOM Components](https://developer.mozilla.org/en-US/docs/Creating_XPCOM_Components),
  the Cross Platform Component Object Module of Mozilla. Most of C++ components accessible
  through Javascript in a XULRunner application, are created using XPCOM. XPCOM Components
  can be also developped in Javascript. Some XPCOM components are developped in SlimerJS.
  You'll find them in src/components/
- [The Chrome URL](https://developer.mozilla.org/en-US/docs/XUL/Tutorial/The_Chrome_URL),
  [Chrome registration](https://developer.mozilla.org/en-US/docs/Chrome_Registration),
  and [definitions of the Chrome world](https://developer.mozilla.org/en-US/docs/Chrome).
  Note: we don't talk about the Google's browser. "Chrome" in Mozilla is a completely
  different thing. Google has just reused the name. Probably a wink to Mozilla ;-) (do
  you know that some early lead developers of Google Chrome came from Mozilla?)

The application launch
======================

When you launch the `slimer` executable, Firefox is called with the
path of the application.ini file.

First, Firefox tries to call an XPCOM component that handles the commande line.
Fortunately, SlimerJS provides one in `src/components/commandline.js`. It is registered in the
"command-line-handler" XPCOM category in `src/chrome.manifest`, this is why Firefox find
it.

The `handle()` method of this component is called. It uses the module `src/modules/slConfiguration.jsm`
to parse and store command line parameters. `slConfiguration` holds all configuration options
and this is where you declare command line parameters.

If `handle()` has no error, Firefox open the window which is indicated into the
`toolkit.defaultChromeURI` preference. Preferences of SlimerJS are stored into
`defaults/preferences/prefs.js`.

To open an application window, Firefox calls same function as `window.open()`, with a
"chrome://" URL. In a XUL application, every window has a chrome URL (type
`chrome://browser/content/browser.xul` in Firefox ;-) ).

In SlimerJS, the main window url points to the file
`src/chrome/slimerjs/content/slimerjs.xul`. `slimerjs.xul` is a very simple window. This will
be the parent window of all other windows that your script will open. Those child windows
are defined in `src/chrome/slimerjs/content/webpage.xul`, which has a simple `<browser>`
element (a kind of iframe in XUL). The web page is displayed by this element.

As you can see, `slimerjs.xul` has a `<script>` element, like in HTML. It loads the
`src/chrome/slimerjs/content/slimerjs.js` file.
This file is simple too. After the window loading, `startup()` is called,
which itself call the `slLauncher` component. This component loads and executes the
javascript file indicated on the command line, by using the
`src/modules/addon-sdk/toolkit/loader.js` component.

`loader.js` is able to load CommonJS modules in javascript sandboxes. slLauncher.jsm
defines options for the Loader (see `prepareLoader()`). Two of these options are high
level functions:

- `resolve()` to resolve path of modules given to `require()` in modules
- `load()` to prepare default objects for the sandbox of a module, and to call the
  low level function of `Loader` to load the module.

