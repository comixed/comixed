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
  imprintsLoaded,
  loadImprints,
  loadImprintsFailed
} from '../actions/imprint-list.actions';
import { Imprint } from '@app/comic-book/models/imprint';

export const IMPRINT_LIST_FEATURE_KEY = 'imprint_list_state';

export interface ImprintListState {
  loading: boolean;
  entries: Imprint[];
}

export const initialState: ImprintListState = {
  loading: false,
  entries: []
};

export const reducer = createReducer(
  initialState,

  on(loadImprints, state => ({ ...state, loading: true })),
  on(imprintsLoaded, (state, action) => ({
    ...state,
    loading: false,
    entries: action.entries
  })),
  on(loadImprintsFailed, state => ({ ...state, loading: false }))
);
