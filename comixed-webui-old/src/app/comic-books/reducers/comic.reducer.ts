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
  comicLoaded,
  comicUpdated,
  downloadComic,
  downloadComicFailure,
  downloadComicSuccess,
  loadComic,
  loadComicFailed,
  pageDeletionUpdated,
  pageOrderSaved,
  savePageOrder,
  savePageOrderFailed,
  updateComic,
  updateComicFailed,
  updatePageDeletion,
  updatePageDeletionFailed
} from '../actions/comic-book.actions';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ComicMetadataSource } from '@app/comic-books/models/comic-metadata-source';
import { ComicPage } from '@app/comic-books/models/comic-page';
import { ComicTag } from '@app/comic-books/models/comic-tag';

export const COMIC_FEATURE_KEY = 'comic_book_state';

export interface ComicState {
  loading: boolean;
  detail: DisplayableComic;
  metadata: ComicMetadataSource;
  pages: ComicPage[];
  tags: ComicTag[];
  saving: boolean;
  saved: boolean;
}

export const initialState: ComicState = {
  loading: false,
  detail: null,
  metadata: null,
  pages: [],
  tags: [],
  saving: false,
  saved: false
};

export const reducer = createReducer(
  initialState,

  on(loadComic, state => ({
    ...state,
    detail: null,
    metadata: null,
    pages: [],
    loading: true
  })),
  on(comicLoaded, (state, action) => ({
    ...state,
    loading: false,
    detail: action.detail,
    metadata: action.metadata,
    pages: action.pages,
    tags: action.tags
  })),
  on(loadComicFailed, state => ({ ...state, loading: false })),
  on(updateComic, state => ({ ...state, saving: true, saved: false })),
  on(comicUpdated, (state, action) => {
    if (!!state.detail && state.detail.comicId === action.detail.comicId) {
      return {
        ...state,
        saving: false,
        saved: true,
        detail: action.detail,
        metadata: action.metadata,
        pages: action.pages
      };
    } else {
      return state;
    }
  }),
  on(updateComicFailed, state => ({
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
  on(downloadComic, state => ({ ...state, loading: true })),
  on(downloadComicSuccess, state => ({ ...state, loading: false })),
  on(downloadComicFailure, state => ({ ...state, loading: false }))
);

export const comicFeature = createFeature({
  name: COMIC_FEATURE_KEY,
  reducer
});
