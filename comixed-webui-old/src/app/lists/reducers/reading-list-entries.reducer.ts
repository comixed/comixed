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
  addComicsToReadingListFailure,
  addComicsToReadingListSuccess,
  addSelectedComicsToReadingList,
  removeComicsFromReadingListFailure,
  removeComicsFromReadingListSuccess,
  removeSelectedComicsFromReadingList
} from '../actions/reading-list-entries.actions';

export const READING_LIST_ENTRIES_FEATURE_KEY = 'reading_list_entries_state';

export interface ReadingListEntriesState {
  working: boolean;
}

export const initialState: ReadingListEntriesState = {
  working: false
};

export const reducer = createReducer(
  initialState,

  on(addSelectedComicsToReadingList, state => ({
    ...state,
    working: true
  })),
  on(addComicsToReadingListSuccess, state => ({
    ...state,
    working: false
  })),
  on(addComicsToReadingListFailure, state => ({
    ...state,
    working: false
  })),
  on(removeSelectedComicsFromReadingList, state => ({
    ...state,
    working: true
  })),
  on(removeComicsFromReadingListSuccess, state => ({
    ...state,
    working: false
  })),
  on(removeComicsFromReadingListFailure, state => ({
    ...state,
    working: false
  }))
);

export const readingListEntriesFeature = createFeature({
  name: READING_LIST_ENTRIES_FEATURE_KEY,
  reducer
});
