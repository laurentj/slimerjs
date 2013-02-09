
@echo off

SET SLIMERJSLAUNCHER=%SLIMERJSLAUNCHER%

REM % ~ d[rive] p[ath] 0[script name] is the absolute path to this bat file, without quotes, always.
REM ~ strips quotes from the argument
SET SCRIPTDIR=%~dp0
REM %* is every argument passed to this script.
SET ARGS=%*
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

if [%SLIMERJSLAUNCHER%]==[] (
    SET SLIMERJSLAUNCHER=""
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

%SLIMERJSLAUNCHER% -app "%SCRIPTDIR%../src/application.ini" -purgecaches -envs "%LISTVAR%" %ARGS% >%TMPFILE% 2>&1

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
    echo   --cookies-file=^<file^>                 specifies the file name to store
    echo                                         the persistent Cookies
    echo   --disk-cache=[yes^|no]                 enables disk cache (default is no)
    echo   --help or -h                          show this help
    echo   --ignore-ssl-errors=[yes^|no]          ignores SSL errors (default is no)
    echo   --load-images=[yes^|no]                load all inlined images (default is yes)
    echo   --local-to-remote-url-access=[yes^|no] allows local content to 
    echo                                         access remote URL (default is no)
    echo   --max-disk-cache-size=size            limits the size of disk cache (in KB)
    echo   --output-encoding=encoding            sets the encoding used for terminal
    echo                                         output (default is utf8)
    echo   --proxy=address:port                  specifies the proxy server to use
    echo                                         (e.g. --proxy=192.168.1.42:8080)
    echo   --proxy-type=[http^|socks5^|none]       specifies the type of the proxy
    echo                                         server (default is http)
    echo   --script-encoding=encoding            sets the encoding used for the
    echo                                         starting script (default is utf8)
    echo   --version or -v                       prints out the version of SlimerJS
    echo                                         Halts immediately
    echo   --web-security=[yes^|no]               enables web security and forbids
    echo                                         cross-domain XHR (default is yes)
    echo   --config=^<filename^>                   load the given configuration file
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