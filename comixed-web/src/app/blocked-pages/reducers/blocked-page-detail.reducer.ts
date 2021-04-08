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
  blockedPageLoaded,
  blockedPageSaved,
  loadBlockedPageByHash,
  loadBlockedPageFailed,
  saveBlockedPage,
  saveBlockedPageFailed
} from '../actions/blocked-page-detail.actions';
import { BlockedPage } from '@app/blocked-pages';

export const BLOCKED_PAGE_DETAIL_FEATURE_KEY = 'blocked_page_detail_state';

export interface BlockedPageDetailState {
  loading: boolean;
  notFound: boolean;
  entry: BlockedPage;
  saving: boolean;
  saved: boolean;
}

export const initialState: BlockedPageDetailState = {
  loading: false,
  notFound: false,
  entry: null,
  saving: false,
  saved: false
};

export const reducer = createReducer(
  initialState,

  on(loadBlockedPageByHash, state => ({
    ...state,
    loading: true,
    notFound: false,
    saved: false
  })),
  on(blockedPageLoaded, (state, action) => ({
    ...state,
    loading: false,
    entry: action.entry
  })),
  on(loadBlockedPageFailed, state => ({
    ...state,
    loading: false,
    notFound: true
  })),
  on(saveBlockedPage, state => ({ ...state, saving: true, saved: false })),
  on(blockedPageSaved, (state, action) => ({
    ...state,
    entry: action.entry,
    saving: false,
    saved: true
  })),
  on(saveBlockedPageFailed, state => ({ ...state, saving: false }))
);
