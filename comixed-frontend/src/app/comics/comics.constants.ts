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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { API_ROOT_URL } from 'app/app.functions';
import { COMIXED_API_ROOT } from 'app/app.constants';

export const GET_SCAN_TYPES_URL = `${API_ROOT_URL}/comics/scan_types`;
export const GET_FORMATS_URL = `${API_ROOT_URL}/comics/formats`;
export const GET_PAGE_TYPES_URL = `${API_ROOT_URL}/pages/types`;
export const GET_COMIC_URL = `${API_ROOT_URL}/comics/\${id}`;
export const SAVE_COMIC_URL = `${API_ROOT_URL}/comics/\${id}`;
export const CLEAR_METADATA_URL = `${API_ROOT_URL}/comics/\${id}/metadata`;
export const DELETE_COMIC_URL = `${API_ROOT_URL}/comics/\${id}`;
export const RESTORE_COMIC_URL = `${API_ROOT_URL}/comics/\${id}/restore`;
export const DOWNLOAD_COMIC_URL = `${API_ROOT_URL}/comics/\${id}/download`;
export const GET_COMIC_COVER_URL = `${API_ROOT_URL}/comics/\${id}/cover/content`;
export const MARK_COMIC_AS_READ_URL = `${API_ROOT_URL}/comics/\${id}/read`;
export const MARK_COMIC_AS_UNREAD_URL = `${API_ROOT_URL}/comics/\${id}/read`;
export const MARK_PAGE_DELETED_URL = `${COMIXED_API_ROOT}/pages/\${id}`;
export const UNMARK_PAGE_DELETED_URL = `${COMIXED_API_ROOT}/pages/\${id}/undelete`;

export const MISSING_COMIC_IMAGE_URL = '/assets/img/missing-comic-file.png';

export const SAVE_PAGE_URL = `${API_ROOT_URL}/pages/\${id}`;
export const SET_PAGE_TYPE_URL = `${API_ROOT_URL}/pages/\${id}/type`;
export const GET_PAGE_CONTENT_URL = `${API_ROOT_URL}/pages/\${id}/content`;
export const BLOCK_PAGE_HASH_URL = `${API_ROOT_URL}/pages/\${id}/block/\${hash}`;
export const UNBLOCK_PAGE_HASH_URL = `${API_ROOT_URL}/pages/\${id}/unblock/\${hash}`;

export const GET_VOLUMES_URL = `${API_ROOT_URL}/scraping/volumes`;
export const GET_ISSUE_URL = `${API_ROOT_URL}/scraping/volumes/\${volume}/issues`;

export const LOAD_METADATA_URL = `${API_ROOT_URL}/scraping/comics/\${comicId}/issue/\${issueId}`;

export const PUBLISHER_IMPRINT_FORMAT = `\${imprint} (\${publisher})`;
