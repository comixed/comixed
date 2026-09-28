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
  createReadingList,
  loadReadingList,
  loadReadingListFailed,
  readingListLoaded,
  readingListSaved,
  saveReadingList,
  saveReadingListFailed
} from '../actions/reading-list-detail.actions';
import { ReadingList } from '@app/lists/models/reading-list';
import { READING_LIST_TEMPLATE } from '@app/lists/lists.constants';

export const READING_LIST_DETAIL_FEATURE_KEY = 'reading_list_detail_state';

export interface ReadingListDetailState {
  loading: boolean;
  notFound: boolean;
  list: ReadingList;
  saving: boolean;
}

export const initialState: ReadingListDetailState = {
  loading: false,
  notFound: false,
  list: null,
  saving: false
};

export const reducer = createReducer(
  initialState,

  on(createReadingList, state => ({
    ...state,
    notFound: false,
    list: READING_LIST_TEMPLATE
  })),
  on(loadReadingList, state => ({
    ...state,
    loading: true,
    notFound: false,
    list: null
  })),
  on(readingListLoaded, (state, action) => ({
    ...state,
    loading: false,
    list: action.list
  })),
  on(loadReadingListFailed, state => ({
    ...state,
    loading: false,
    notFound: true
  })),
  on(saveReadingList, state => ({ ...state, saving: true })),
  on(readingListSaved, (state, action) => ({
    ...state,
    saving: false,
    list: action.list
  })),
  on(saveReadingListFailed, state => ({ ...state, saving: false }))
);

export const readingListDetailsFeature = createFeature({
  name: READING_LIST_DETAIL_FEATURE_KEY,
  reducer
});
