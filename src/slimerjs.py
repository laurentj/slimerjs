#!/usr/bin/env python

import os
import sys
import tempfile
import shutil
import string
import subprocess

def resolve(path):
    if os.path.islink(path):
        path = os.path.join(os.path.dirname(path), os.readlink(path))
        return resolve(path)
    return path

def is_exe(fpath):
    return os.path.isfile(fpath) and os.access(fpath, os.X_OK)

def which(program):
    fpath, fname = os.path.split(program)
    if fpath:
        if is_exe(program):
            return program
    else:
        for path in os.environ["PATH"].split(os.pathsep):
            path = path.strip('"')
            exe_file = os.path.join(path, program)
            if is_exe(exe_file):
                return exe_file
    return None

# retrieve full path of the current script
# symlinks are resolved, so application.ini could be found
SLIMERJS_PATH = os.path.abspath(os.path.dirname(resolve(__file__)))
SYS_ARGS = sys.argv[1:]

SLIMERJSLAUNCHER = os.environ.get("SLIMERJSLAUNCHER", "");

if SLIMERJSLAUNCHER == "":
    POSSIBLE_PATH = []

    if sys.platform == "linux" or sys.platform == "linux2" or sys.platform == "darwin":
        path = which('firefox')
        if path != None:
            POSSIBLE_PATH.append(path)
    elif sys.platform == "win32":
        path = which('firefox.exe')
        if path != None:
            POSSIBLE_PATH.append(path)
        POSSIBLE_PATH.append(os.path.join(os.environ.get('programfiles'), "Mozilla Firefox", "firefox.exe"))
        POSSIBLE_PATH.append("%s (x86)" % os.path.join(os.environ.get('programfiles'), "Mozilla Firefox", "firefox.exe"))

    for path in POSSIBLE_PATH:
        if is_exe(path):
            SLIMERJSLAUNCHER = path
            break
    if SLIMERJSLAUNCHER == "":
        print('SLIMERJSLAUNCHER environment variable is missing and I don\'t find Firefox')
        print('Set SLIMERJSLAUNCHER with the path to Firefox')
        sys.exit(1)
else:
    if not os.path.exists(SLIMERJSLAUNCHER):
        print("SLIMERJSLAUNCHER environment variable does not contain an executable path: %s. Set it with the path to Firefox" % SLIMERJSLAUNCHER)
        sys.exit(1)

def showHelp():
    print("  In following values, <bool> can be yes, no, true or false")
    print("")
    print("  --config=<file>                    Load the given configuration file")
    print("                                     (JSON formated)")
    print("  --debug=<bool>                     Prints additional warning and debug message")
    print("                                     (default is no)")
    print("  --disk-cache=<bool>                Enables disk cache (default is no).")
    print("  --help or -h                       Show this help")
    #print("  --ignore-ssl-errors=<bool>         Ignores SSL errors (default is no).")
    print("  --load-images=<bool>               Loads all inlined images (default is yes)")
    print("  --local-storage-quota=<number>     Sets the maximum size of the offline")
    print("                                     local storage (in KB)")
    #print("  --local-to-remote-url-access=<bool>   Allows local content to access remote")
    #print("                                        URL (default is no)")
    print("  --max-disk-cache-size=<number>     Limits the size of the disk cache (in KB)")
    #print("  --remote-debugger-port=<number>    Starts the script in a debug harness and")
    #print("                                     listens on the specified port")
    #print("  --remote-debugger-autorun=<bool>   Runs the script in the debugger immediately")
    #print("                                     (default is no)")
    print("  --output-encoding=<enc>            Sets the encoding for the terminal output")
    print("                                     (default is 'utf8')")
    print("  --proxy=<proxy url>                Sets the proxy server")
    print("  --proxy-auth=<username:password>   Provides authentication information for the")
    print("                                     proxy")
    print("  --proxy-type=[http|socks5|none|auto|system|config-url]    Specifies the proxy type (default is http)")
    print("  --ssl-protocol=[SSLv3|TLSv1|TLSv1.0|TLSv1.1|TLSv1.2|TLS|any]   Indicates the ssl protocol to use.")
    #print("  --web-security=<bool>              Enables web security (default is yes)")
    print("  --version or v                     Prints out SlimerJS version")
    print("  --webdriver or --wd or -w          Starts in 'Remote WebDriver mode' (embedded")
    print("                                     GhostDriver) '127.0.0.1:8910'")
    print("  --webdriver=[<IP>:]<PORT>          Starts in 'Remote WebDriver mode' in the")
    print("                                     specified network interface")
    print("  --webdriver-logfile=<file>         File where to write the WebDriver's Log ")
    print("                                     (default 'none') (NOTE: needs '--webdriver')")
    print("  --webdriver-loglevel=[ERROR|WARN|INFO|DEBUG] WebDriver Logging Level ")
    print("                                 (default is 'INFO') (NOTE: needs '--webdriver')")
    print("  --webdriver-selenium-grid-hub=<url> URL to the Selenium Grid HUB (default is")
    print("                                      'none') (NOTE: needs '--webdriver') ")
    print("  --error-log-file=<file>            Log all javascript errors in a file")
    print("  -jsconsole                         Open a window to view all javascript errors")
    print("                                       during the execution")
    print("")
    print("*** About profiles: see details of these Mozilla options at")
    print("https://developer.mozilla.org/en-US/docs/Mozilla/Command_Line_Options#User_Profile")
    print("")
    print("  --createprofile name               Create a new profile and exit")
    print("  -P name                            Use the specified profile to execute the script")
    print("  -profile path                      Use the profile stored in the specified")
    print("                                     directory, to execute the script")
    print("By default, SlimerJS use a temporary profile")
    print("")


