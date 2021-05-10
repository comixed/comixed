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

export const LOAD_COMIC_FILES_URL = `${API_ROOT_URL}/files/contents`;
export const SEND_COMIC_FILES_URL = `${API_ROOT_URL}/files/import`;
export const IMPORT_ROOT_DIRECTORY_PREFERENCE =
  'preference.import.root-directory';
export const IMPORT_ROOT_DIRECTORY_DEFAULT = '';
export const IMPORT_MAXIMUM_RESULTS_PREFERENCE =
  'preference.import.maximum-results';
export const IMPORT_MAXIMUM_RESULTS_DEFAULT = 0;
export const IGNORE_METADATA_PREFERENCE = 'preference.import.ignore-metadata';
export const IGNORE_METADATA_DEFAULT = `${false}`;
export const DELETE_BLOCKED_PAGES_PREFERENCE =
  'preference.import.delete-blocked-pages';
export const DELETE_BLOCKED_PAGES_DEFAULT = `${false}`;
