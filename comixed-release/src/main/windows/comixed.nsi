!define NAME "ComiXed"
!define VERSION "3.0.3"
!define SLUG "${NAME} ${VERSION}"

Name "${NAME}"
OutFile "..\..\..\..\${SLUG} Installer.exe"
DirText "Please select the installation directory for ComiXed"
InstallDir "$PROGRAMFILES\${NAME}"
InstallDirRegKey HKCU "Software\${NAME}" ""
RequestExecutionLevel admin

Section
    CreateDirectory "$SMPROGRAMS\ComiXed"
    CreateShortCut "$SMPROGRAMS\ComiXed\ComiXed Server.lnk" "$INSTDIR\bin\run.bat"
SectionEnd

Section ""

SetOutPath $INSTDIR\bin
File ..\assembly\scripts\run.bat
File ..\assembly\scripts\dbbackup.bat
File ..\assembly\scripts\dbrestore.bat
File ..\assembly\scripts\dbtool.bat
File ..\..\..\..\comixed-app\target\comixed-app-3.0.3.jar
File ..\..\..\target\classes\org\comixedproject\modules\windows_agent_installer\comixed-service.exe
File .\comixed-service.xml

SetOutPath $INSTDIR\lib
File ..\..\..\target\lib\h2*jar

SetOutPath $INSTDIR\doc
File ..\..\..\..\CHANGELOG.md
File ..\..\..\..\CONTRIBUTORS.md
File ..\..\..\..\LICENSE
File ..\..\..\..\QUICKSTART.md
File ..\..\..\..\README.md
File ..\..\..\..\UPGRADING.md

WriteUninstaller $INSTDIR\Uninstall.exe

SectionEnd

;------------------
Section "Uninstall"

SetOutPath $INSTDIR\bin
ExecWait "$INSTDIR\bin\comixed-service.exe stop"
ExecWait "$INSTDIR\bin\comixed-service.exe uninstall"

Delete $INSTDIR\Uninstall.exe

RMDir /r $INSTDIR

DeleteRegKey HKCU "Software\${NAME}"

SectionEnd
