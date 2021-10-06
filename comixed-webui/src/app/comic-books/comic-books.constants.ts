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

export const UPDATE_COMIC_INFO_URL = `${API_ROOT_URL}/comics/\${id}/metadata`;
export const MARK_COMICS_DELETED_URL = `${API_ROOT_URL}/comics/mark/deleted`;
export const MARK_COMICS_UNDELETED_URL = `${API_ROOT_URL}/comics/mark/undeleted`;
export const GET_IMPRINTS_URL = `${API_ROOT_URL}/comics/imprints`;

export const PAGE_URL_FROM_HASH = `${API_ROOT_URL}/pages/hashes/\${hash}/content`;

export const COMICVINE_ISSUE_LINK =
  'https://comicvine.gamespot.com/issues/4000-${id}/';

export const COMIC_BOOK_UPDATE_TOPIC = `/topic/comic-book.\${id}.update`;
