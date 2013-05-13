# SlimerJS

SlimerJS is a scriptable browser. It allows you to manipulate a web page
with a Javascript script: opening a webpage, clicking on links, modifying the content...
It is useful to do functional tests, page automaton, network monitoring, screen capture etc.

It is in fact a tool like [PhantomJs](http://phantomjs.org/), except that
it runs Gecko instead of Webkit, and it is not (yet) natively headless.
However, it can be headless with the use of xvfb under Linux or MacOS.

SlimerJS provide almost the same API of PhantomJS. The current version of SlimerJS
is not 100% compatible. See current release notes in docs/release-notes.rst, and
read the [compatibility table](https://github.com/laurentj/slimerjs/blob/master/API_COMPAT.md)
to know the implementation progress.

The main goal of SlimerJS is to allow to execute all scripts developed for PhantomJS. So
in a near future, you could use tools like [CasperJS](http://casperjs.org)...

SlimerJS is not only a PhantomJS clone, it contains also [additional features](http://slimerjs.org/features.html).

Technically, SlimerJS is a XUL/JS application that can be launched with
XULRunner or Firefox (without its interface).

# Community

Follow us on twitter: [@slimerjs](https://twitter.com/slimerjs)

Ask your questions on the dedicated [mailing list](https://groups.google.com/forum/#!forum/slimerjs).

Or discuss with us on IRC: channel #slimerjs on irc.mozilla.org.

# Install SlimerJS, executing a script...

See documentation into the docs/ directory into the source code, or read
it [on the web site](http://docs.slimerjs.org/current/)

# Roadmap

The goal for a first stable release 1.0 is to have a full implementation of
the API of PhantomJS 1.9, with the support of Coffee scripts and Ghost Driver.

After this release, the goal will be to hack XulRunner to run headless windows.

# FAQ and contribution

Read the faq into the website/faq.html file or [on the website](http://slimerjs.org/faq.html).
