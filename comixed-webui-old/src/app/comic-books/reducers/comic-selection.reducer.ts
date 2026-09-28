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
  addSingleComicSelection,
  clearComicSelectionState,
  clearComicSelectionStateFailed,
  comicSelectionsLoaded,
  comicSelectionStateCleared,
  comicSelectionUpdate,
  loadComicSelections,
  loadComicSelectionsFailed,
  removeSingleComicSelection,
  setComicSelectionByUnreadState,
  setDuplicateComicsSelectionState,
  setMultipleComicByFilterSelectionState,
  setMultipleComicByIdSelectionState,
  setMultipleComicByPublisherSelectionState,
  setMultipleComicByPublisherSeriesAndVolumeSelectionState,
  setMultipleComicsByTagTypeAndValueSelectionState,
  setMultipleComicSelectionStateFailure,
  setMultipleComicSelectionStateSuccess,
  singleComicSelectionFailed,
  singleComicSelectionUpdated
} from '../actions/comic-book-selection.actions';

export const COMIC_SELECTION_FEATURE_KEY = 'comic_book_selection_state';

export interface ComicSelectionState {
  busy: boolean;
  ids: number[];
}

export const initialState: ComicSelectionState = {
  busy: false,
  ids: []
};

export const reducer = createReducer(
  initialState,
  on(loadComicSelections, state => ({
    ...state,
    busy: true
  })),
  on(comicSelectionsLoaded, (state, action) => ({
    ...state,
    busy: false,
    ids: action.ids
  })),
  on(loadComicSelectionsFailed, state => ({ ...state, busy: false })),
  on(comicSelectionUpdate, (state, action) => ({
    ...state,
    ids: action.ids
  })),
  on(clearComicSelectionState, state => ({ ...state, busy: true })),
  on(comicSelectionStateCleared, state => ({
    ...state,
    busy: false
  })),
  on(clearComicSelectionStateFailed, state => ({
    ...state,
    busy: false
  })),
  on(addSingleComicSelection, state => ({
    ...state,
    busy: true
  })),
  on(removeSingleComicSelection, state => ({
    ...state,
    busy: true
  })),
  on(singleComicSelectionUpdated, state => ({
    ...state,
    busy: false
  })),
  on(singleComicSelectionFailed, state => ({
    ...state,
    busy: false
  })),
  on(setMultipleComicByFilterSelectionState, state => ({
    ...state,
    busy: true
  })),
  on(setMultipleComicsByTagTypeAndValueSelectionState, state => ({
    ...state,
    busy: true
  })),
  on(setMultipleComicByIdSelectionState, state => ({
    ...state,
    busy: true
  })),
  on(setMultipleComicByPublisherSelectionState, state => ({
    ...state,
    busy: true
  })),
  on(setMultipleComicByPublisherSeriesAndVolumeSelectionState, state => ({
    ...state,
    busy: true
  })),
  on(setDuplicateComicsSelectionState, state => ({ ...state, busy: true })),
  on(setMultipleComicSelectionStateSuccess, state => ({
    ...state,
    busy: false
  })),
  on(setMultipleComicSelectionStateFailure, state => ({
    ...state,
    busy: false
  })),
  on(setComicSelectionByUnreadState, state => ({
    ...state,
    busy: true
  }))
);

export const comicSelectionFeature = createFeature({
  name: COMIC_SELECTION_FEATURE_KEY,
  reducer
});
