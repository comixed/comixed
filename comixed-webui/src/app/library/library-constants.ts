/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { API_ROOT_URL } from '@app/app-constants';

export const LOAD_COMIC_FILES_FROM_SESSION_URL = `${API_ROOT_URL}/files/session`;
export const LOAD_COMIC_FILES_URL = `${API_ROOT_URL}/files/contents`;
export const TOGGLE_COMIC_FILE_SELECTIONS_URL = `${API_ROOT_URL}/files/import/selections`;
export const SEND_COMIC_FILES_URL = `${API_ROOT_URL}/files/import`;

export const LOAD_LIBRARY_STATE_URL = `${API_ROOT_URL}/library/state`;
export const LOAD_SELECTED_COMICS_URL = `${API_ROOT_URL}/comics/selected`;
export const LOAD_COMICS_BY_FILTER_URL = `${API_ROOT_URL}/comics/filtered`;

export const GET_COMIC_COVER_URL = `${API_ROOT_URL}/comics/\${id}/cover/content`;
export const MISSING_COMIC_IMAGE_URL = '/images/library/missing-comic-file.png';

export const REMOTE_LIBRARY_STATE_TOPIC = '/topic/remote-library.update';
