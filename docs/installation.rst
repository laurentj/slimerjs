.. index:: Installation


============
Installation
============

Requirements
------------

SlimerJS runs on any platform on which Firefox or XulRunner is available: Linux (32bits and 64bits),
Windows, MacOs X. XulRunner is the core of Firefox without its user interface.

On windows, you should open a terminal. You can use the classical cmd.exe, or the recent PowerShell.exe.
You can also install `Cygwin <http://www.cygwin.com/>`_ and use its terminal.

You cannot use the MingW32 environment on Windows because there are some issues with
(no output in the console, and it lacks on some commands like mktemp).

On Linux, standalone editions need these libraries: libpthread.so, libdl.so, libstdc++.so,
libm.so, libgcc_s.so, libc.so, ld-linux-x86-64.so, libXrender1.so, libasound.so.2,
libgtk-x11-2.0.so.0. On Ubuntu/Debian, you can install/verify it by doing:

.. code-block:: bash

    sudo apt-get install libc6 libstdc++6 libgcc1 libgtk2.0-0 libasound2 libxrender1

Installation of SlimerJS
------------------------

.. index::  linux, package

To install SlimerJS, you need to download its package. It is available in two editions:


- The **Standalone Edition**: this is a zip/gz package containing
  SlimerJS **and** XulRunner. There is a package for each operating system.
  Download it, extract it. *Everything is here*. You're ready to use SlimerJS.
  Go to the :ref:`Lauching SlimerJS <launch>` section.
- The **Lightweight Edition**: this is a zip package containing
  only SlimerJS and it targets all operating system. You have to install Firefox or XulRunner
  separately (version 25 is recommanded) and probably you'll need to
  :ref:`set an environment variable <setup>`.
  This package can be downloaded from slimerjs.org. Or it can be installed from a
  repository like the Arch Linux's repository or Homebrew.

See the `download page <http://slimerjs.org/download.html>`_ to know the places from
where you can retrieve SlimerJS.
  

.. index:: SLIMERJSLAUNCHER

.. _setup:

Configuring SlimerJS
--------------------

During its launch, SlimerJS tries to discover itself the path of Firefox or
XulRunner. This is not a problem for the *Standalone edition* or linux packages.

In case it fails (this could be the case for the *lightweight edition*), or if you want
to launch SlimerJS with a specific version of Firefox, you should create an environment
variable containing the path of the Firefox/XulRunner binary. To create this environment
variable from a command line:

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

An alternative on linux or macos, is to create a link to an installed xulrunner package.
Go into the SlimerJS directory and type for example:

.. code-block:: bash

    ln -s /usr/lib/xulrunner

The path could change, depending of where Xulrunner is installed.


Using unstable version or very old versions of Firefox/XulRunner
----------------------------------------------------------------

By default, SlimerJS is configured to be compatible only with specific stable versions of
Firefox and XulRunner. It's because internal API of Firefox/XulRunner can be changed
between versions, and so SlimerJS may not work as expected. Stranges behaviors or even
fatal errors may appears with unsupported versions. SlimerJS has only been tested with
specific versions of Firefox/XulRunner.

However, you can change this limitation, by modifying the ``maxVersion`` parameter (and/or
the ``minVersion``) in the ``application.ini`` of SlimerJS. But remember you do it
**at your own risk**.

If you found issues with unsupported versions of Firefox/XulRunner, please discuss about
it in the mailing-list, especially if it is about unstable version fo Firefox/XulRunner.

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

There is a tool called xvfb, available on Linux and MacOS. It allows to launch
any "graphical" programs without the need of an X-Windows environment. Windows of
the application won't be shown and will be drawn only in memory.

Install it from your prefered repository (``sudo apt-get install xvfb`` with debian/ubuntu).

Then launch SlimerJS like this:

.. code-block:: bash

    xvfb-run ./slimerjs myscript.js

You won't see any windows. If you have any problems with xvfb, see its
documentation.

Using flash plugin or other kind plugins
----------------------------------------

SlimerJS is able to load Flash content if the Flash plugin is installed,
and is able to load any other plugins.

In fact, every NPAPI plugins that work with any browser can be used by SlimerJS.
Just install them as indicated by the vendor, and it will be theorically recognized
by SlimerJS. See `details on MDN <https://developer.mozilla.org/en-US/Add-ons/Plugins/Gecko_Plugin_API_Reference/Plug-in_Development_Overview#Installing_Plug-ins>`_ .

For example, on linux, install the corresponding package. However, in some case, you should
probably use the xulrunner or the Firefox package of the distro, instead of the xulrunner
provided by SlimerJS. This is apparently the case for Fedora for example.

Note: plugins are not Firefox/XUL/JS extensions. Plugins and "extensions" are two
different things in the gecko world. Extensions for Firefox are pieces of code to extends
some features of Gecko and/or to add some UI things in the interface of Firefox. Plugins
are black boxes that can only be loaded with the html element ``<object>``, like Flash.

See `detailed definition of plugins on MDN <https://developer.mozilla.org/en-US/Add-ons/Plugins>`_ .

Creating extensions?
--------------------

Theorically, you can create XUL/JS extensions for SlimerJS like you do for Firefox, but
their installation is not easy since their are no user interface to install them. However,
it is theorically possible to create and install extensions.

See `documentation on MDN <https://developer.mozilla.org/en-US/Add-ons>`_.


