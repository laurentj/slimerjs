Build official packages
-----------------------
SlimerJS can run directly from source code.
Go into the src/ directory and run one of slimer.* script, depending
of your platform. This is a convenient way to develop SlimerJS.

However, distributed packages should be built for releases.

Call the buildpackage.sh script to build these packages. Works only on an
unix system (Linux and probably MacOS)

Experimental
------------
For Windows packages, you can build a slimerjs.exe from the python
slimerjs.py script.

We're using pyinstaller. See [documentation to install it](http://pythonhosted.org/PyInstaller/#installing-in-windows)
After installation:

- run pip-win and give `venv pyi-env-name` as command. A console is opened
- got into the src/ directory of SlimerJS
- then run the command line: `pyinstaller -F -c -n slimerjs slimerjs.py`.  See [options here](http://pythonhosted.org/PyInstaller/#options-for-the-executable-output)
- move the dist/slimerjs.exe file to src/
