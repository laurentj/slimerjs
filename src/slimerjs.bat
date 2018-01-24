@echo off
SETLOCAL EnableDelayedExpansion
REM % ~ d[rive] p[ath] 0[script name] is the absolute path to this bat file, without quotes, always.
REM ~ strips quotes from the argument
IF NOT EXIST "%SLIMERDIR%" (
    SET SLIMERDIR=%~dp0
)
REM %* is every argument passed to this script.
SET __SLIMER_ARGS=%*
SET __SLIMER_ENV=
SET __SLIMER_EXITCODEFILE=%Temp%\slimerjs-exit-!Random!!Random!!Random!-!TIME:~6,2!-!TIME:~9,2!
SET EXITCODE=0

SET CREATETEMP=Y
SET HIDE_ERRORS=Y

REM check arguments
FOR %%A IN (%*) DO (

    if ["%%A"]==["/?"] (
        call :helpMessage
        goto :eof
    )
    if /I ["%%A"]==["--help"] (
        call :helpMessage
        goto :eof
    )
    if /I ["%%A"]==["-h"] (
        call :helpMessage
        goto :eof
    )
    if /I ["%%A"]==["/h"] (
        call :helpMessage
        goto :eof
    )
    if /I ["%%A"]==["-reset-profile"] (
        SET CREATETEMP=
    )
    if /I ["%%A"]==["-profile"] (
        SET CREATETEMP=
    )
    if /I ["%%A"]==["-p"] (
        SET CREATETEMP=
    )
    if /I ["%%A"]==["-createprofile"] (
        SET CREATETEMP=
    )
    if /I ["%%A"]==["-profilemanager"] (
        SET CREATETEMP=
    )
    if /I ["%%A"]==["--reset-profile"] (
        SET CREATETEMP=
    )
    if /I ["%%A"]==["--profile"] (
        SET CREATETEMP=
    )
    if /I ["%%A"]==["--p"] (
        SET CREATETEMP=
    )
    if /I ["%%A"]==["--createprofile"] (
        SET CREATETEMP=
    )
    if /I ["%%A"]==["--profilemanager"] (
        SET CREATETEMP=
    )
    if /I ["%%A"]==["/debug"] (
        SET HIDE_ERRORS=
    )
    if /I ["%%A"]==["--debug=yes"] (
        SET HIDE_ERRORS=
    )
    if /I ["%%A"]==["--debug"] (
        SET HIDE_ERRORS=
    )
    if /I ["%%A"]==["--debug=true"] (
        SET HIDE_ERRORS=
    )
)

if not exist "%SLIMERJSLAUNCHER%" (
    call :findFirefox
)
if not exist "%SLIMERJSLAUNCHER%" (
    echo SLIMERJSLAUNCHER environment variable is missing or the path is invalid.
    echo Set it with the path to Firefox.
    echo "The current value of SLIMERJSLAUNCHER is: %SLIMERJSLAUNCHER%"
    REM %% escapes the percent sign so it displays literally
    echo SET "SLIMERJSLAUNCHER=%%programfiles%%\Mozilla Firefox\firefox.exe"
    pause
    exit /B 1
)



REM store environment variable into __SLIMER_ENV for SlimerJS
FOR /F "usebackq delims==" %%i IN (`set`) DO set __SLIMER_ENV=!__SLIMER_ENV!,%%i

REM let's create a temporary dir for the profile, if needed
if ["%CREATETEMP%"]==[""] (
   SET PROFILEDIR=
   SET PROFILE=-purgecaches
   goto callexec
)
:createdirname
SET PROFILEDIR=%Temp%\slimerjs-!Random!!Random!!Random!-!TIME:~6,2!-!TIME:~9,2!
IF EXIST "%PROFILEDIR%" (
    GOTO createdirname
)
mkdir %PROFILEDIR%

SET PROFILE=-profile %PROFILEDIR%

:callexec
if ["%HIDE_ERRORS%"]==[""] (
    "%SLIMERJSLAUNCHER%" -app "%SLIMERDIR%application.ini" %PROFILE% -attach-console -no-remote %__SLIMER_ARGS%
) ELSE (
    "%SLIMERJSLAUNCHER%" -app "%SLIMERDIR%application.ini" %PROFILE% -attach-console -no-remote %__SLIMER_ARGS% 2>NUL
)

if ["%CREATETEMP%"]==["Y"] (
     rmdir /S /Q %PROFILEDIR%
)

