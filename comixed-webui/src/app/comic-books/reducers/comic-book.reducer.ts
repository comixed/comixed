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

import { createFeature, createReducer, on } from '@ngrx/store';
import {
  comicBookLoaded,
  comicBookUpdated,
  loadComicBook,
  loadComicBookFailed,
  pageDeletionUpdated,
  pageOrderSaved,
  savePageOrder,
  savePageOrderFailed,
  updateComicBook,
  updateComicBookFailed,
  updatePageDeletion,
  updatePageDeletionFailed
} from '../actions/comic-book.actions';
import { ComicBook } from '@app/comic-books/models/comic-book';

export const COMIC_BOOK_FEATURE_KEY = 'comic_book_state';

export interface ComicBookState {
  loading: boolean;
  comicBook: ComicBook;
  saving: boolean;
  saved: boolean;
}

export const initialState: ComicBookState = {
  loading: false,
  comicBook: null,
  saving: false,
  saved: false
};

export const reducer = createReducer(
  initialState,

  on(loadComicBook, state => ({ ...state, loading: true })),
  on(comicBookLoaded, (state, action) => ({
    ...state,
    loading: false,
    comicBook: action.comicBook
  })),
  on(loadComicBookFailed, state => ({ ...state, loading: false })),
  on(updateComicBook, state => ({ ...state, saving: true, saved: false })),
  on(comicBookUpdated, (state, action) => {
    if (!!state.comicBook && state.comicBook.id === action.comicBook.id) {
      return {
        ...state,
        saving: false,
        saved: true,
        comicBook: action.comicBook
      };
    } else {
      return state;
    }
  }),
  on(updateComicBookFailed, state => ({
    ...state,
    saving: false,
    saved: false
  })),
  on(updatePageDeletion, state => ({ ...state, saving: true })),
  on(pageDeletionUpdated, state => ({ ...state, saving: false })),
  on(updatePageDeletionFailed, state => ({ ...state, saving: false })),
  on(savePageOrder, state => ({ ...state, saving: true })),
  on(pageOrderSaved, state => ({ ...state, saving: false })),
  on(savePageOrderFailed, state => ({ ...state, saving: false }))
);

export const comicBookFeature = createFeature({
  name: COMIC_BOOK_FEATURE_KEY,
  reducer
});