# retrieve list of existing environment variable,
#because Mozilla doesn't provide an API to get this
# list
LISTVAR=""
for env in os.environ.data:
    LISTVAR = "%s,%s" % (LISTVAR, env)

# check arguments.
HIDE_ERRORS=True
CREATE_TEMP=True
NO_TEMP_PROFILE_OPTIONS = [
    "-reset-profile","-profile","-p","-createprofile","-profilemanager",
    "--reset-profile","--profile","--p","--createprofile","--profilemanager",
]
for arg in SYS_ARGS:
    if arg == '--help' or arg == "-h":
        showHelp()
        sys.exit(0)

    # If profile parameters, don't create a temporary profile
    if arg.lower() in NO_TEMP_PROFILE_OPTIONS:
        CREATE_TEMP=False

    if arg == '--debug=true' or (arg.startswith('--debug=') and arg.find("errors") != -1):
        HIDE_ERRORS=False

PROFILE=[]
PROFILE_DIR=""
if CREATE_TEMP:
    PROFILE_DIR = tempfile.mkdtemp('', 'slimerjs.')
    PROFILE=['--profile', PROFILE_DIR]
else:
    PROFILE=["-purgecaches"]


# put all arguments in a variable, to have original arguments before their transformation
# by Mozilla
os.environ.data['__SLIMER_ENV'] = LISTVAR
os.environ.data['__SLIMER_ARGS'] = string.join(SYS_ARGS,' ')

# launch slimerjs with firefox
SLCMD = [ SLIMERJSLAUNCHER ]
SLCMD.extend(["-app", os.path.join(SLIMERJS_PATH, "application.ini"), "-no-remote"])
if sys.platform == "win32":
    SLCMD.extend(["-attach-console"])
SLCMD.extend(PROFILE)
SLCMD.extend(SYS_ARGS)

exitCode = 0
try:
    if HIDE_ERRORS:
        try:
            from subprocess import DEVNULL # py3k
        except ImportError:
            DEVNULL = open(os.devnull, 'wb')

        exitCode = subprocess.call(SLCMD, stderr=DEVNULL)
    else:
        exitCode = subprocess.call(SLCMD)

except OSError as err:
    print('Fatal: %s. Are you sure %s exists?' % (err, SLIMERJSLAUNCHER))
    sys.exit(1)

if exitCode == 0:
    exitFile = PROFILE_DIR + '/exitstatus'
    if os.path.isfile(exitFile):
        with open(exitFile, 'r') as f:
            exitCode = int(f.read())
else:
    if exitCode == 1:
        print('Gecko error: it seems %s is not compatible with SlimerJS. See Gecko version compatibility.' % (SLIMERJSLAUNCHER))

if CREATE_TEMP:
    shutil.rmtree(PROFILE_DIR)
    
sys.exit(exitCode)
