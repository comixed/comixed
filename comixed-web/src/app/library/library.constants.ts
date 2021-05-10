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

import { API_ROOT_URL } from '../core';

export const QUERY_PARAM_TAB = 'tab';
export const UNKNOWN_VALUE_PLACEHOLDER = 'UNKNOWN';
export const PUBLISHERS_GROUP = 'publishers';
export const SERIES_GROUP = 'series';
export const CHARACTERS_GROUP = 'characters';
export const TEAMS_GROUP = 'teams';
export const LOCATIONS_GROUP = 'locations';
export const STORIES_GROUP = 'stories';

export const LOAD_COMICS_URL = `${API_ROOT_URL}/library`;

export const PAGE_SIZE_PREFERENCE = 'preference.page-size';
export const PAGE_SIZE_DEFAULT = 400;
export const PAGINATION_OPTIONS = [10, 25, 50, 100];
export const PAGINATION_PREFERENCE = 'preference.pagination';
export const PAGINATION_DEFAULT = PAGINATION_OPTIONS[0];

export const COMIC_LIST_UPDATE_TOPIC = '/topic/comic-list.update';
