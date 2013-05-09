@echo off

SET SLIMERJSLAUNCHER=%SLIMERJSLAUNCHER%
REM % ~ d[rive] p[ath] 0[script name] is the absolute path to this bat file, without quotes, always.
REM ~ strips quotes from the argument
SET SCRIPTDIR=%~dp0
REM %* is every argument passed to this script.
SET __SLIMER_ARGS=%*
SET LISTVAR=

if ["%~1"]==["/?"] (
    call :helpMessage
    pause
    exit 0
)
if ["%~1"]==["--help"] (
    call :helpMessage
    pause
    exit 0
)
if ["%~1"]==["-h"] (
    call :helpMessage
    pause
    exit 0
)
if not exist %SLIMERJSLAUNCHER% (
    call :findFirefox
)
if not exist %SLIMERJSLAUNCHER% (
    echo SLIMERJSLAUNCHER environment variable is missing or the path is invalid.
    echo Set it with the path to Firefox or xulrunner.
    echo The current value of SLIMERJSLAUNCHER is: %SLIMERJSLAUNCHER%
    REM %% escapes the percent sign so it displays literally
    echo SET SLIMERJSLAUNCHER="%%programfiles%%\Mozilla Firefox\firefox.exe"
    echo SET SLIMERJSLAUNCHER="%%programfiles%%\XULRunner\xulrunner.exe"
    pause
    exit 1
)

SETLOCAL EnableDelayedExpansion
FOR /F "usebackq delims==" %%i IN (`set`) DO set LISTVAR=!LISTVAR!,%%i

REM Firefox console output is done to NUL or something like that.
REM So we have to redirect output to a file and then output this file
REM FIXME: This solution is not optimal, since we cannot see messages at realtime
REM FIXME: an other solution to redirect directly to the console ?
set TMPFILE=%TMP%\slimer-output-%RANDOM%.tmp

%SLIMERJSLAUNCHER% -app "%SCRIPTDIR%application.ini" -purgecaches -no-remote -envs "%LISTVAR%" %__SLIMER_ARGS% >%TMPFILE% 2>&1

TYPE %TMPFILE%
DEL %TMPFILE%
ENDLOCAL

goto :eof


:helpMessage
REM in echo statements the escape character is ^
REM escape < > | and &
REM the character % is escaped by doubling it to %%
REM if delayed variable expansion is turned on then the character ! needs to be escaped as ^^!
	echo   Available options are:
	echo.
REM    echo   --cookies-file=^<file^>              Sets the file name to store the persistent
REM    echo                                      cookies.
REM    echo   --config=^<filename^>                Load the given configuration file
REM    echo                                      (JSON formated)
REM    echo   --debug=[yes^|no]                   Prints additional warning and debug message
REM    echo                                      (default is no)
REM    echo   --disk-cache=[yes^|no]              Enables disk cache (default is no).
    echo   --help or -h                       Show this help
REM    echo   --ignore-ssl-errors=[yes^|no]       Ignores SSL errors (default is no).
REM    echo   --load-images=[yes^|no]             Loads all inlined images (default is yes)
REM    echo   --local-storage-path=^<path^>        Specifies the location for offline local
REM    echo                                      storage
REM    echo   --local-storage-quota=^<number^>     Sets the maximum size of the offline
REM    echo                                      local storage (in KB)
REM    echo   --local-to-remote-url-access=[yes^|no] Allows local content to access remote
REM    echo                                         URL (default is no)
REM    echo   --max-disk-cache-size=^<number^>     Limits the size of the disk cache (in KB)
REM    echo   --output-encoding=^<enc^>            Sets the encoding for the terminal output
REM    echo                                      (default is 'utf8')
REM    echo   --remote-debugger-port=^<number^>    Starts the script in a debug harness and
REM    echo                                      listens on the specified port
REM    echo   --remote-debugger-autorun=[yes^|no] Runs the script in the debugger immediately
REM    echo                                      (default is no)
REM    echo   --proxy=^<proxy url^>                Sets the proxy server
REM    echo   --proxy-auth=^<username:password^>   Provides authentication information for the
REM    echo                                      proxy
REM    echo   --proxy-type=[http^|socks5^|none]    Specifies the proxy type (default is http)
REM    echo   --script-encoding=^<enc^>            Sets the encoding used for the starting
REM    echo                                      script (default is utf8)
REM    echo   --web-security=[yes^|no]            Enables web security (default is yes)
REM    echo   --ssl-protocol=[SSLv3^|SSLv2^|TLSv1^|any]  Sets the SSL protocol
REM    echo   --ssl-certificates-path=^<path^>     Sets the location for custom CA certificates
    echo   --version or v                     Prints out SlimerJS version
REM    echo   --webdriver or --wd or -w          Starts in 'Remote WebDriver mode' (embedded
REM    echo                                      GhostDriver) '127.0.0.1:8910'
REM    echo   --webdriver=[^<IP^>:]^<PORT^>          Starts in 'Remote WebDriver mode' in the
REM    echo                                      specified network interface
REM    echo   --webdriver-logfile=^<file^>         File where to write the WebDriver's Log
REM    echo                                      (default 'none') (NOTE: needs '--webdriver')
REM    echo   --webdriver-loglevel=[ERROR^|WARN^|INFO^|DEBUG^|] WebDriver Logging Level
REM    echo                                  (default is 'INFO') (NOTE: needs '--webdriver')
REM    echo   --webdriver-selenium-grid-hub=^<url^> URL to the Selenium Grid HUB (default is
REM    echo                                       'none') (NOTE: needs '--webdriver')

goto :eof


:findFirefox
if exist "%programfiles%\Mozilla Firefox\firefox.exe" (
    SET SLIMERJSLAUNCHER="%programfiles%\Mozilla Firefox\firefox.exe"
)
if exist "%programfiles% (x86)\Mozilla Firefox\firefox.exe" (
    SET SLIMERJSLAUNCHER="%programfiles% (x86)\Mozilla Firefox\firefox.exe"
)
echo SLIMERJSLAUNCHER is set to %SLIMERJSLAUNCHER%
goto :eof
