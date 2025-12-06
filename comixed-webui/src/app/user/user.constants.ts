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

export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 128;

export const ROLE_NAME_READER = 'READER';
export const ROLE_NAME_ADMIN = 'ADMIN';

export const CHECK_FOR_ADMIN_ACCOUNT_URL = `${API_ROOT_URL}/users/admins/existing`;
export const CREATE_ADMIN_ACCOUNT_URL = `${API_ROOT_URL}/users/admins`;
export const LOAD_CURRENT_USER_URL = `${API_ROOT_URL}/user`;
export const SAVE_CURRENT_USER_URL = `${API_ROOT_URL}/user/\${id}`;
export const LOGIN_USER_URL = `${API_ROOT_URL}/token/generate`;
export const LOGOUT_USER_URL = `${API_ROOT_URL}/token/destroy`;

export const SAVE_USER_PREFERENCE_URL = `${API_ROOT_URL}/user/preferences/\${name}`;
export const DELETE_USER_PREFERENCE_URL = `${API_ROOT_URL}/user/preferences/\${name}`;

export const SET_COMIC_BOOK_READ_STATE_URL = `${API_ROOT_URL}/user/read/\${comicDetailId}`;
export const SET_SELECTED_COMIC_BOOKS_READ_STATE_URL = `${API_ROOT_URL}/user/read/selected`;

export const LOAD_USER_LIST_URL = `${API_ROOT_URL}/users/list`;
export const CREATE_USER_ACCOUNT_URL = `${API_ROOT_URL}/users/create`;
export const SAVE_USER_ACCOUNT_URL = `${API_ROOT_URL}/users/\${userId}`;

export const DELETE_USER_ACCOUNT_URL = `${API_ROOT_URL}/users/\${userId}`;

export const LOAD_COMICS_READ_STATISTICS_URL = `${API_ROOT_URL}/users/statistics/comics/read`;
export const USER_SELF_TOPIC = `/secured/user/\${email}/user/current`;
