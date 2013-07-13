.. index:: Installation


============
Installation
============

SlimerJS runs on any platform on which Firefox or XulRunner is available. XulRunner
is the core of Firefox without its user interface.

Installation of SlimerJS
------------------------

.. index::  linux, package

To install SlimerJS, you need to download its package. Three flavors:

- Install **the linux package** from the package system of your linux distribution.
  It will install automatically all needed packages (like XulRunner or Firefox). It
  seems that only Arch Linux provides a package of SlimerJS for the moment. Feel free to
  contribute for your favorite distro!
- Or download the **Standalone Edition** of SlimerJS: this is a zip/gz package containing
  SlimerJS and XulRunner. There is a package for each operating system.
- Or download the **Lightweight Edition** of SlimerJS: this is a zip package containing
  only SlimerJS and for all operating system. You have to install Firefox or XulRunner
  separately and probably you'll need to set an environment variable. This is the
  prefered way to save network band width or to use different versions of Gecko.

From Arch Linux
~~~~~~~~~~~~~~~

A `package is available for Arch Linux <https://aur.archlinux.org/packages/slimerjs/>`_,
thanks to a contributor. So if you use Arch Linux just type in a terminal:

.. code-block:: bash

    yaourt slimerjs

It will install all needed packages. You're ready to use SlimerJS. You can jump to the
:ref:`Lauching SlimerJS <launch>` section.


The **Standalone Edition**
~~~~~~~~~~~~~~~~~~~~~~~~~~

Download the zip or the gz package of SlimerJS `from the web site <http://slimerjs.org/download.html>`_
and extract files into a directory somewhere on your disk. You'll have a ``slimerjs/`` directory
with some files. *Everything is here*. You're ready to use SlimerJS. Go to the :ref:`Lauching SlimerJS <launch>` section.


The **Lightweight Edition**
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Download the zip package of SlimerJS `from the web site <http://slimerjs.org/download.html>`_
and extract files into a directory somewhere on your disk. You'll have a ``slimerjs/`` directory
with some files.

.. index:: Firefox, XulRunner

Then you need to install Firefox or XulRunner if it is not already done.

- `Download Firefox <http://getfirefox.com>`_ (version 22 or higher)
- or `Download Xulrunner <http://ftp.mozilla.org/pub/mozilla.org/xulrunner/releases/22.0/runtimes/>`_ (version 22 or higher)
  XulRunner is lighter than Firefox although it contains *exactely* the same web engine as Firefox.

To finish the installation, you probably should read the following section before
launching SlimerJS.


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

.. _launch:

Launching SlimerJS
------------------

From a command line, call the `slimerjs` executable (or ``slimerjs.bat`` for Windows)
with the path of a javascript file.

.. code-block:: bash

    /somewhere/slimerjs-1.2.3/slimerjs myscript.js

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
