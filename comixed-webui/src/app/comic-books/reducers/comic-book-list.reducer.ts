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

import { createReducer, on } from '@ngrx/store';
import {
  comicBookListRemovalReceived,
  comicBookListUpdateReceived,
  comicBooksReceived,
  loadComicBooks,
  loadComicBooksFailed,
  resetComicBookList,
  setComicBookListFilter
} from '../actions/comic-book-list.actions';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { CoverDateFilter } from '@app/comic-books/models/ui/cover-date-filter';

export const COMIC_BOOK_LIST_FEATURE_KEY = 'comic_book_list_state';

export interface ComicBookListState {
  loading: boolean;
  lastId: number;
  lastPayload: boolean;
  comicBooks: ComicBook[];
  unprocessed: ComicBook[];
  unscraped: ComicBook[];
  changed: ComicBook[];
  deleted: ComicBook[];
  coverDateFilter: CoverDateFilter;
}

export const initialState: ComicBookListState = {
  loading: false,
  lastId: 0,
  lastPayload: false,
  comicBooks: [],
  unprocessed: [],
  unscraped: [],
  changed: [],
  deleted: [],
  coverDateFilter: { year: null, month: null }
};

export const reducer = createReducer(
  initialState,

  on(resetComicBookList, state => ({
    ...state,
    loading: false,
    lastId: 0,
    lastPayload: false,
    comicBooks: [],
    unprocessed: [],
    unscraped: [],
    changed: [],
    deleted: [],
    coverDateFilter: { year: null, month: null }
  })),
  on(loadComicBooks, state => ({ ...state, loading: true })),
  on(comicBooksReceived, (state, action) => {
    let comicBooks = state.comicBooks.filter(comicBook =>
      action.comicBooks.every(entry => entry.id !== comicBook.id)
    );
    comicBooks = comicBooks.concat(action.comicBooks);
    const lastId = action.lastId;
    const lastPayload = action.lastPayload;
    return comicListUpdate(
      { ...state, lastId, lastPayload, loading: false },
      comicBooks
    );
  }),
  on(loadComicBooksFailed, state => ({ ...state, loading: false })),
  on(comicBookListUpdateReceived, (state, action) => {
    const comicBooks = state.comicBooks.filter(
      comicBook => comicBook.id !== action.comicBook.id
    );
    comicBooks.push(action.comicBook);
    return comicListUpdate(state, comicBooks);
  }),
  on(comicBookListRemovalReceived, (state, action) => {
    const comicBooks = state.comicBooks.filter(
      comicBook => comicBook.id !== action.comicBook.id
    );
    return comicListUpdate(state, comicBooks);
  }),
  on(setComicBookListFilter, (state, action) => ({
    ...state,
    coverDateFilter: { month: action.month, year: action.year }
  }))
);

function comicListUpdate(
  state: ComicBookListState,
  comicBooks: ComicBook[]
): ComicBookListState {
  return {
    ...state,
    comicBooks,
    unprocessed: comicBooks.filter(comic => !comic.fileDetails),
    unscraped: comicBooks.filter(comic => !comic.metadata),
    changed: comicBooks.filter(
      comic => comic.comicState == ComicBookState.CHANGED
    ),
    deleted: comicBooks.filter(
      comic => comic.comicState === ComicBookState.DELETED
    ),
    loading: false
  };
}
