[Setup]
AppName=ComiXed
AppVersion=0.10.0-SNAPSHOT
AppPublisher=The ComiXed Project
AppPublisherURL=http://www.comixedproject.org/
AppCopyright=Copyright (C) 2017, The ComiXedProject
DefaultDirName={autopf}\ComiXed
DefaultGroupName=ComiXed
WizardStyle=modern
Compression=lzma2
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64
LicenseFile=..\..\..\comixed-release-0.10.0-SNAPSHOT\LICENSE
OutputDir=..\..\..\target\
OutputBaseFilename=comixed-0.10.0-SNAPSHOT

[Files]
Source: "..\..\..\comixed-release-0.10.0-SNAPSHOT\bin\run.bat"; DestDir: "{app}\bin"
Source: "..\..\..\comixed-release-0.10.0-SNAPSHOT\bin\comixed-app-0.10.0-SNAPSHOT.jar"; DestDir: "{app}\bin"

[Icons]
Name: "{group}\ComiXed"; Filename: "{app}\bin\run.bat"
