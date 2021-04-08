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

import { API_ROOT_URL } from '@app/core';

export const LOAD_ALL_BLOCKED_PAGES_URL = `${API_ROOT_URL}/pages/blocked`;
export const LOAD_BLOCKED_PAGE_BY_HASH_URL = `${API_ROOT_URL}/pages/blocked/\${hash}`;
export const SAVE_BLOCKED_PAGE_URL = `${API_ROOT_URL}/pages/blocked/\${hash}`;
export const SET_BLOCKED_STATE_URL = `${API_ROOT_URL}/pages/blocked/\${hash}`;
export const REMOVE_BLOCKED_STATE_URL = `${API_ROOT_URL}/pages/blocked/\${hash}`;

export const BLOCKED_PAGE_LIST_UPDATE_TOPIC = '/topic/blocked-page-list.update';
export const BLOCKED_PAGE_LIST_REMOVAL_TOPIC =
  'topic/blocked-page-list.removal';
