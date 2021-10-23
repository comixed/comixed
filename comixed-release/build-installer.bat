@echo off

jar xvf ..\release\comixed-release-0.10.4-1.0-local.zip
"c:\Program Files (x86)\Inno Setup 6\ISCC.exe" src\main\windows\installer.iss
