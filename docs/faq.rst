.. index:: faq

==========================
Frequently Asked Questions
==========================


Troubles with the runtime
=========================


When I launch SlimerJS, nothing append, nothing is displayed in the console
---------------------------------------------------------------------------

Probably it is launched with an incompatible version of Firefox. If you use
a lightweight edition, verify that the environment variable SLIMERJSLAUNCHER contains the
path to a Firefox that is compatible with SlimerJS. To verify, launch
``/path/to/firefox --version``. The displayed version should be between
MinVersion and MaxVersion indicated into the application.ini file of SlimerJS.


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
Moreover, as SlimerJS is executed on top of Firefox, so **At least, the rendering
with SlimerJs may be exactly the same as with Firefox** (same gecko version, on the
same operating system). However you could have some difference in some extrem
case (high zooming for example) and with different operating system (even it is
the same gecko version).

You can speak with us about rendering issues, on the mailing list.


I don't see flash content when I take a screenshot with render()
----------------------------------------------------------------

This is because of `a bug in Gecko <https://bugzilla.mozilla.org/show_bug.cgi?id=650418>`_
(which was resolved as WONTFIX). However it can work in some cases, when the
``<object>`` element contains ``<param name="wmode" value="transparent">``.

When I take a screenshot, the SlimerJS logo appears
---------------------------------------------------

First, you can try to give the focus to the window you want to capture :


.. code-block:: javascript

    page.evaluate(function () {
        window.focus();
    });

It may not work, especially when you use xvfb and there is no window manager.
So a solution is to execute xvfb with a script that launches a window manager
(like fluxbox for example), then that launches Slimerjs.


PDF Rendering
=============

On linux, PDF rendering hangs SlimerJS
---------------------------------------

Verify that Cups is installed and is running. The environment variable
CUPS_SERVER can also prevents to produce PDF. It seems that removing it
solves the issue sometimes.



