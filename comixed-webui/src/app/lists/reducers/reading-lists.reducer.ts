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
  loadReadingLists,
  loadReadingListsFailed,
  readingListsLoaded
} from '../actions/reading-lists.actions';
import { ReadingList } from '@app/lists/models/reading-list';

export const READING_LISTS_FEATURE_KEY = 'reading_lists_state';

export interface ReadingListsState {
  loading: boolean;
  entries: ReadingList[];
}

export const initialState: ReadingListsState = {
  loading: false,
  entries: []
};

export const reducer = createReducer(
  initialState,

  on(loadReadingLists, state => ({ ...state, loading: true })),
  on(readingListsLoaded, (state, action) => ({
    ...state,
    loading: false,
    entries: action.entries
  })),
  on(loadReadingListsFailed, state => ({ ...state, loading: false }))
);
