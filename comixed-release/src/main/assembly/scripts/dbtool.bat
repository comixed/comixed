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

FOR %%f IN (comixed-dbtool*.jar) DO SET JARFILE=%%f

:process_command_line
IF "%~1" == "" GOTO end_process_command_line
SET PARAM=%~1
SET ARG=%~2
IF "%PARAM%" == "-h" GOTO show_help
IF "%PARAM%" == "-d" SET DEBUG="ON"
IF "%PARAM%" == "-D" SET FULLDEBUG="ON"
IF "%PARAM%" == "-j" GOTO set_jdbc_url
IF "%PARAM%" == "-u" GOTO set_jdbc_user
IF "%PARAM%" == "-p" GOTO set_jdbc_pwrd
IF "%PARAM%" == "-L" GOTO set_logging_file
IF "%PARAM%" == "-P" GOTO set_plugin_dir
SET ARGUMENTS="%ARGUMENTS% %PARAM%"
SHIFT
GOTO process_command_line

:set_jdbc_url
SET JDBCURL=%ARG%
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

:set_logging_file
SET LOGFILE=%ARG%
SHIFT
SHIFT
GOTO process_command_line

:set_plugin_dir
SET PLUGINDIR=%ARG%
SHIFT
SHIFT
GOTO process_command_line

:show_help
ECHO Usage: dbtool.bat [OPTIONS] COMMAND
ECHO.
ECHO COMMANDS:
ECHO  unlock        - Unlocks the database
ECHO.
ECHO OPTIONS:
ECHO  -j [URL]      - Set the database URL
ECHO  -u [USERNAME] - Set the database username
ECHO  -p [PASSWORD] - Set the database password
ECHO  -P [DIR]      - Set the plugin directory
ECHO.
ECHO OTHER OPTIONS:
ECHO  -d            - Enable debugging (def. off)
ECHO  -D            - Turn on ALL debugging (def. off)
ECHO  -L [LOGFILE]  - Write logs to a logfile
ECHO  -h            - Show help (this text)
GOTO exit_script

:end_process_command_line

SET OPTIONS=

IF "%DEBUG%" == "" GOTO skip_debug
SET OPTIONS=%OPTIONS% --logging.level.org.comixedproject=DEBUG
:skip_debug

IF "%FULLDEBUG%" == "" GOTO skip_full_debug
SET OPTIONS=%OPTIONS% --logging.level.root=DEBUG
:skip_full_debug

IF "%LOGFILE%" == "" GOTO :skip_logfile
SET OPTIONS=%OPTIONS% --logging.file.name=%LOGFILE%
:skip_logfile

IF "%JDBCURL%" == "" GOTO skip_jdbc_url
SET OPTIONS=%OPTIONS% --spring.datasource.url=%JDBCURL%
:skip_jdbc_url

IF "%DBUSER%" == "" GOTO skip_jdbc_user
SET OPTIONS=%OPTIONS% --spring.datasource.username=%DBUSER%
:skip_jdbc_user

IF "%DBPWRD%" == "" GOTO skip_jdbc_pwrd
SET OPTIONS=%OPTIONS% --spring.datasource.password=%DBPWRD%
:skip_jdbc_pwrd

IF "%PLUGINDIR" == "" GOTO skip_plugin_dir
SET OPTIONS=%OPTIONS% --comixed.plugins.location=%PLUGINDIR%
:skip_plugin_dir

SET JVMOPTIONS=

java %JVMOPTIONS% -jar %JARFILE% %OPTIONS% %ARGUMENTS%

:exit_script
ENDLOCAL
