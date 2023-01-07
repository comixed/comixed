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

export const HTTP_AUTHORIZATION_HEADER = 'Authorization';
export const HTTP_REQUESTED_WITH_HEADER = 'X-Requested-With';
export const HTTP_XML_REQUEST = 'XMLHttpRequest';

export const LOAD_CURRENT_RELEASE_DETAILS_URL = `${API_ROOT_URL}/app/release/current`;
export const LOAD_LATEST_RELEASE_DETAILS_URL = `${API_ROOT_URL}/app/release/latest`;

export const LANGUAGE_PREFERENCE = 'preference.language';
export const LOGGER_LEVEL_PREFERENCE = 'preference.logging.level';

// external pages

export const WIKI_PAGE_URL = 'https://github.com/comixed/comixed/wiki';
export const WIKI_PAGE_TARGET = '_cx_wiki';
export const ISSUE_PAGE_URL = 'https://github.com/comixed/comixed/issues';
export const ISSUE_PAGE_TARGET = '_cx_issues';
export const LATEST_RELEASE_TARGET = '_cx_latest_release';

// messaging constants

export const PROCESS_COMICS_TOPIC = '/topic/process-comics.status';
