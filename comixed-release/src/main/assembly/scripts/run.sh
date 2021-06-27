#!/usr/bin/env bash
#
# ComiXed - A digital comic book library management application.
# Copyright (C) 2019, The ComiXed Project
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses>

realpath() {
  [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

ME=$(realpath "$0")
BINDIR=$(dirname "${ME}")
LIBDIR=$(realpath "${BINDIR}"/../lib)

JAVA=$(which java)
JAROPTIONS=""
JVMOPTIONS=""
COMIXED_JAR_FILE=$(echo "${BINDIR}"/comixed-app-*.jar)
DEBUG=false
FULL_DEBUG=false
VERBOSE=false
JDBCURL=""
DBUSER=""
DBPWRD=""
IMGCACHEDIR=""
LOGFILE=""
PLUGINDIR=""

usage() {
  echo "Usage: run.sh [OPTIONS]"
  echo ""
  echo "OPTIONS:"
  echo " -j [URL]\t\t- Set the database URL (see -u and -p)"
  echo " -u [USERNAME]\t\t- Set the database username"
  echo " -p [PASSWORD]\t\t- Set the database password"
  echo " -i [DIR]\t\t- Set the image caching directory"
  echo " -l [DIR]\t\t- Set the JAR library directory"
  echo " -P [DIR]\t\t- Set the plugin directory"
  echo ""
  echo "Other options:"
  echo " -d           - Debug mode (def. false)"
  echo " -D           - Turn on ALL debugging (def. false)"
  echo " -v           - Verbose mode (def. false)"
  echo " -L [LOGFILE] - Write logs to a file"
  exit 0
}

while getopts "j:u:p:i:l:P:dDvL:" option; do
  case ${option} in
  j) JDBCURL="${OPTARG}" ;;
  u) DBUSER="${OPTARG}" ;;
  p) DBPWRD="${OPTARG}" ;;
  i) IMGCACHEDIR="${OPTARG}" ;;
  l) LIBDIR="${OPTARG}" ;;
  P) PLUGINDIR="${OPTARG}" ;;
  d) DEBUG=true ;;
  D) FULL_DEBUG=true ;;
  v) VERBOSE=true ;;
  L) LOGFILE="${OPTARG}" ;;
  \?) usage ;;
  esac
done

if $VERBOSE; then
  set -x
fi

if [[ ! -f "${COMIXED_JAR_FILE}" ]]; then
  echo "Missing JAR file"
  exit 1
fi

if $DEBUG; then
  # enable global logging for CX
  JAROPTIONS="${JAROPTIONS} --logging.level.org.comixedproject=DEBUG"
fi

if $FULL_DEBUG; then
  # enable all debugging for all dependencies
  JAROPTIONS="${JAROPTIONS} --logging.level.root=DEBUG"
fi

if [[ $LOGFILE ]]; then
  JAROPTIONS="${JAROPTIONS} --logging.file.name=${LOGFILE}"
fi

if [[ $JDBCURL ]]; then
  JAROPTIONS="${JAROPTIONS} --spring.datasource.url=${JDBCURL}"
fi

if [[ $DBUSER ]]; then
  JAROPTIONS="${JAROPTIONS} --spring.datasource.username=${DBUSER}"
fi

if [[ $DBPWRD ]]; then
  JAROPTIONS="${JAROPTIONS} --spring.datasource.password=${DBPWRD}"
fi

if [[ $IMGCACHEDIR ]]; then
  JAROPTIONS="${JAROPTIONS} --comixed.images.cache.location=${IMGCACHEDIR}"
fi

if [[ $PLUGINDIR ]]; then
  JAROPTIONS="${JAROPTIONS} --comixed.plugins.location=${PLUGINDIR}"
fi

# build a list of JVM arguments

if [[ $LIBDIR ]]; then
  JVMOPTIONS="$JVMOPTIONS -classpath"
  CLASSPATH="${LIBDIR}"
fi

$JAVA ${JVMOPTIONS} "${CLASSPATH}" -jar "${COMIXED_JAR_FILE}" ${JAROPTIONS}
