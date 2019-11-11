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

export const COMIXED_API_ROOT = '/api';

export const GET_UPDATES_URL = `${COMIXED_API_ROOT}/comics/since/\${timestamp}`;
export const START_RESCAN_URL = `${COMIXED_API_ROOT}/comics/rescan`;
export const DELETE_MULTIPLE_COMICS_URL = `${COMIXED_API_ROOT}/comics/multiple/delete`;

export const GET_READING_LISTS_URL = `${COMIXED_API_ROOT}/lists`;
export const GET_READING_LIST_URL = `${COMIXED_API_ROOT}/lists/\${id}`;
export const CREATE_READING_LIST_URL = `${COMIXED_API_ROOT}/lists`;
export const SAVE_READING_LIST_URL = `${COMIXED_API_ROOT}/lists/\${id}`;

export const GET_BUILD_DETAILS_URL = `${COMIXED_API_ROOT}/core/build-details`;
