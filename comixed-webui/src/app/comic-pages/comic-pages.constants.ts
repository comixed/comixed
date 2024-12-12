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

export const LOAD_HASH_SELECTIONS_URL = `${API_ROOT_URL}/pages/hashes/selected`;
export const ADD_ALL_DUPLICATE_HASHES_SELECTION_URL = `${API_ROOT_URL}/pages/hashes/selected/all`;
export const ADD_HASH_SELECTION_URL = `${API_ROOT_URL}/pages/hashes/selected/\${hash}`;
export const REMOVE_HASH_SELECTION_URL = `${API_ROOT_URL}/pages/hashes/selected/\${hash}/delete`;
export const CLEAR_HASH_SELECTION_URL = `${API_ROOT_URL}/pages/hashes/selected/all`;
export const LOAD_ALL_BLOCKED_PAGES_URL = `${API_ROOT_URL}/pages/blocked`;
export const LOAD_BLOCKED_PAGE_BY_HASH_URL = `${API_ROOT_URL}/pages/blocked/\${hash}`;
export const SAVE_BLOCKED_PAGE_URL = `${API_ROOT_URL}/pages/blocked/\${hash}`;
export const SET_BLOCKED_STATE_URL = `${API_ROOT_URL}/pages/blocked/add`;
export const REMOVE_BLOCKED_STATE_URL = `${API_ROOT_URL}/pages/blocked/remove`;
export const SET_SELECTED_HASHES_BLOCKED_STATE_URL = `${API_ROOT_URL}/pages/blocked/add/selected`;
export const REMOVE_SELECTED_HASHES_BLOCKED_STATE_URL = `${API_ROOT_URL}/pages/blocked/remove/selected`;
export const DOWNLOAD_BLOCKED_PAGE_FILE_URL = `${API_ROOT_URL}/pages/blocked/file`;
export const UPLOAD_BLOCKED_PAGE_FILE_URL = `${API_ROOT_URL}/pages/blocked/file`;
export const DELETE_BLOCKED_PAGES_URL = `${API_ROOT_URL}/pages/blocked/delete`;
export const MARK_PAGES_WITH_HASH_URL = `${API_ROOT_URL}/pages/blocked/mark`;
export const UNMARK_PAGES_WITH_HASH_URL = `${API_ROOT_URL}/pages/blocked/unmark`;
export const LOAD_ALL_DELETED_PAGES_URL = `${API_ROOT_URL}/pages/deleted`;

export const BLOCKED_HASH_LIST_UPDATE_TOPIC = '/topic/blocked-hash-list.update';
export const BLOCKED_HASH_LIST_REMOVAL_TOPIC =
  '/topic/blocked-hash-list.removal';
