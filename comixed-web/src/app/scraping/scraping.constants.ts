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

export const SCRAPE_COMIC_URL = `${API_ROOT_URL}/scraping/comics/\${comicId}`;
export const LOAD_SCRAPING_VOLUMES_URL = `${API_ROOT_URL}/scraping/volumes`;
export const LOAD_SCRAPING_ISSUE_URL = `${API_ROOT_URL}/scraping/volumes/\${volumeId}/issues/\${issueNumber}`;

export const API_KEY_PREFERENCE = 'preference.scraping.api-key';
export const SKIP_CACHE_PREFERENCE = 'preference.scraping.skip-cache';
export const MAXIMUM_RECORDS_PREFERENCE = 'preference.scraping.maximum-records';
