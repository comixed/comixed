@echo off

jar xvf ..\release\comixed-release-0.9.0-3.1-local.zip
"c:\Program Files (x86)\Inno Setup 6\ISCC.exe" src\main\windows\installer.iss
