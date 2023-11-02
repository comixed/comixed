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
  lastReadDateRemoved,
  lastReadDateUpdated,
  loadUnreadComicBookCount,
  loadUnreadComicBookCountFailure,
  loadUnreadComicBookCountSuccess,
  resetLastReadList,
  setLastReadList
} from '../actions/last-read-list.actions';
import { LastRead } from '@app/comic-books/models/last-read';

export const LAST_READ_LIST_FEATURE_KEY = 'last_read_list_state';

export interface LastReadListState {
  busy: boolean;
  unreadCount: number;
  entries: LastRead[];
}

export const initialState: LastReadListState = {
  busy: false,
  unreadCount: 0,
  entries: []
};

export const reducer = createReducer(
  initialState,

  on(loadUnreadComicBookCount, state => ({ ...state, busy: true })),
  on(loadUnreadComicBookCountSuccess, (state, action) => ({
    ...state,
    busy: false,
    unreadCount: action.unreadCount
  })),
  on(loadUnreadComicBookCountFailure, state => ({ ...state, busy: false })),
  on(resetLastReadList, state => ({
    ...state,
    entries: []
  })),
  on(setLastReadList, (state, action) => ({
    ...state,
    entries: action.entries
  })),
  on(lastReadDateUpdated, (state, action) => {
    const entries = state.entries
      .filter(entry => entry.comicDetail.id !== action.entry.comicDetail.id)
      .concat([action.entry]);
    return { ...state, entries };
  }),
  on(lastReadDateRemoved, (state, action) => {
    const entries = state.entries.filter(
      entry => entry.comicDetail.id !== action.entry.comicDetail.id
    );
    return { ...state, entries };
  })
);

export const lastReadListFeature = createFeature({
  name: LAST_READ_LIST_FEATURE_KEY,
  reducer
});
