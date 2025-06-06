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

export const SCRAPE_STORY_PARAMETER = 'scrape-story';

export const LOAD_COLLECTION_ENTRIES_URL = `${API_ROOT_URL}/collections/\${tagType}`;
export const LOAD_PUBLISHERS_URL = `${API_ROOT_URL}/collections/publishers`;
export const LOAD_PUBLISHER_DETAIL_URL = `${API_ROOT_URL}/collections/publishers/\${name}`;
export const LOAD_SERIES_URL = `${API_ROOT_URL}/collections/series`;
export const LOAD_SERIES_DETAIL_URL = `${API_ROOT_URL}/collections/series/detail`;
