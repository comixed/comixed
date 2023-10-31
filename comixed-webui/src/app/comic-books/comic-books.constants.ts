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
import { SelectionOption } from '@app/core/models/ui/selection-option';
import { ComicType } from '@app/comic-books/models/comic-type';

export const LOAD_COMIC_DETAILS_URL = `${API_ROOT_URL}/comics/details/load`;
export const LOAD_COMIC_DETAILS_BY_ID_URL = `${API_ROOT_URL}/comics/details/load/ids`;
export const LOAD_COMIC_DETAILS_FOR_COLLECTION_URL = `${API_ROOT_URL}/comics/details/load/tag`;

export const LOAD_COMIC_BOOK_SELECTIONS_URL = `${API_ROOT_URL}/comics/selections`;
export const ADD_SINGLE_COMIC_SELECTION_URL = `${API_ROOT_URL}/comics/selections/\${comicBookId}`;
export const REMOVE_SINGLE_COMIC_SELECTION_URL = `${API_ROOT_URL}/comics/selections/\${comicBookId}`;
export const SET_SELECTED_COMIC_BOOKS_BY_FILTER_URL = `${API_ROOT_URL}/comics/selections/multiple`;
export const SET_SELECTED_COMIC_BOOKS_BY_TAG_TYPE_AND_VALUE_URL = `${API_ROOT_URL}/comics/selections/tag/\${tagType}/\${tagValue}`;
export const SET_SELECTED_COMIC_BOOKS_BY_ID_URL = `${API_ROOT_URL}/comics/selections/ids`;
export const CLEAR_COMIC_BOOK_SELECTION_STATE_URL = `${API_ROOT_URL}/comics/selections/clear`;

export const DELETE_SINGLE_COMIC_BOOK_URL = `${API_ROOT_URL}/comics/\${comicBookId}`;
export const UNDELETE_SINGLE_COMIC_BOOK_URL = `${API_ROOT_URL}/comics/\${comicBookId}/undelete`;
export const DELETE_SELECTED_COMIC_BOOKS_URL = `${API_ROOT_URL}/comics/mark/deleted/selected`;
export const UNDELETE_SELECTED_COMIC_BOOKS_URL = `${API_ROOT_URL}/comics/mark/deleted/selected`;
export const SAVE_PAGE_ORDER_URL = `${API_ROOT_URL}/comics/\${id}/pages/order`;

export const GET_IMPRINTS_URL = `${API_ROOT_URL}/comics/imprints`;
export const PAGE_URL_FROM_HASH = `${API_ROOT_URL}/pages/hashes/\${hash}/content`;
export const MARK_PAGES_DELETED_URL = `${API_ROOT_URL}/pages/deleted`;
export const MARK_PAGES_UNDELETED_URL = `${API_ROOT_URL}/pages/undeleted`;

export const COMIC_BOOK_UPDATE_TOPIC = `/topic/comic-book.\${id}.update`;
export const COMIC_BOOK_SELECTION_UPDATE_TOPIC =
  '/topic/user/comic-book-selection.update';

export const MISSING_VOLUME_PLACEHOLDER = '----';

// user preferences
export const LIBRARY_LOAD_MAX_RECORDS = 'library.load.max-records';
export const DEFAULT_LIBRARY_LOAD_MAX_RECORDS = 1000;

export const COMIC_TYPE_SELECTION_OPTIONS: SelectionOption<ComicType>[] = [
  {
    label: 'comic-book.label.comic-type-issue',
    value: ComicType.ISSUE,
    selected: false
  },
  {
    label: 'comic-book.label.comic-type-trade-paperback',
    value: ComicType.TRADEPAPERBACK,
    selected: false
  },
  {
    label: 'comic-book.label.comic-type-manga',
    value: ComicType.MANGA,
    selected: false
  }
];
