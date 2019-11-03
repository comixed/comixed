/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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

export const GET_SCAN_TYPES_URL = `${API_ROOT_URL}/comics/scan_types`;
export const GET_FORMATS_URL = `${API_ROOT_URL}/comics/formats`;
export const GET_PAGE_TYPES_URL = `${API_ROOT_URL}/comics/page_types`;
export const GET_COMIC_URL = `${API_ROOT_URL}/comics/\${id}`;
export const SAVE_COMIC_URL = `${API_ROOT_URL}/comics/\${id}`;
export const CLEAR_METADATA_URL = `${API_ROOT_URL}/comics/\${id}/metadata`;
export const DELETE_COMIC_URL = `${API_ROOT_URL}/comics/\${id}`;
export const RESTORE_COMIC_URL = `${API_ROOT_URL}/comics/\${id}/restore`;

export const SAVE_PAGE_URL = `${API_ROOT_URL}/pages/\${id}`;
export const BLOCK_PAGE_HASH_URL = `${API_ROOT_URL}/pages/\${id}/block/\${hash}`;
export const UNBLOCK_PAGE_HASH_URL = `${API_ROOT_URL}/pages/\${id}/unblock/\${hash}`;

export const GET_VOLUMES_URL = `${API_ROOT_URL}/scraping/series/\${series}`;
export const GET_ISSUE_URL = `${API_ROOT_URL}/scraping/volumes/\${volume}/issues/\${issue}`;
export const LOAD_METADATA_URL = `${API_ROOT_URL}/scraping/comics/\${comicId}/issue/\${issueId}`;
