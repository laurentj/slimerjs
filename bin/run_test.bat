@echo off
if ["%~1"]==[""] (
	echo Give the relative path to a test from %~dp0..\test\
	goto :eof
)
SET SLIMERJSLAUNCHER="C:\Users\kastor\Documents\applications\xul\xulrunner\xulrunner.exe"
slimerjs.bat "%~dp0..\test\%~1"