IF EXIST "%__SLIMER_EXITCODEFILE%" (
    set /p EXITCODE=< "%__SLIMER_EXITCODEFILE%"
    del /F "%__SLIMER_EXITCODEFILE%"
)
EXIT /B %EXITCODE%

ENDLOCAL

goto :eof


:helpMessage
REM in echo statements the escape character is ^
REM escape < > | and &
REM the character % is escaped by doubling it to %%
REM if delayed variable expansion is turned on then the character ! needs to be escaped as ^^!
    echo   In following values, ^<bool^> can be yes, no, true or false"
    echo.
	echo   Available options are:
	echo.
    echo   --config=^<filename^>                Load the given configuration file
    echo                                      (JSON formated)
    echo   --debug=^<bool^>                   Prints additional warning and debug message
    echo                                      (default is no)
    echo   --disk-cache=^<bool^>              Enables disk cache (default is no).
    echo   --help or -h                       Show this help
REM    echo   --ignore-ssl-errors=^<bool^>       Ignores SSL errors (default is no).
    echo   --load-images=^<bool^>             Loads all inlined images (default is yes)
    echo   --local-storage-quota=^<number^>   Sets the maximum size of the offline
    echo                                      local storage (in KB)
REM    echo   --local-to-remote-url-access=[yes^|no] Allows local content to access remote
REM    echo                                         URL (default is no)
    echo   --max-disk-cache-size=^<number^>     Limits the size of the disk cache (in KB)
REM    echo   --remote-debugger-port=^<number^>    Starts the script in a debug harness and
REM    echo                                      listens on the specified port
REM    echo   --remote-debugger-autorun=^<bool^> Runs the script in the debugger immediately
REM    echo                                      (default is no)
    echo   --output-encoding=^<enc^>            Sets the encoding for the terminal output
    echo                                      (default is 'utf8')
    echo   --proxy=^<proxy url^>                Sets the proxy server
    echo   --proxy-auth=^<username:password^>   Provides authentication information for the
    echo                                      proxy
    echo   --proxy-type=[http^|socks5^|none^|auto^|system^|config-url]    Specifies the proxy type (default is http)
REM    echo   --web-security=^<bool^>            Enables web security (default is yes)
    echo   --ssl-protocol=^<version^>         Indicates the ssl protocol to use. SSLv3, TLSv1, TLSv1.0, TLSv1.1, TLSv1.2, TLS, any
    echo   --version or v                     Prints out SlimerJS version
    echo   --webdriver or --wd or -w          Starts in 'Remote WebDriver mode' (embedded
    echo                                      GhostDriver) '127.0.0.1:8910'
    echo   --webdriver=[^<IP^>:]^<PORT^>          Starts in 'Remote WebDriver mode' in the
    echo                                      specified network interface
    echo   --webdriver-logfile=^<file^>         File where to write the WebDriver's Log
    echo                                      (default 'none') (NOTE: needs '--webdriver')
    echo   --webdriver-loglevel=[ERROR^|WARN^|INFO^|DEBUG^|] WebDriver Logging Level
    echo                                  (default is 'INFO') (NOTE: needs '--webdriver')
    echo   --webdriver-selenium-grid-hub=^<url^> URL to the Selenium Grid HUB (default is
    echo                                       'none') (NOTE: needs '--webdriver')
    echo   --error-log-file=<file>            Log all javascript errors in a file
    echo   -jsconsole                         Open a window to view all javascript errors
    echo                                        during the execution
    echo.
    echo *** About profiles: see details of these Mozilla options at
    echo https://developer.mozilla.org/en-US/docs/Mozilla/Command_Line_Options#User_Profile
    echo.
    echo   --createprofile name               Create a new profile and exit
    echo   -P name                            Use the specified profile to execute the script
    echo   -profile path                      Use the profile stored in the specified
    echo                                      directory, to execute the script
    echo By default, SlimerJS use a temporary profile
    echo
    echo If an option does not work, try to set the option like that
    echo    -<option> <value>
    echo instead of
    echo    --<option>=<value>
    echo.
goto :eof


:findFirefox
if exist "%programfiles%\Mozilla Firefox\firefox.exe" (
    SET "SLIMERJSLAUNCHER=%programfiles%\Mozilla Firefox\firefox.exe"
)
if exist "%programfiles(x86)%\Mozilla Firefox\firefox.exe" (
    SET "SLIMERJSLAUNCHER=%programfiles(x86)%\Mozilla Firefox\firefox.exe"
)
echo "SLIMERJSLAUNCHER is set to %SLIMERJSLAUNCHER%"
goto :eof
