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

export const ROLE_NAME_READER = 'READER';
export const ROLE_NAME_ADMIN = 'ADMIN';

export const LOAD_CURRENT_USER_URL = `${API_ROOT_URL}/user`;
export const LOGIN_USER_URL = `${API_ROOT_URL}/token/generate-token`;
export const SAVE_USER_PREFERENCE_URL = `${API_ROOT_URL}/user/preferences/\${name}`;
export const DELETE_USER_PREFERENCE_URL = `${API_ROOT_URL}/user/preferences/\${name}`;
