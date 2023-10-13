@ECHO OFF

REM ComiXed - A digital comic book library management application.
REM Copyright (C) 2019, The ComiXed Project
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

FOR %%f IN (comixed-app*.jar) DO SET COMIXED_JAR_FILE=%%f
FOR %%f IN (..\lib) DO SET LIBDIR=%%f
SET LOGFILE="%COMIXEDLOG%"

:process_command_line
IF "%~1" == "" GOTO end_process_command_line
SET PARAM=%~1
SET ARG=%~2
IF "%PARAM%" == "-h" GOTO show_help
IF "%PARAM%" == "-d" SET DEBUG="ON"
IF "%PARAM%" == "-D" SET FULLDEBUG="ON"
IF "%PARAM%" == "-M" SET METADATADEBUG="ON"
IF "%PARAM%" == "-C" SET DBCONSOLE="ON"
IF "%PARAM%" == "-S" SET ENABLE_SSL="ON"
IF "%PARAM%" == "-j" GOTO set_jdbc_url
IF "%PARAM%" == "-u" GOTO set_jdbc_user
IF "%PARAM%" == "-p" GOTO set_jdbc_pwrd
IF "%PARAM%" == "-i" GOTO set_image_cache_dir
IF "%PARAM%" == "-l" GOTO set_lib_dir
IF "%PARAM%" == "-L" GOTO set_logging_file
IF "%PARAM%" == "-P" GOTO set_plugin_dir
IF "%PARAM%" == "-H" GOTO set_heap_size
IF "%PARAM%" == "-X" GOTO set_debug_option
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

:set_image_cache_dir
SET IMGCACHEDIR=%ARG%
SHIFT
SHIFT
GOTO process_command_line

:set_lib_dir
SET LIBDIR=%ARG%
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

:set_heap_size
SET JVMOPTIONS=%JVMOPTIONS% -Xmx%ARG%m
SHIFT
SHIFT
GOTO process_command_line

:set_debug_option
SET JVMOPTIONS=%JVMOPTIONS% -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=%ARG%
SHIFT
SHIFT
GOTO process_command_line

:show_help
ECHO Usage: run.bat [OPTIONS]
ECHO.
ECHO OPTIONS:
ECHO  -j [URL]      - Set the database URL
ECHO  -u [USERNAME] - Set the database username
ECHO  -p [PASSWORD] - Set the database password
ECHO  -i [DIR]      - Set the image caching directory
ECHO  -l [DIR]      - Set the JAR library directory
ECHO  -P [DIR]      - Set the plugin directory
ECHO  -H [SIZE]     - Set the runtime heap size (in mb)
ECHO  -S            - Enable SSL (def. off)
ECHO.
ECHO OTHER OPTIONS:
ECHO  -d            - Enable debugging (def. off)
ECHO  -D            - Turn on ALL debugging (def. off)
ECHO  -M            - Turn on metadata activity logging (def. false)
ECHO  -C            - Turn on H2 database console"
ECHO  -L [LOGFILE]  - Write logs to a logfile
ECHO  -X [PORT]     - Set the debugger port
ECHO  -h            - Show help (this text)
ECHO.
ECHO ENVIRONMENT VARIABLES:
ECHO  COMIXEDLOG    - The log filename to use
GOTO exit_script

:end_process_command_line

SET JAROPTIONS=

IF "%DEBUG%" == "" GOTO skip_debug
SET JAROPTIONS=%JAROPTIONS% --logging.level.org.comixedproject=DEBUG
:skip_debug

IF "%FULLDEBUG%" == "" GOTO skip_full_debug
SET JAROPTIONS=%JAROPTIONS% --logging.level.root=DEBUG
:skip_full_debug

IF "%METADATADEBUG%" == "" GOTO skip_metadata_debug
SET JAROPTIONS=%JAROPTIONS% --logging.level.org.comixedproject.metadata=DEBUG
:skip_metadata_debug

IF "%DBCONSOLE%" == "" GOTO skip_db_console
SET JAROPTIONS=%JAROPTIONS% --spring.h2.console.enabled=true
:skip_db_console

IF "%LOGFILE%" == "" GOTO :skip_logfile
SET JAROPTIONS=%JAROPTIONS% --logging.file.name=%LOGFILE%
:skip_logfile

IF "%JDBCURL%" == "" GOTO skip_jdbc_url
SET JAROPTIONS=%JAROPTIONS% --spring.datasource.url=%JDBCURL%
:skip_jdbc_url

IF "%DBUSER%" == "" GOTO skip_jdbc_user
SET JAROPTIONS=%JAROPTIONS% --spring.datasource.username=%DBUSER%
:skip_jdbc_user

IF "%DBPWRD%" == "" GOTO skip_jdbc_pwrd
SET JAROPTIONS=%JAROPTIONS% --spring.datasource.password=%DBPWRD%
:skip_jdbc_pwrd

IF "%IMGCACHEDIR%" == "" GOTO skip_image_cache_dir
SET JAROPTIONS=%JAROPTIONS% --comixed.images.cache.location=%IMGCACHEDIR%
:skip_image_cache_dir

IF "%PLUGINDIR" == "" GOTO skip_plugin_dir
SET JAROPTIONS=%JAROPTIONS% --comixed.plugins.location=%PLUGINDIR%
:skip_plugin_dir

IF "%ENABLE_SSL%" == "" GOTO skip_enable_ssl
SET JAROPTIONS=%JAROPTIONS% --server.ssl.enabled=true
:skip_enable_ssl

IF "%LIBDIR%" == "" GOTO skip_lib_dir
SET LOADER_PATH=-Dloader.path=%LIBDIR%
SET COMIXED_JAR_FILE=-jar %COMIXED_JAR_FILE%
:skip_lib_dir

java %JVMOPTIONS% %LOADER_PATH% %COMIXED_JAR_FILE% %JAROPTIONS%

:exit_script
ENDLOCAL
