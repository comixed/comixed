@echo off

jar xvf ..\release\comixed-release-2.3.5-local.zip
"c:\Program Files (x86)\Inno Setup 6\ISCC.exe" src\main\windows\installer.iss
