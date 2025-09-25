/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
  loadDuplicateComics,
  loadDuplicateComicsFailure,
  loadDuplicateComicsSuccess
} from '../actions/duplicate-comic.actions';
import { DuplicateComic } from '@app/library/models/duplicate-comic';

export const DUPLICATE_COMIC_FEATURE_KEY = 'duplicate_comic_state';

export interface DuplicateComicState {
  busy: boolean;
  entries: DuplicateComic[];
  total: number;
}

export const initialState: DuplicateComicState = {
  busy: false,
  entries: [],
  total: 0
};

export const reducer = createReducer(
  initialState,
  on(loadDuplicateComics, state => ({ ...state, busy: true })),
  on(loadDuplicateComicsSuccess, (state, action) => ({
    ...state,
    busy: false,
    entries: action.entries,
    total: action.total
  })),
  on(loadDuplicateComicsFailure, state => ({ ...state, busy: false }))
);

export const duplicateComicFeature = createFeature({
  name: DUPLICATE_COMIC_FEATURE_KEY,
  reducer
});
