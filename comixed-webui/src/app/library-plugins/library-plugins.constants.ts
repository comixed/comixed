/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

export const LOAD_ALL_PLUGINS_URL = `${API_ROOT_URL}/plugins`;
export const CREATE_PLUGIN_URL = `${API_ROOT_URL}/plugins`;
export const UPDATE_PLUGIN_URL = `${API_ROOT_URL}/plugins/\${pluginId}`;
export const DELETE_PLUGIN_URL = `${API_ROOT_URL}/plugins/\${pluginId}`;

export const LOAD_LANGUAGE_RUNTIME_LIST_URL = `${API_ROOT_URL}/plugins/languages`;

export const RUN_LIBRARY_PLUGIN_ON_ONE_COMIC_BOOK_URL = `${API_ROOT_URL}/plugins/\${pluginId}/comics/\${comicBookId}`;
export const RUN_LIBRARY_PLUGIN_ON_SELECTED_COMIC_BOOKS_URL = `${API_ROOT_URL}/plugins/\${pluginId}/comics/selected`;
