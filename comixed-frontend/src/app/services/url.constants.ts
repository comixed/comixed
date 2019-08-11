/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { API_ROOT_URL } from 'app/app.functions';

export const GET_AUTHENTICATED_USER_URL = '${API_ROOT_URL}/user';
export const AUTH_SUBMIT_LOGIN_DATA_URL =
  '${API_ROOT_URL}/token/generate-token';
export const AUTH_SET_PREFERENCE_URL =
  '${API_ROOT_URL}/user/preferences/${name}';
export const AUTH_DELETE_PREFERENCE_URL =
  '${API_ROOT_URL}/user/preferences/${name}';

export const LIBRARY_STATE_URL =
  '${API_ROOT_URL}/comics/since/${latest}?timeout=${timeout}';
export const COMIC_SCAN_TYPES_URL = `${API_ROOT_URL}/comics/scan_types`;
export const COMIC_SET_SCAN_TYPE_URL = '${API_ROOT_URL}/comics/${id}/scan_type';
export const COMIC_FORMAT_TYPES_URL = `${API_ROOT_URL}/comics/formats`;
export const COMIC_SET_FORMAT_TYPE_URL = '${API_ROOT_URL}/comics/${id}/format';
export const COMIC_SET_SORT_NAME_URL = '${API_ROOT_URL}/comics/${id}/sort_name';
export const COMIC_DELETE_URL = '${API_ROOT_URL}/comics/${id}';
export const COMIC_SUMMARY_URL = '${API_ROOT_URL}/comics/${id}/summary';

export const PAGE_TYPES_URL = `${API_ROOT_URL}/pages/types`;
export const PAGE_TYPE_URL = '${API_ROOT_URL}/pages/${id}/type';
export const DUPLICATE_PAGES_URL = `${API_ROOT_URL}/pages/duplicates`;
export const DELETE_PAGE_URL = '${API_ROOT_URL}/pages/${id}';
export const UNDELETE_PAGE_URL = '${API_ROOT_URL}/pages/${id}/undelete';
export const DELETE_PAGES_WITH_HASH_URL = '${API_ROOT_URL}/pages/hash/${hash}';
export const UNDELETE_PAGES_WITH_HASH_URL =
  '${API_ROOT_URL}/pages/hash/${hash}';
export const GET_COMIC_FILES_URL =
  '${API_ROOT_URL}/files/contents?directory=${directory}';
export const ADD_BLOCKED_PAGE_HASH_URL = `${API_ROOT_URL}/pages/blocked`;
export const DELETE_BLOCKED_PAGE_HASH_URL =
  '${API_ROOT_URL}/pages/blocked/${hash}';
export const IMPORT_COMIC_FILES_URL = `${API_ROOT_URL}/files/import`;
export const RESCAN_COMIC_FILES_URL = `${API_ROOT_URL}/comics/rescan`;
export const GET_SCRAPING_CANDIDATES_URL = `${API_ROOT_URL}/scraper/query/volumes`;
export const GET_COMIC_METADATA_URL = `${API_ROOT_URL}/scraper/query/issue`;
export const SCRAPE_METADATA_AND_SAVE_URL = `${API_ROOT_URL}/scraper/save`;
export const SAVE_COMIC_DETAILS_URL = '${API_ROOT_URL}/comics/${id}';
export const CLEAR_METADATA_URL = '${API_ROOT_URL}/comics/${id}/metadata';

export const GET_READING_LISTS_URL = `${API_ROOT_URL}/lists`;
export const CREATE_READING_LIST_URL = `${API_ROOT_URL}/lists`;
export const UPDATE_READING_LIST_URL = '${API_ROOT_URL}/lists/${id}';
