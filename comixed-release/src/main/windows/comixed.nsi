!define NAME "ComiXed"
!define VERSION "2.0-SNAPSHOT"
!define SLUG "${NAME} ${VERSION}"

Name "${NAME}"
OutFile "..\..\..\..\${SLUG} Installer.exe"
DirText "Please select the target directory for ComiXed"
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
File ..\..\..\..\comixed-app\target\comixed-app-2.0-SNAPSHOT.jar

SetOutPath $INSTDIR\lib
File ..\..\..\target\lib\h2*jar
File ..\..\..\target\comixed-metadata-comicvine*jar

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

Delete $INSTDIR\Uninstall.exe

RMDir /r $INSTDIR

DeleteRegKey HKCU "Software\${NAME}"

SectionEnd
