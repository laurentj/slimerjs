.. index:: Installation


============
Installation
============

Requirements
------------

SlimerJS runs on any platform on which Firefox is available: Linux (32bits and 64bits),
Windows, MacOs X.

On windows, you should open a terminal. You can use the classical cmd.exe, or the recent PowerShell.exe.
You can also install `Cygwin <http://www.cygwin.com/>`_ and use its terminal.

You cannot use the MingW32 environment on Windows because there are some issues
with ir (no output in the console, and it lacks on some commands like mktemp).

Note: version 0.9 and lower of SlimerjS were provided with XulRunner, the
Firefox runtime. After release of XulRunner 40.0, Mozilla ceased to build it
and even remove its source code from Firefox's source tree. So you have to install
Firefox to use SlimerJS 0.10 and higher.

On Linux, if you don't have an X environment, and if you want to install Firefox
from binaries provided directly by Mozilla, you need to know that Firefox
needs these libraries: libpthread.so, libdl.so, libstdc++.so,
libm.so, libgcc_s.so, libc.so, ld-linux-x86-64.so, libXrender1.so, libasound.so.2,
libgtk-x11-2.0.so.0, libdbus-glib-1.so.2. This list may not be complete, depending of your distribution
 and the version of Firefox. On Ubuntu/Debian, you can install/verify it by doing:

.. code-block:: bash

    sudo apt-get install libc6 libstdc++6 libgcc1 libgtk2.0-0 libasound2 libxrender1 libdbus-glib-1-2

If Firefox or SlimerJS does not work, add ``--debug=true`` to the command line
of Slimerjs, to see if there is no errors about libraries missing. If so, install
packages that provide missing libraries. Search missing files in `the debian repository <https://packages.debian.org/>`_
or the `the ubuntu repository <http://packages.ubuntu.com/>`_.

Probably the best thing is to install the package of Firefox provided by your
distribution : it will install all dependencies. And next, you can install and
use binaries from Mozilla.


Installation of SlimerJS
------------------------

.. index::  linux, package

To install SlimerJS, you need to download its package. This is a zip package containing
SlimerJS and it targets all operating system. You have to install Firefox separately
(version 40+ is recommanded) and probably you'll need to :ref:`set an environment variable <setup>`.
This package can be downloaded from slimerjs.org. Or it can be installed from a
repository like the Arch Linux's repository or Homebrew.

See the `download page <http://slimerjs.org/download.html>`_ to know the places from
where you can retrieve SlimerJS.

.. index:: SLIMERJSLAUNCHER

.. _setup:

Configuring SlimerJS
--------------------

During its launch, SlimerJS tries to discover itself the path of Firefox.

In case it fails, or if you want to launch SlimerJS with a specific version
of Firefox, you should create an environment variable containing the path of
the Firefox binary. To create this environment variable from a command line:

- On linux:
   .. code-block:: bash

      export SLIMERJSLAUNCHER=/usr/bin/firefox

- on Windows
   .. code-block:: text

      SET SLIMERJSLAUNCHER="c:\Program Files\Mozilla Firefox\firefox.exe

- On windows with cygwin
   .. code-block:: bash

      export SLIMERJSLAUNCHER="/cygdrive/c/program files/mozilla firefox/firefox.exe"

- On MacOS
   .. code-block:: bash

      export SLIMERJSLAUNCHER=/Applications/Firefox.app/Contents/MacOS/firefox


You can of course set this variable in your .bashrc, .profile or in the computer
properties on Windows.

Using unstable version or very old versions of Firefox
------------------------------------------------------

By default, SlimerJS is configured to be compatible only with specific stable versions of
Firefox. It's because internal API of Firefox can be changed between versions,
and so SlimerJS may not work as expected. Stranges behaviors or even fatal
errors may appears with unsupported versions. SlimerJS has only been tested with
specific versions of Firefox.

However, you can change this limitation, by modifying the ``maxVersion`` parameter (and/or
the ``minVersion``) in the ``application.ini`` of SlimerJS. But remember you do it
**at your own risk**.

If you found issues with unsupported versions of Firefox, please discuss about
it in the mailing-list, especially if it is about an unstable version of Firefox.

.. _launch:

Launching SlimerJS
------------------

From a command line, call the `slimerjs` executable (or ``slimerjs.bat`` for Windows)
with the path of a javascript file.

.. code-block:: bash

    /somewhere/slimerjs-1.2.3/slimerjs myscript.js
    # or if SlimerJS is in your $PATH:
    slimerjs myscript.js

On Windows:

.. code-block:: text

    c:\somewhere\slimerjs-1.2.3\slimerjs.bat myscript.js

The js script should contain your instructions to manipulate a web page...

You can indicate several options on the command line. See the "configuration" chapter.

Having a headless SlimerJS
--------------------------

Starting with Firefox 56, (and 55 on linux), you can add the command line option
``--headless``, so you don't need a graphical environment, even on Linux. See
`the Mozilla documentation about it <https://developer.mozilla.org/en-US/Firefox/Headless_mode>`_.

.. code-block:: bash

    ./slimerjs --headless myscript.js

Instead of using this ``--headless`` flag, you can set an environment variable MOZ_HEADLESS to 1.

.. code-block:: bash

    MOZ_HEADLESS=1
    ./slimerjs myscript.js


If you are using Firefox 54 and lower, the only solution to have an "headless"
SlimerJS, is to use xvfb and it works only on Linux. Xvfb allows to launch any
"graphical" programs without the need of an X-Windows environment. Windows of
the application won't be shown and will be drawn only in memory.

Install it from your prefered repository (``sudo apt-get install xvfb`` with debian/ubuntu).

Then launch SlimerJS like this:

.. code-block:: bash

    xvfb-run ./slimerjs myscript.js

You won't see any windows. If you have any problems with xvfb, see its
documentation.

Note: xvfb is also available on MacOS, however Firefox for MacOs does not using
X11 backend so it does not work.

Using flash plugin or other plugins
----------------------------------------

The possibility to use Flash and other NPAPI plugins depends to the version
of Firefox you are using.

Firefox 52+ is not be able any more to load NPAPI plugins. And future version
may not be able to load Flash.

So SlimerJS can load Flash content or other NPAPI plugins if Firefox can.
In this case, just install them as indicated by the vendor, and it will be
theorically recognized by SlimerJS. See `details on MDN <https://developer.mozilla.org/en-US/Add-ons/Plugins/Gecko_Plugin_API_Reference/Plug-in_Development_Overview#Installing_Plug-ins>`_ .

For example, on linux, install the corresponding package.

Note: plugins are not Firefox/XUL/JS extensions. Plugins and "extensions" are two
different things in the gecko world. Extensions for Firefox are pieces of code to extends
some features of Gecko and/or to add some UI things in the interface of Firefox. Plugins
are black boxes that can only be loaded with the html element ``<object>``, like Flash,
to show non-html content inside a web page.

See `detailed definition of plugins on MDN <https://developer.mozilla.org/en-US/Add-ons/Plugins>`_ .

Creating extensions?
--------------------

Theorically, you can create XUL/JS addons for SlimerJS like you do for Firefox,
It is not easy but it is possible. See :doc:`the dedicated chapter <manual/addons>`.
It is not possible any more if you are using Firefox 57+.

