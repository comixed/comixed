/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  addSingleComicBookSelection,
  clearComicBookSelectionState,
  clearComicBookSelectionStateFailed,
  comicBookSelectionsLoaded,
  comicBookSelectionStateCleared,
  comicBookSelectionUpdate,
  loadComicBookSelections,
  loadComicBookSelectionsFailed,
  multipleComicBookSelectionStateSet,
  removeSingleComicBookSelection,
  setMultipleComicBookByFilterSelectionState,
  setMultipleComicBookSelectionStateFailed,
  singleComicBookSelectionFailed,
  singleComicBookSelectionUpdated
} from '../actions/comic-book-selection.actions';

export const COMIC_BOOK_SELECTION_FEATURE_KEY = 'comic_book_selection';

export interface ComicBookSelectionState {
  busy: boolean;
  ids: number[];
}

export const initialState: ComicBookSelectionState = {
  busy: false,
  ids: []
};

export const reducer = createReducer(
  initialState,
  on(loadComicBookSelections, state => ({
    ...state,
    busy: true
  })),
  on(comicBookSelectionsLoaded, (state, action) => ({
    ...state,
    busy: false,
    ids: action.ids
  })),
  on(loadComicBookSelectionsFailed, state => ({ ...state, busy: false })),
  on(comicBookSelectionUpdate, (state, action) => ({
    ...state,
    ids: action.ids
  })),
  on(clearComicBookSelectionState, state => ({ ...state, busy: true })),
  on(comicBookSelectionStateCleared, state => ({
    ...state,
    busy: false
  })),
  on(clearComicBookSelectionStateFailed, state => ({
    ...state,
    busy: false
  })),
  on(addSingleComicBookSelection, state => ({
    ...state,
    busy: true
  })),
  on(removeSingleComicBookSelection, state => ({
    ...state,
    busy: true
  })),
  on(singleComicBookSelectionUpdated, state => ({
    ...state,
    busy: false
  })),
  on(singleComicBookSelectionFailed, state => ({
    ...state,
    busy: false
  })),
  on(setMultipleComicBookByFilterSelectionState, state => ({
    ...state,
    busy: true
  })),
  on(multipleComicBookSelectionStateSet, state => ({
    ...state,
    busy: false
  })),
  on(setMultipleComicBookSelectionStateFailed, state => ({
    ...state,
    busy: false
  }))
);

export const comicBookSelectionFeature = createFeature({
  name: COMIC_BOOK_SELECTION_FEATURE_KEY,
  reducer
});
