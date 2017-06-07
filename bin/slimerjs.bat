
@echo off
REM %~dp0 is the absolute path to this bat file, always.
REM %* is every argument passed to this script. I removed
REM the quotes around this pseudo variable which may or may
REM not be right for this application.
SET SLIMERJSLAUNCHER=%~dp0../xulrunner/xulrunner.exe
SET SCRIPTDIR=%~dp0
REM setting stdout from running listVars.js through js.exe
REM (included with xulrunner, but not Firefox). 
FOR /F "tokens=*" %%i in ('"%SCRIPTDIR%../xulrunner/js.exe" -f listVars.js') do (
	SET LISTVAR=%%i
)

Start "Starting XUL Runner app" "%SLIMERJSLAUNCHER%" -app %SCRIPTDIR%../src/application.ini -console -purgecaches --envs "%LISTVAR%" %*
