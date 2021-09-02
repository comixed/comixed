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
  addComicsToReadingList,
  addComicsToReadingListFailed,
  comicsAddedToReadingList,
  comicsRemovedFromReadingList,
  removeComicsFromReadingList,
  removeComicsFromReadingListFailed
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

  on(addComicsToReadingList, state => ({ ...state, working: true })),
  on(comicsAddedToReadingList, state => ({ ...state, working: false })),
  on(addComicsToReadingListFailed, state => ({ ...state, working: false })),
  on(removeComicsFromReadingList, state => ({ ...state, working: true })),
  on(comicsRemovedFromReadingList, state => ({ ...state, working: false })),
  on(removeComicsFromReadingListFailed, state => ({ ...state, working: false }))
);
