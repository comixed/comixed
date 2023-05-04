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
  resetComicBookList
} from '../actions/comic-book-list.actions';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

export const COMIC_BOOK_LIST_FEATURE_KEY = 'comic_book_list_state';

export interface ComicBookListState {
  loading: boolean;
  lastId: number;
  lastPayload: boolean;
  comicBooks: ComicDetail[];
  unprocessed: ComicDetail[];
  unscraped: ComicDetail[];
  changed: ComicDetail[];
  deleted: ComicDetail[];
}

export const initialState: ComicBookListState = {
  loading: false,
  lastId: 0,
  lastPayload: false,
  comicBooks: [],
  unprocessed: [],
  unscraped: [],
  changed: [],
  deleted: []
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
    deleted: []
  })),
  on(loadComicBooks, state => ({ ...state, loading: true })),
  on(comicBooksReceived, (state, action) => {
    let comicBooks = state.comicBooks.filter(comicBook =>
      action.comicBooks.every(entry => entry.comicId !== comicBook.comicId)
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
    const comicDetails = state.comicBooks.filter(
      comicBook => comicBook.id !== action.comicDetail.id
    );
    comicDetails.push(action.comicDetail);
    return comicListUpdate(state, comicDetails);
  }),
  on(comicBookListRemovalReceived, (state, action) => {
    const comicDetails = state.comicBooks.filter(
      comicBook => comicBook.id !== action.comicDetail.id
    );
    return comicListUpdate(state, comicDetails);
  })
);

function comicListUpdate(
  state: ComicBookListState,
  comicDetails: ComicDetail[]
): ComicBookListState {
  return {
    ...state,
    comicBooks: comicDetails,
    unprocessed: comicDetails.filter(
      comic => comic.comicState === ComicBookState.UNPROCESSED
    ),
    unscraped: comicDetails.filter(comic => comic.unscraped),
    changed: comicDetails.filter(
      comic => comic.comicState == ComicBookState.CHANGED
    ),
    deleted: comicDetails.filter(
      comic => comic.comicState === ComicBookState.DELETED
    ),
    loading: false
  };
}
