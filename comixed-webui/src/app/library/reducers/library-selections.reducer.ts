/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
  clearSelectedComicBooks,
  comicBookSelectionsUpdated,
  deselectComicBooks,
  selectComicBooks,
  updateComicBookSelectionsFailed
} from '../actions/library-selections.actions';

export const LIBRARY_SELECTIONS_FEATURE_KEY = 'library_selections_state';

export interface LibrarySelectionsState {
  busy: boolean;
  ids: number[];
}

export const initialState: LibrarySelectionsState = {
  busy: false,
  ids: []
};

export const reducer = createReducer(
  initialState,

  on(selectComicBooks, state => ({ ...state, busy: true })),
  on(deselectComicBooks, state => ({ ...state, busy: true })),
  on(clearSelectedComicBooks, state => ({ ...state, busy: true })),
  on(comicBookSelectionsUpdated, (state, action) => {
    const ids = !!action.ids ? action.ids : state.ids;
    return {
      ...state,
      busy: false,
      ids
    };
  }),
  on(updateComicBookSelectionsFailed, state => ({ ...state, busy: false }))
);
