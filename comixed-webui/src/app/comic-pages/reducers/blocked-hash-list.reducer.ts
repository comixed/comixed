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
  blockedHashListLoaded,
  blockedHashRemoved,
  blockedHashUpdated,
  loadBlockedHashList,
  loadBlockedHashListFailed,
  markPagesWithHash,
  markPagesWithHashFailed,
  pagesWithHashMarked
} from '../actions/blocked-hash-list.actions';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';

export const BLOCKED_HASH_LIST_FEATURE_KEY = 'blocked_hash_list_state';

export interface BlockedHashListState {
  busy: boolean;
  entries: BlockedHash[];
}

export const initialState: BlockedHashListState = {
  busy: false,
  entries: []
};

export const reducer = createReducer(
  initialState,

  on(loadBlockedHashList, state => ({ ...state, busy: true, entries: [] })),
  on(blockedHashListLoaded, (state, action) => ({
    ...state,
    busy: false,
    entries: action.entries
  })),
  on(loadBlockedHashListFailed, state => ({ ...state, busy: false })),
  on(blockedHashUpdated, (state, action) => {
    const entries = state.entries.filter(entry => entry.id !== action.entry.id);
    entries.push(action.entry);
    return { ...state, entries };
  }),
  on(blockedHashRemoved, (state, action) => {
    const entries = state.entries.filter(
      entry => entry.hash !== action.entry.hash
    );
    return { ...state, entries };
  }),
  on(markPagesWithHash, state => ({ ...state, busy: true })),
  on(pagesWithHashMarked, state => ({ ...state, busy: false })),
  on(markPagesWithHashFailed, state => ({ ...state, busy: false }))
);
