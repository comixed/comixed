/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

export const QUERY_PARAM_TAB = 'tab';

export const UNKNOWN_VALUE_PLACEHOLDER = 'UNKNOWN';

export const PUBLISHERS_GROUP = 'publishers';
export const SERIES_GROUP = 'series';
export const CHARACTERS_GROUP = 'characters';
export const TEAMS_GROUP = 'teams';
export const LOCATIONS_GROUP = 'locations';
export const STORIES_GROUP = 'stories';

export const MISSING_COMIC_IMAGE_URL = '/assets/img/missing-comic-file.png';
export const GET_COMIC_COVER_URL = `${API_ROOT_URL}/comics/\${id}/cover/content`;
export const GET_PAGE_CONTENT_URL = `${API_ROOT_URL}/pages/\${id}/content`;
export const SET_BLOCKED_PAGE_HASH_URL = `${API_ROOT_URL}/pages/blocked`;
export const CLEAR_BLOCKED_PAGE_HASH_URL = `${API_ROOT_URL}/pages/blocked/\${hash}`;

export const LOAD_COMIC_FILES_URL = `${API_ROOT_URL}/files/contents`;

export const SEND_COMIC_FILES_URL = `${API_ROOT_URL}/files/import`;

export const LOAD_COMIC_URL = `${API_ROOT_URL}/comics/\${id}`;
export const LOAD_SCRAPING_VOLUMES_URL = `${API_ROOT_URL}/scraping/volumes`;
export const LOAD_SCRAPING_ISSUE_URL = `${API_ROOT_URL}/scraping/volumes/\${volumeId}/issues/\${issueNumber}`;

export const SCRAPE_COMIC_URL = `${API_ROOT_URL}/scraping/comics/\${comicId}`;

export const SET_READ_STATE_URL = `${API_ROOT_URL}/library/read`;

// import options
export const IMPORT_ROOT_DIRECTORY_PREFERENCE =
  'preference.import.root-directory';
export const IMPORT_ROOT_DIRECTORY_DEFAULT = '';
export const IMPORT_MAXIMUM_RESULTS_PREFERENCE =
  'preference.import.maximum-results';
export const IMPORT_MAXIMUM_RESULTS_DEFAULT = 0;
export const IGNORE_METADATA_PREFERENCE = 'preference.import.ignore-metadata';
export const IGNORE_METADATA_DEFAULT = `${false}`;
export const DELETE_BLOCKED_PAGES_PREFERENCE =
  'preference.import.delete-blocked-pages';
export const DELETE_BLOCKED_PAGES_DEFAULT = `${false}`;
export const API_KEY_PREFERENCE = 'preference.scraping.api-key';
export const SKIP_CACHE_PREFERENCE = 'preference.scraping.skip-cache';
export const MAXIMUM_RECORDS_PREFERENCE = 'preference.scraping.maximum-records';

// display options
export const PAGE_SIZE_PREFERENCE = 'preference.page-size';
export const PAGE_SIZE_DEFAULT = 400;
export const PAGINATION_OPTIONS = [10, 25, 50, 100];
export const PAGINATION_PREFERENCE = 'preference.pagination';
export const PAGINATION_DEFAULT = PAGINATION_OPTIONS[0];
