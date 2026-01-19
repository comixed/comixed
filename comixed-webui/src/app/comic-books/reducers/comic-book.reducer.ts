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
  downloadComicBook,
  downloadComicBookFailure,
  downloadComicBookSuccess,
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
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ComicMetadataSource } from '@app/comic-books/models/comic-metadata-source';
import { ComicPage } from '@app/comic-books/models/comic-page';
import { ComicTag } from '@app/comic-books/models/comic-tag';

export const COMIC_BOOK_FEATURE_KEY = 'comic_book_state';

export interface ComicBookState {
  loading: boolean;
  details: DisplayableComic;
  metadata: ComicMetadataSource;
  pages: ComicPage[];
  tags: ComicTag[];
  saving: boolean;
  saved: boolean;
}

export const initialState: ComicBookState = {
  loading: false,
  details: null,
  metadata: null,
  pages: [],
  tags: [],
  saving: false,
  saved: false
};

export const reducer = createReducer(
  initialState,

  on(loadComicBook, state => ({
    ...state,
    details: null,
    metadata: null,
    pages: [],
    loading: true
  })),
  on(comicBookLoaded, (state, action) => ({
    ...state,
    loading: false,
    details: action.details,
    metadata: action.metadata,
    pages: action.pages,
    tags: action.tags
  })),
  on(loadComicBookFailed, state => ({ ...state, loading: false })),
  on(updateComicBook, state => ({ ...state, saving: true, saved: false })),
  on(comicBookUpdated, (state, action) => {
    if (
      !!state.details &&
      state.details.comicBookId === action.details.comicBookId
    ) {
      return {
        ...state,
        saving: false,
        saved: true,
        details: action.details,
        metadata: action.metadata,
        pages: action.pages
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
  on(savePageOrderFailed, state => ({ ...state, saving: false })),
  on(downloadComicBook, state => ({ ...state, loading: true })),
  on(downloadComicBookSuccess, state => ({ ...state, loading: false })),
  on(downloadComicBookFailure, state => ({ ...state, loading: false }))
);

export const comicBookFeature = createFeature({
  name: COMIC_BOOK_FEATURE_KEY,
  reducer
});
