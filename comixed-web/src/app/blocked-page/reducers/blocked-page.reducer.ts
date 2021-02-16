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
  blockedPageHashesLoaded,
  pageBlockSet,
  resetBlockedPageHashes,
  setPageBlock,
  setPageBlockFailed
} from '../actions/blocked-page.actions';

export const BLOCKED_PAGE_FEATURE_KEY = 'blocked_page_state';

export interface BlockedPageState {
  hashes: string[];
  saving: boolean;
}

export const initialState: BlockedPageState = {
  hashes: [],
  saving: false
};

export const reducer = createReducer(
  initialState,

  on(resetBlockedPageHashes, state => ({ ...state, hashes: [] })),
  on(blockedPageHashesLoaded, (state, action) => {
    const removed = action.hashes
      .filter(hash => hash.startsWith('-'))
      .map(hash => hash.substr(1));
    const added = action.hashes
      .filter(hash => hash.startsWith('+'))
      .map(hash => hash.substr(1));
    const hashes = state.hashes
      .filter(hash => !removed.includes(hash))
      .concat(added)
      .filter((hash, index, array) => array.indexOf(hash) === index);

    return { ...state, loading: false, hashes };
  }),
  on(setPageBlock, state => ({ ...state, saving: true })),
  on(pageBlockSet, state => ({ ...state, saving: false })),
  on(setPageBlockFailed, state => ({ ...state, saving: false }))
);
