
# SlimerJS

SlimerJS will be an extension for Firefox, allowing to execute an external javascript script which
can manipulate web content.

Its goal is to provide a tool like [PhantomJs](http://phantomjs.org/), with the same API, except that
it runs Gecko instead of Webkit, and it is not headless (but you can still use xvfb to have a headless SlimerJS).

You could then use other tools like [CasperJS](http://casperjs.org)...

For the moment, it is only a ghostware :-)

# Install

First, you have to build the addon. It will be provided in download later.

- [download the source code of SlimerJS](https://github.com/laurentj/slimerjs/archive/master.zip) if you didn't it yet
- Open a terminal
- On a Linux system or MacOS, execute build/build.sh. You'll have a zip file named slimerjs.xpi. This is an addon for Firefox.
- For windows users, zip "by hand" the content of the src/ directory and name the zip file as slimerjs.xpi
- Create a new profile in Firefox. So SlimerJS will run into a cleaned profile, without extensions etc :
  it will be faster and it won't be annoyed by some extension that interacts with web content etc..
  Anyway, it's better to launch tests with a different profile than the profile you use daily to surf etc.
   - execute ```firefox -CreateProfile slimerjs -no-remote```, it will create a profile named "slimerjs"
   - launch Firefox with this profile : ```firefox -P slimerjs -no-remote``` and then install the slimerjs addon with the addons manager

Note:
- on windows, replace ```firefox``` by ```firefox.exe```
- on mac, replace ```firefox``` by ```/Applications/Firefox.app/Contents/MacOS/firefox```


# Launching SlimerJS

Go to the bin directory and launch:

```
    slimerjs myscript.js
```

It only opens a window with nothing in it (Probably you'll see a ghost...). Yes, this is an incredible project!
The given script myscripts.js is executed in the background.

You can for example launch some tests:


```
    slimerjs ../test/initial-tests.js
```

# Content of a script

It should contain javascript instructions. The script is executed in the context of a
blank page. Here are objects you can play with:

- the [window object](https://developer.mozilla.org/en-US/docs/DOM/window) of the blank page and all of its functions
- the [document object](https://developer.mozilla.org/en-US/docs/DOM/document) of the blank page
- a console object, similar with the [DOM Console object](https://developer.mozilla.org/en-US/docs/DOM/console),
  providing these methods: debug, log, info, warn, error, trace, clear, dir, dirxml, group, groupEnd
- a slimer object (and a phantom object that is a reference to slimer for compatibility): it
  will provide the [API of PhantomJS 1.7](https://github.com/ariya/phantomjs/wiki/API-Reference),
  but all of its properties and methods are not implemented

You can read the [compatibility table](API.md) to know the implementation progress.

In the future, there will be all features of [PhantomJS](https://github.com/ariya/phantomjs/wiki/Quick-Start).

Note that you must execute ```slimer.exit()``` or ```phantom.exit()``` to terminate the application, else
the window of SlimerJS won't be closed.


# FAQ

- Why is it not Headless?
  - Gecko, the rendering engine of Firefox, cannot render web content without a window.
    See [Mozilla bug 446591](https://bugzilla.mozilla.org/show_bug.cgi?id=446591). however you could
    launch SlimerJS with xvfb.
- Why is it called "SlimerJs"?
   - Slimer is the name of a ghost in the movie "GhostBusters". As you may now, the Firefox source code uses
    many references from this movie, and since PhantomJS, CasperJs and other related tools, is a matter of ghost...


