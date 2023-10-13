!define NAME "ComiXed"
!define VERSION "2.0.0-0.dev"
!define SLUG "${NAME} ${VERSION}"

Name "${NAME}"
OutFile "..\..\..\..\${SLUG} Installer.exe"
DirText "Please select the target directory for ComiXed"
InstallDir "$PROGRAMFILES\${NAME}"
InstallDirRegKey HKCU "Software\${NAME}" ""
RequestExecutionLevel admin

Section ""

SetOutPath $INSTDIR\bin
File ..\assembly\scripts\run.bat
File ..\..\..\..\comixed-app\target\comixed-app-2.0.0-0.dev.jar
File ..\..\..\..\LICENSE
File ..\..\..\..\README.md

WriteUninstaller $INSTDIR\Uninstall.exe

SectionEnd

;------------------
Section "Uninstall"

Delete $INSTDIR\Uninstall.exe

RMDir /r $INSTDIR

DeleteRegKey HKCU "Software\${NAME}"

SectionEnd
