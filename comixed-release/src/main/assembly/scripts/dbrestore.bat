@ECHO OFF

REM ComiXed - A digital comic book library management application.
REM Copyright (C) 2021, The ComiXed Project
REM
REM This program is free software: you can redistribute it and/or modify
REM it under the terms of the GNU General Public License as published by
REM the Free Software Foundation, either version 3 of the License, or
REM (at your option) any later version.
REM
REM This program is distributed in the hope that it will be useful,
REM but WITHOUT ANY WARRANTY; without even the implied warranty of
REM MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
REM GNU General Public License for more details.
REM
REM You should have received a copy of the GNU General Public License
REM along with this program. If not, see <http://www.gnu.org/licenses>

SETLOCAL
CD /d %~dp0

SET DATABASE=~/.comixed/comixed
SET DBUSER=sa

FOR %%f IN (..\lib\h2*jar) DO SET H2_JAR=%%f

:process_command_line
IF "%~1" == "" GOTO end_process_command_line
SET PARAM=%~1
SET ARG=%~2
IF "%PARAM%" == "-h" GOTO show_help
IF "%PARAM%" == "-d" GOTO set_database
IF "%PARAM%" == "-u" GOTO set_jdbc_user
IF "%PARAM%" == "-p" GOTO set_jdbc_pwrd
SET ARGUMENTS="%ARGUMENTS% %PARAM%"
SHIFT
SET BACKUP_FILENAME=%ARG%

IF "%BACKUP_FILENAME%" == "" GOTO show_help

GOTO process_command_line

:set_database
SET DATABASE=%ARG%
SHIFT
SHIFT
GOTO process_command_line

:set_jdbc_user
SET DBUSER=%ARG%
SHIFT
SHIFT
GOTO process_command_line

:set_jdbc_pwrd
SET DBPWRD=%ARG%
SHIFT
SHIFT
GOTO process_command_line

:show_help
ECHO Usage: dbrestore.bat FILENAME -d [DATABASE] -j [URL] [OPTIONS]
ECHO.
ECHO  FILENAME      - The backup filename
ECHO.
ECHO OPTIONS:
ECHO  -d [DATABASE] - The database name (def. ~/.comixed/comixed)
ECHO  -j [URL]      - Set the database URL
ECHO  -u [USERNAME] - Set the database username
ECHO  -p [PASSWORD] - Set the database password
ECHO.
ECHO OTHER OPTIONS:
ECHO  -h            - Show help (this text)
ECHO.
GOTO exit_script

:end_process_command_line

SET OPTIONS=
IF "%DBUSER%" == "" GOTO skip_set_user
SET OPTIONS=%OPTIONS% -user %DBUSER%
:skip_set_user

IF "%DBPWRD%" == "" GOTO skip_set_password
SET OPTIONS=%OPTIONS% -password %DBPWRD%
:skip_set_password

java -cp %H2_JAR% org.h2.tools.RunScript -url jdbc:h2:file:%DATABASE% %OPTIONS% %BACKUP_FILENAME% -options compression zip

:exit_script
ENDLOCAL
