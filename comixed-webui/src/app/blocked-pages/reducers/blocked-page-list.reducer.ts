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
  blockedPageListLoaded,
  blockedPageListRemoval,
  blockedPageListUpdated,
  loadBlockedPageList,
  loadBlockedPageListFailed
} from '../actions/blocked-page-list.actions';
import { BlockedPage } from '@app/blocked-pages/models/blocked-page';

export const BLOCKED_PAGE_LIST_FEATURE_KEY = 'blocked_page_list_state';

export interface BlockedPageListState {
  loading: boolean;
  entries: BlockedPage[];
}

export const initialState: BlockedPageListState = {
  loading: false,
  entries: []
};

export const reducer = createReducer(
  initialState,

  on(loadBlockedPageList, state => ({ ...state, loading: true, entries: [] })),
  on(blockedPageListLoaded, (state, action) => ({
    ...state,
    loading: false,
    entries: action.entries
  })),
  on(loadBlockedPageListFailed, state => ({ ...state, loading: false })),
  on(blockedPageListUpdated, (state, action) => {
    const entries = state.entries.filter(entry => entry.id !== action.entry.id);
    entries.push(action.entry);
    return { ...state, entries };
  }),
  on(blockedPageListRemoval, (state, action) => {
    const entries = state.entries.filter(
      entry => entry.hash !== action.entry.hash
    );
    return { ...state, entries };
  })
);
