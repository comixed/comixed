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
import { FilenameScrapingRule } from '@app/admin/models/filename-scraping-rule';

export const FILENAME_SCRAPING_RULE_TEMPLATE: FilenameScrapingRule = {
  id: null,
  priority: null,
  name: 'New Rule',
  rule: '',
  seriesPosition: null,
  volumePosition: null,
  issueNumberPosition: null,
  coverDatePosition: null,
  dateFormat: ''
};

export const COMICVINE_API_KEY = 'comicvine.api-key';
export const LIBRARY_ROOT_DIRECTORY = 'library.root-directory';
export const LIBRARY_COMIC_RENAMING_RULE = 'library.comic-book.renaming-rule';
export const LIBRARY_NO_RECREATE_COMICS = 'library.comic-book.no-recreate';
export const LIBRARY_PAGE_RENAMING_RULE = 'library.comic-page.renaming-rule';
export const LIBRARY_DELETE_EMPTY_DIRECTORIES =
  'library.directories.delete-empty';
export const LIBRARY_DELETE_PURGED_COMIC_FILES =
  'library.comic-book.delete-purged-comic-files';
export const LIBRARY_DONT_MOVE_UNSCRAPED_COMICS =
  'library.comic-book.dont-move-unscraped';
export const CREATE_EXTERNAL_METADATA_FILES =
  'library.metadata.create-external-files';
export const SKIP_INTERNAL_METADATA_FILES =
  'library.metadata.no-comicinfo-entry';
export const METADATA_IGNORE_EMPTY_VALUES =
  'library.metadata.ignore-empty-values';
export const METADATA_CACHE_EXPIRATION_DAYS =
  'library.metadata.cache-expiration-days';
export const METADATA_SCRAPING_ERROR_THRESHOLD =
  'library.metadata.scraping-error-threshold';
export const BLOCKED_PAGES_ENABLED = 'library.blocked-pages-enabled';
export const LIBRARY_STRIP_HTML_FROM_METADATA =
  'library.strip-html-from-metadata';

export const LOAD_CONFIGURATION_OPTIONS_URL = `${API_ROOT_URL}/admin/config`;
export const SAVE_CONFIGURATION_OPTIONS_URL = `${API_ROOT_URL}/admin/config`;
export const LOAD_FILENAME_SCRAPING_RULES_URL = `${API_ROOT_URL}/admin/scraping/rules`;
export const SAVE_FILENAME_SCRAPING_RULES_URL = `${API_ROOT_URL}/admin/scraping/rules`;
export const DOWNLOAD_FILENAME_SCRAPING_RULES_FILE_URL = `${API_ROOT_URL}/admin/scraping/rules/file`;
export const UPLOAD_FILENAME_SCRAPING_RULES_URL = `${API_ROOT_URL}/admin/scraping/rules/file`;
export const GET_ALL_BATCH_PROCESSES_URL = `${API_ROOT_URL}/admin/processes`;
export const DELETE_COMPLETED_JOBS_URL = `${API_ROOT_URL}/admin/processes/completed/delete`;
export const DELETE_SELECTED_JOBS_URL = `${API_ROOT_URL}/admin/processes/selected/delete`;

export const GET_FEATURE_ENABLED_URL = `${API_ROOT_URL}/admin/config/\${name}/enabled`;

// actuator URLS
export const LOAD_METRIC_LIST_URL = `/actuator/metrics`;
export const LOAD_METRIC_DETAIL_URL = `/actuator/metrics/\${name}`;

export const LOAD_SERVER_HEALTH_URL = `/actuator/health`;
export const SHUTDOWN_SERVER_URL = `/actuator/shutdown`;

// batch processes
export const BATCH_PROCESS_LIST_UPDATE_TOPIC =
  '/topic/batch-process-list.update';
