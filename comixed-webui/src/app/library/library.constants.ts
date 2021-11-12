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
export const QUERY_PARAM_ARCHIVE_TYPE = 'archive';

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

export const LOAD_COMICS_URL = `${API_ROOT_URL}/library`;

export const LOAD_COMIC_URL = `${API_ROOT_URL}/comics/\${id}`;
export const UPDATE_COMIC_URL = `${API_ROOT_URL}/comics/\${id}`;
export const LOAD_SCRAPING_VOLUMES_URL = `${API_ROOT_URL}/scraping/volumes`;
export const LOAD_SCRAPING_ISSUE_URL = `${API_ROOT_URL}/scraping/volumes/\${volumeId}/issues/\${issueNumber}`;

export const SCRAPE_COMIC_URL = `${API_ROOT_URL}/scraping/comics/\${comicId}`;

export const SET_READ_STATE_URL = `${API_ROOT_URL}/library/read`;

export const LOAD_COMICS_WITH_DUPLICATE_PAGES_URL = `${API_ROOT_URL}/library/pages/duplicates`;
export const LOAD_DUPLICATE_PAGE_DETAIL_URL = `${API_ROOT_URL}/library/pages/duplicates/\${hash}`;

export const START_LIBRARY_CONSOLIDATION_URL = `${API_ROOT_URL}/library/consolidate`;
export const CONVERT_COMICS_URL = `${API_ROOT_URL}/library/convert`;
export const RESCAN_COMICS_URL = `${API_ROOT_URL}/library/rescan`;
export const UPDATE_METADATA_URL = `${API_ROOT_URL}/library/metadata`;
export const PURGE_LIBRARY_URL = `${API_ROOT_URL}/library/purge`;

// import options
export const IMPORT_ROOT_DIRECTORY_PREFERENCE =
  'preference.import.root-directory';
export const IMPORT_ROOT_DIRECTORY_DEFAULT = '';
export const IMPORT_MAXIMUM_RESULTS_PREFERENCE =
  'preference.import.maximum-results';
export const IMPORT_MAXIMUM_RESULTS_DEFAULT = 0;
export const SKIP_CACHE_PREFERENCE = 'preference.scraping.skip-cache';
export const MAXIMUM_RECORDS_PREFERENCE = 'preference.scraping.maximum-records';

// display options
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const PAGE_SIZE_PREFERENCE = 'preference.page-size';
export const PAGE_SIZE_DEFAULT = PAGE_SIZE_OPTIONS[0];
export const SORT_FIELD_PREFERENCE = 'preference.sort-field';
export const SORT_FIELD_DEFAULT = 'added-date';

// messaging
export const COMIC_LIST_UPDATE_TOPIC = '/topic/comic-list.update';
export const COMIC_LIST_REMOVAL_TOPIC = '/topic/comic-list.removal';
export const DUPLICATE_PAGE_LIST_TOPIC = '/topic/duplicate-page-list.update';
