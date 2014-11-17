.. index:: faq

==========================
Frequently Asked Questions
==========================


Troubles with the runtime
=========================


When I launch SlimerJS, nothing append, nothing is displayed in the console
---------------------------------------------------------------------------

Probably it is launched with an incompatible version of Firefox/XulRunner. If you use
a lightweight edition, verify that the environment variable SLIMERJSLAUNCHER contains the
path to a Firefox/XulRunner that is compatible with SlimerJS. To verify, launch
``/path/to/firefox --version`` or ``/path/to/xulrunner --version``. The displayed version
should be between MinVersion and MaxVersion indicated into the application.ini file of SlimerJS.


Sometimes SlimerJS hangs, it does not exit, the script is not totally executed
------------------------------------------------------------------------------

Verify that you have enough free memory on your system.


Rendering
=========

The rendering of my web site is not really like in my favorite browser. Even in Firefox
---------------------------------------------------------------------------------------

A browser is very complex program. The final rendering (the appearance of the web page)
depends on many different things:

- The browser engine (Gecko vs Webkit vs Presto vs Blink vs....).
- The version of the browser engine (improvements and bug fixes are made in each
  version of a browser).
- The library used to draw graphics: depending the operating system the
  browser is on, it uses a different graphics backend. For example, Firefox
  uses the Cairo library, which uses DirectX on windows, or other libraries
  on Linux or MacOs. So there are different algorithm, different implementations,
  to draw the same thing.
- The accelerated graphic cards: a browser can use hardware implementation
  or can use software implementations if the graphic cards has no accelerated
  graphic chipset. So different algorithm, different implementations: different
  results.
- To draw font (if the web page doesn't use web fonts), it depends on the installed fonts
- Etc...

So, don't expect to have exactly the same results between any browser and SlimerJS.
Moreover, SlimerJS uses exactly the same rendering engine as Firefox: if you use
the lighweight edition, it uses Firefox itself, and for other editions, it uses
XulRunner, downloaded directly from Mozilla servers (and so built by Mozilla, exactly
the same way they build Firefox). **At least, the rendering with SlimerJs
may be exactly the same as with Firefox** (same gecko version, on the
same operating system). However you could have some difference in some extrem
case (high zooming for example) and with different operating system (even it is
the same gecko version).

You can speak with us about rendering issues, on the mailing list.

