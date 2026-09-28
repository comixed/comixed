/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
  addAllHashesToSelection,
  addHashSelection,
  clearHashSelections,
  loadHashSelections,
  loadHashSelectionsFailure,
  loadHashSelectionsSuccess,
  removeHashSelection
} from '../actions/hash-selection.actions';

export const HASH_SELECTION_FEATURE_KEY = 'hash_selection_state';

export interface HashSelectionState {
  busy: boolean;
  entries: string[];
}

export const initialState: HashSelectionState = {
  busy: false,
  entries: []
};

export const reducer = createReducer(
  initialState,
  on(loadHashSelections, state => ({ ...state, busy: true })),
  on(loadHashSelectionsSuccess, (state, action) => ({
    ...state,
    busy: false,
    entries: action.entries
  })),
  on(loadHashSelectionsFailure, state => ({ ...state, busy: false })),
  on(addAllHashesToSelection, state => ({ ...state, busy: true })),
  on(addHashSelection, state => ({ ...state, busy: true })),
  on(removeHashSelection, state => ({ ...state, busy: true })),
  on(clearHashSelections, state => ({ ...state, busy: true, entries: [] }))
);

export const hashSelectionFeature = createFeature({
  name: HASH_SELECTION_FEATURE_KEY,
  reducer
});
