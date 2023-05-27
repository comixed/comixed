/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { API_ROOT_URL } from '../core';

export const COMICVINE_API_KEY = 'comicvine.api-key';
export const LIBRARY_ROOT_DIRECTORY = 'library.root-directory';
export const LIBRARY_COMIC_RENAMING_RULE = 'library.comic-book.renaming-rule';
export const LIBRARY_PAGE_RENAMING_RULE = 'library.comic-page.renaming-rule';
export const LIBRARY_DELETE_EMPTY_DIRECTORIES =
  'library.directories.delete-empty';
export const CREATE_EXTERNAL_METADATA_FILES =
  'library.metadata.create-external-files';
export const SKIP_INTERNAL_METADATA_FILES =
  'library.metadata.no-comicinfo-entry';

export const LOAD_CONFIGURATION_OPTIONS_URL = `${API_ROOT_URL}/admin/config`;
export const SAVE_CONFIGURATION_OPTIONS_URL = `${API_ROOT_URL}/admin/config`;
export const LOAD_FILENAME_SCRAPING_RULES_URL = `${API_ROOT_URL}/admin/scraping/rules`;
export const SAVE_FILENAME_SCRAPING_RULES_URL = `${API_ROOT_URL}/admin/scraping/rules`;

// actuator URLS
export const LOAD_METRIC_LIST_URL = `/actuator/metrics`;
export const LOAD_METRIC_DETAIL_URL = `/actuator/metrics/\${name}`;

export const LOAD_SERVER_HEALTH_URL = `/actuator/health`;
export const SHUTDOWN_SERVER_URL = `/actuator/shutdown`;
