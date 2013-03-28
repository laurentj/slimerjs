# SlimerJS

SlimerJS is a scriptable browser. It allows you to manipulate a web page
with a Javascript script: opening a webpage, clicking on links, modifying the content...
It is useful to do functional tests, page automaton, network monitoring, screen capture etc.

It is in fact a tool like [PhantomJs](http://phantomjs.org/), except that
it runs Gecko instead of Webkit, and it is not (yet) headless
(but you can try to use xvfb to have a headless SlimerJS).

Because SlimerJS will provide the same API of PhantomJS, you could then use
other tools like [CasperJS](http://casperjs.org)...

SlimerJS is not only a PhantomJS clone, it contains also additional features:

* Benefit of [the power of Javascript 1.8.6](https://developer.mozilla.org/en-US/docs/JavaScript/Reference),
  that [has already features of the future standard Ecmascript "Harmony" 6](https://developer.mozilla.org/en-US/docs/JavaScript/ECMAScript_6_support_in_Mozilla):
  iterators, generators, destructured assignement, Map and WeakMap, "let" keyword...
* Many [modules of the Mozilla Addons Sdk](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/) are available
  and you can import it into your code as any CommonJS modules.
* SlimerJS is able to load flash content if the Flash plugin is installed

Technically, SlimerJS is a XUL/JS application that can be launched with
XULRunner or Firefox (without its interface).

# Community

Follow us on twitter: [@slimerjs](https://twitter.com/slimerjs)

Ask your questions on the dedicated [mailing list](https://groups.google.com/forum/#!forum/slimerjs).

Or discuss with us on IRC: channel #slimerjs on irc.mozilla.org.

# Install

- Install [Firefox](http://getfirefox.com),
  or [XulRunner](http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/19.0.2/runtimes/) (both version 18 or more)
- [download the source code of SlimerJS](https://github.com/laurentj/slimerjs/archive/master.zip) if you didn't it yet
- On windows, a .bat is provided, but you can also launch slimer from a "true" console. In this case, you should install
  [Cygwin](http://www.cygwin.com/) or any other unix environment to launch slimerjs. Note
  that some issues are known with Cygwin.
- SlimerJS needs to know where Firefox or XulRunner is stored. It tries to discover
  itself the path but can fail. You must then set the environment variable
  SLIMERJSLAUNCHER, which should contain the full path to the firefox binary:
   - On linux: ```export SLIMERJSLAUNCHER=/usr/bin/firefox```
   - on Windows: ```SET SLIMERJSLAUNCHER="c:\Program Files\Mozilla Firefox\firefox.exe```
   - On windows with cygwin : ```export SLIMERJSLAUNCHER="/cygdrive/c/program files/mozilla firefox/firefox.exe"```
   - On MacOS: ```export SLIMERJSLAUNCHER=/Applications/Firefox.app/Contents/MacOS/firefox```
- You can of course set this variable in your .bashrc, .profile or in the computer
   properties on Windows.

# Launching SlimerJS

Open a terminal and go to the src/ directory of SlimerJS. Then launch:

```
    ./slimerjs myscript.js
```

In the Windows commands console:

```
    slimerjs.bat myscript.js
```


The given script myscripts.js is then executed in a window. If your script is
short, you probably won't see this window.

You can for example launch some tests:

```
    ./slimerjs ../test/initial-tests.js
```

Note: on MacOs, there is a known bug. You could have an error "script not found".
Indicate the full path of the js script to avoid it.

# Content of a script

It should contain javascript instructions. The script is executed in the context of a
blank page. Here are objects you can play with:

- the [window object](https://developer.mozilla.org/en-US/docs/DOM/window) of the blank page and all of its functions
- the [document object](https://developer.mozilla.org/en-US/docs/DOM/document) of the blank page
- a **console** object, similar with the [DOM Console object](https://developer.mozilla.org/en-US/docs/DOM/console),
  providing these methods: debug, log, info, warn, error
- a **phantom** object that will provide the [API of PhantomJS 1.8](https://github.com/ariya/phantomjs/wiki/API-Reference),
  but all of its properties and methods are not implemented yet
- a **slimer** object that will contain additionnal API
- a **require** function to load CommonJS modules
- some modules that are almost identical to those provided by PhantomJS: **system**, **webserver**,
  **fs** and **webpage**. Those two last modules are not yet fully implemented but they
  provide the most important API.
- some modules of the Mozilla Addons SDK: promise, heritage, xhr, system/, deprecated/ etc.

You can read the [compatibility table](https://github.com/laurentj/slimerjs/blob/master/API.md) to know the implementation progress.

To know how to use all available APIs, read the [PhantomJS documentation](https://github.com/ariya/phantomjs/wiki/Quick-Start).

Note that you must execute ```slimer.exit()``` or ```phantom.exit()``` to terminate the application, else
the window of SlimerJS won't be closed.

# Roadmap

The goal for a first stable release 1.0 is to have a full implementation of the API of PhantomJS 1.8.

After this release, the goal will be to hack XulRunner to run headless windows.

# FAQ

- Why is it not Headless?
  - Gecko, the rendering engine of Firefox, cannot render web content without a window.
    See [Mozilla bug 446591](https://bugzilla.mozilla.org/show_bug.cgi?id=446591). however you could
    launch SlimerJS with xvfb (not tested).
- Why is it called "SlimerJs"?
   - Slimer is the name of a ghost in the movie "GhostBusters". As you may now, the Firefox source code uses
    many references from this movie, and since PhantomJS, CasperJs and other related tools, is a matter of ghost... ;-)
- How can I contribute?
   - Report bugs and ideas of improvements into ["issues" on github](https://github.com/laurentj/slimerjs/issues).
   - Improve the code by providing patches. SlimerJS is entirely in Javascript!! [Fork the repository in github](https://github.com/laurentj/slimerjs/fork_select),
     commit, and do pull requests. Please create one dedicated branch for each bugs/features.
   - Document the API [in the wiki](https://github.com/laurentj/slimerjs/wiki)
   - We need a website and a logo!!
   - Other ideas? Discuss with us on the IRC channel or in the mailing list (see above).
- Why are there no tests on the WebServer object?
   - This module is based on the [httpd component](http://mxr.mozilla.org/mozilla-central/source/netwerk/test/httpserver/)
     of Mozilla used for their own unit tests, and that is already [heavily tested](http://mxr.mozilla.org/mozilla-central/source/netwerk/test/httpserver/test/)
- Why are there no tests on the FileSystem object?
   - This module is based on the [file module provided in the Mozilla Addons SDK](https://github.com/laurentj/addon-sdk/blob/master/lib/sdk/io/file.js),
     and [is already tested](https://github.com/laurentj/addon-sdk/blob/master/test/test-file.js).
