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
import { SECURED_PREFIX } from '@app/messaging/messaging.constants';

export const LOAD_LAST_READ_ENTRIES_URL = `${API_ROOT_URL}/library/read?lastId=\${lastId}`;
export const SET_COMIC_BOOK_READ_STATE_URL = `${API_ROOT_URL}/library/read/\${comicBookId}`;
export const SET_SELECTED_COMIC_BOOKS_READ_STATE_URL = `${API_ROOT_URL}/library/read/selected`;

export const LAST_READ_UPDATED_TOPIC = `${SECURED_PREFIX}/topic/last-read-list.update`;
export const LAST_READ_REMOVED_TOPIC = `${SECURED_PREFIX}/topic/last-read-list.remove`;
