
# SlimerJS

SlimerJS will be an extension for Firefox, allowing to execute an external javascript script which
can manipulate web content.

Its goal is to provide a tool like [PhantomJs](http://phantomjs.org/), with the same API, except that
it runs Gecko instead of Webkit, and it is not headless (but you can still use xfvb to have a headless SlimerJS).

You could then use other tools like CasperJS...

For the moment, it is only a ghostware.

# Install

Click on this invisible-not-existing-yet link ?

# Launching SlimerJS


```
    firefox --slimerjs
```

It only opens a window with nothing in it (Probably you could see a ghost...)

In the future, you could indicate a script to execute:

```
    firefox --slimerjs myscript.js
```



# Content of a script

See [Documentation of PhantomJS](https://github.com/ariya/phantomjs/wiki/Quick-Start), although it
doesn't work yet.

You could use the [API of PhantomJS 1.7](https://github.com/ariya/phantomjs/wiki/API-Reference), it
is not yet implemented. 


# FAQ

- Why is it not Headless?
  - Gecko, the rendering engine of Firefox, cannot render web content only in memory, without a window.
    See [Mozilla bug 446591](https://bugzilla.mozilla.org/show_bug.cgi?id=446591).
- Why is it called "SlimerJs"?
   - Slimer is the name of a ghost in the film "GhostBusters". As you may now, the Firefox source code use
      many references from this film, and since PhantomJS, CasperJs and other related tools, its a matter of ghost...


