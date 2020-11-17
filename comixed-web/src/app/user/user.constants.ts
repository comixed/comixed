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

import { API_ROOT_URL } from '@app/core';

export const ROLE_NAME_READER = 'reader';
export const ROLE_NAME_ADMIN = 'admin';

export const LOAD_CURRENT_USER_URL = `${API_ROOT_URL}/user`;
export const LOGIN_USER_URL = `${API_ROOT_URL}/token/generate-token`;

// user preferences
export const USER_PREFERENCE_IMPORT_ROOT_DIRECTORY =
  'comic-files.import.root-directory';
export const USER_PREFERENCE_IMPORT_MAXIMUM = 'comic-files.import.maximum';
export const USER_PREFERENCE_IGNORE_METADATA =
  'comic-files.import.ignore-metadata';
export const USER_PREFERENCE_DELETE_BLOCKED_PAGES =
  'comic-files.import.delete-blocked-pages';