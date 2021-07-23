[Setup]
AppName=ComiXed
AppVersion=0.9.0-2.2
AppPublisher=The ComiXed Project
AppPublisherURL=http://www.comixedproject.org/
AppCopyright=Copyright (C) 2017, The ComiXedProject
DefaultDirName={autopf}\ComiXed
DefaultGroupName=ComiXed
WizardStyle=modern
Compression=lzma2
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64
LicenseFile=..\..\..\comixed-release-0.9.0-2.2\LICENSE
OutputDir=..\..\..\target\
OutputBaseFilename=comixed-0.9.0-2.2

[Files]
Source: "..\..\..\comixed-release-0.9.0-2.2\bin\run.bat"; DestDir: "{app}\bin"
Source: "..\..\..\comixed-release-0.9.0-2.2\bin\comixed-app-0.9.0-2.2.jar"; DestDir: "{app}\bin"

[Icons]
Name: "{group}\ComiXed"; Filename: "{app}\bin\run.bat"
