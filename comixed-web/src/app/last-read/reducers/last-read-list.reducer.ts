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
  lastReadDateRemoved,
  lastReadDatesLoaded,
  lastReadDateUpdated,
  loadLastReadDates,
  loadLastReadDatesFailed,
  resetLastReadDates
} from '../actions/last-read-list.actions';
import { LastRead } from '@app/last-read';

export const LAST_READ_LIST_FEATURE_KEY = 'last_read_list_state';

export interface LastReadListState {
  loading: boolean;
  entries: LastRead[];
  lastPayload: boolean;
}

export const initialState: LastReadListState = {
  loading: false,
  entries: [],
  lastPayload: false
};

export const reducer = createReducer(
  initialState,

  on(resetLastReadDates, state => ({
    ...state,
    entries: [],
    lastPayload: false
  })),
  on(loadLastReadDates, state => ({ ...state, loading: true })),
  on(lastReadDatesLoaded, (state, action) => {
    const entries = state.entries.concat(action.entries);
    const lastPayload = action.lastPayload;
    return { ...state, loading: false, entries, lastPayload };
  }),
  on(lastReadDateUpdated, (state, action) => {
    const entries = state.entries
      .filter(entry => entry.id !== action.entry.id)
      .concat([action.entry]);
    return { ...state, entries };
  }),
  on(lastReadDateRemoved, (state, action) => {
    const entries = state.entries.filter(entry => entry.id !== action.entry.id);
    return { ...state, entries };
  }),
  on(loadLastReadDatesFailed, state => ({ ...state, loading: false }))
);
