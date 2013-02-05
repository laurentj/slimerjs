@echo off
SET SLIMERJSLAUNCHER=%SLIMERJSLAUNCHER%
if ["%SLIMERJSLAUNCHER%"]==[""] (
    echo SLIMERJSLAUNCHER environment variable is missing. Set it with the path to Firefox
    pause
    exit 1
)
REM %~dp0 is the absolute path to this bat file, always.
REM %* is every argument passed to this script. I removed
REM the quotes around this pseudo variable which may or may
REM not be right for this application.
SET SCRIPTDIR=%~dp0
SET LISTVAR=
SETLOCAL EnableDelayedExpansion
FOR /F "usebackq delims==" %%i IN (`set`) DO set LISTVAR=!LISTVAR!,%%i

Start "Starting XUL Runner app" %SLIMERJSLAUNCHER% -app "%SCRIPTDIR%../src/application.ini" -console -purgecaches -envs "%LISTVAR%" %*
ENDLOCAL
