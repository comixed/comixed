[Setup]
AppName=ComiXed
AppVersion=0.9.0-3.0
AppPublisher=The ComiXed Project
AppPublisherURL=http://www.comixedproject.org/
AppCopyright=Copyright (C) 2017, The ComiXedProject
DefaultDirName={autopf}\ComiXed
DefaultGroupName=ComiXed
WizardStyle=modern
Compression=lzma2
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64
LicenseFile=..\..\..\comixed-release-0.9.0-3.0\LICENSE
OutputDir=..\..\..\target\
OutputBaseFilename=comixed-0.9.0-3.0

[Files]
Source: "..\..\..\comixed-release-0.9.0-3.0\bin\run.bat"; DestDir: "{app}\bin"
Source: "..\..\..\comixed-release-0.9.0-3.0\bin\comixed-app-0.9.0-3.0.jar"; DestDir: "{app}\bin"

[Icons]
Name: "{group}\ComiXed"; Filename: "{app}\bin\run.bat"
