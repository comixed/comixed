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

FOR %%f IN (comixed-app*.jar) DO SET JARFILE=%%f

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
IF "%PARAM%" == "-i" GOTO set_image_cache_dir
if "%PARAM%" == "-l" GOTO set_lib_dir
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

:show_help
ECHO Usage: run.bat [OPTIONS]
ECHO.
ECHO OPTIONS:
ECHO  -j [URL]      - Set the database URL
ECHO  -u [USERNAME] - Set the database username
ECHO  -p [PASSWORD] - Set the database password
ECHO  -i [DIR]      - Set the image caching directory
ECHO  -l [DIR]      - Set the JAR library directory
ECHO.
ECHO OTHER OPTIONS:
ECHO  -d            - Enable debugging (def. off)
ECHO  -D            - Turn on ALL debugging (def. off)
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

IF "%JDBCURL%" == "" GOTO skip_jdbc_url
SET OPTIONS=%OPTIONS% --spring.datasource.url=%JDBCURL%
:skip_jdbc_url

IF "%DBUSER%" == "" GOTO skip_jdbc_user
SET OPTIONS=%OPTIONS% --spring.datasource.username=%DBUSER%
:skip_jdbc_user

IF "%DBPWRD%" == "" GOTO skip_jdbc_pwrd
SET OPTIONS=%OPTIONS% --spring.datasource.password=%DBPWRD%
:skip_jdbc_pwrd

IF "%IMGCACHEDIR%" == "" GOTO skip_image_cache_dir
SET OPTIONS=%OPTIONS% --comixed.images.cache.location=%IMGCACHEDIR%
:skip_image_cache_dir

SET JVMOPTIONS=

IF "%LIBDIR%" == "" GOTO skip_lib_dir
SET JVMOPTIONS=%JVMOPTIONS% -classpath %LIBDIR%
:skip_lib_dir

java %JVMOPTIONS% -jar %JARFILE% %OPTIONS%

:exit_script
ENDLOCAL
