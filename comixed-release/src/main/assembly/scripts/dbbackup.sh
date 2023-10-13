#!/usr/bin/env bash
#
# ComiXed - A digital comic book library management application.
# Copyright (C) 2021, The ComiXed Project
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
  [[ $1 == /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

ME=$(realpath "$0")
BINDIR=$(dirname "${ME}")
LIBDIR=$(readlink -f "${BINDIR}"/../lib)

JAVA=$(which java)
JAROPTIONS=""
JVMOPTIONS=""
DATABASE="~/.comixed/comixed"
DBUSER="sa"
DBPWRD=""

function usage() {
  local message="$1"

  echo "Usage: dbbackup.sh -d [DATABASE] -j [URL] [OPTIONS]"
  if [[ ! -z ${message} ]]; then
    echo ""
    echo "${message}"
  fi

  echo ""
  echo "OPTIONS:"
  echo " -d [DATABASE] - Database type (def. ~/.comixed/comixed)"
  echo " -u [USERNAME] - Set the database username"
  echo " -p [PASSWORD] - Set the database password"
  echo ""
  echo "Other options:"
  echo " -h            - Show help (this text)"
  echo ""
  exit 0
}

while getopts "d:u:p:" option; do
  case ${option} in
  d) DATABASE="${OPTARG}" ;;
  u) DBUSER="${OPTARG}" ;;
  p) DBPWRD="${OPTARG}" ;;
  \?) usage ;;
  esac
done

OPTIONS=""
if [[ ! -z "${DBUSER}" ]]; then OPTIONS="${OPTIONS} -user ${DBUSER}"; fi
if [[ ! -z "${DBPWRD}" ]]; then OPTIONS="${OPTIONS} -password ${DBPWRD}"; fi

java -cp $LIBDIR/h2*jar org.h2.tools.Script -url jdbc:h2:file:${DATABASE} ${OPTIONS} -script comixed-backup-2.0.0-0.dev.zip -options compression zip

exit 0
