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

export const GET_LIBRARY_UPDATES_URL = `${API_ROOT_URL}/library/updates`;

export const GET_ALL_DUPLICATE_PAGES_URL = `${API_ROOT_URL}/pages/duplicates`;
export const SET_BLOCKING_STATE_URL = `${API_ROOT_URL}/pages/hashes/blocking`;
export const SET_DELETED_STATE_URL = `${API_ROOT_URL}/pages/hashes/deleted`;
export const START_RESCAN_URL = `${COMIXED_API_ROOT}/comics/rescan`;
export const DELETE_MULTIPLE_COMICS_URL = `${COMIXED_API_ROOT}/comics/multiple/delete`;
export const CONVERT_COMICS_URL = `${COMIXED_API_ROOT}/library/convert`;

export const GET_COLLECTION_ENTRIES_URL = `${API_ROOT_URL}/collections/\${type}`;
export const GET_PAGE_FOR_ENTRY_URL = `${API_ROOT_URL}/collections/\${type}/\${name}`;

export const GET_PUBLISHER_BY_NAME_URL = `${API_ROOT_URL}/publishers/\${name}`;
export const GET_PUBLISHER_LOGO_URL = `${API_ROOT_URL}/publishers/\${name}/logo`;
export const GET_PUBLISHER_THUMBNAIL_URL = `${API_ROOT_URL}/publishers/\${name}/thumbnail`;
