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
  blockedHashRemoved,
  blockedHashUpdated,
  downloadBlockedHashesFile,
  downloadBlockedHashesFileFailure,
  downloadBlockedHashesFileSuccess,
  loadBlockedHashDetail,
  loadBlockedHashDetailFailure,
  loadBlockedHashDetailSuccess,
  loadBlockedHashList,
  loadBlockedHashListFailure,
  loadBlockedHashListSuccess,
  markPagesWithHash,
  markPagesWithHashFailure,
  markPagesWithHashSuccess,
  saveBlockedHash,
  saveBlockedHashFailure,
  saveBlockedHashSuccess,
  setBlockedStateForHash,
  setBlockedStateForHashFailue,
  setBlockedStateForHashSuccess,
  setBlockedStateForSelectedHashes,
  uploadBlockedHashesFile,
  uploadBlockedHashesFileFailure,
  uploadBlockedHashesFileSuccess
} from '../actions/blocked-hashes.actions';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';

export const BLOCKED_HASHES_FEATURE_KEY = 'blocked_hashes_state';

export interface BlockedHashesState {
  busy: boolean;
  entries: BlockedHash[];
  notFound: boolean;
  entry: BlockedHash;
  saved: boolean;
}

export const initialState: BlockedHashesState = {
  busy: false,
  entries: [],
  notFound: false,
  entry: null,
  saved: false
};

export const reducer = createReducer(
  initialState,

  on(loadBlockedHashList, state => ({ ...state, busy: true, entries: [] })),
  on(loadBlockedHashListSuccess, (state, action) => ({
    ...state,
    busy: false,
    entries: action.entries
  })),
  on(loadBlockedHashListFailure, state => ({ ...state, busy: false })),
  on(blockedHashUpdated, (state, action) => {
    const entries = state.entries.filter(
      entry => entry.blockedHashId !== action.entry.blockedHashId
    );
    entries.push(action.entry);
    return { ...state, entries };
  }),
  on(blockedHashRemoved, (state, action) => {
    const entries = state.entries.filter(
      entry => entry.hash !== action.entry.hash
    );
    return { ...state, entries };
  }),

  on(loadBlockedHashDetail, state => ({
    ...state,
    busy: true,
    notFound: false,
    saved: false
  })),
  on(loadBlockedHashDetailSuccess, (state, action) => ({
    ...state,
    busy: false,
    entry: action.entry
  })),
  on(loadBlockedHashDetailFailure, state => ({
    ...state,
    busy: false,
    notFound: true
  })),
  on(saveBlockedHash, state => ({ ...state, busy: true, saved: false })),
  on(saveBlockedHashSuccess, (state, action) => ({
    ...state,
    entry: action.entry,
    busy: false,
    saved: true
  })),
  on(saveBlockedHashFailure, state => ({ ...state, busy: false })),
  on(markPagesWithHash, state => ({ ...state, busy: true })),
  on(markPagesWithHashSuccess, state => ({ ...state, busy: false })),
  on(markPagesWithHashFailure, state => ({ ...state, busy: false })),
  on(downloadBlockedHashesFile, state => ({ ...state, busy: true })),
  on(downloadBlockedHashesFileSuccess, state => ({
    ...state,
    busy: false
  })),
  on(downloadBlockedHashesFileFailure, state => ({
    ...state,
    busy: false
  })),
  on(uploadBlockedHashesFile, state => ({ ...state, busy: true })),
  on(uploadBlockedHashesFileSuccess, state => ({ ...state, busy: false })),
  on(uploadBlockedHashesFileFailure, state => ({ ...state, busy: false })),
  on(setBlockedStateForSelectedHashes, state => ({ ...state, busy: true })),
  on(setBlockedStateForHash, state => ({ ...state, busy: true })),
  on(setBlockedStateForHashSuccess, state => ({ ...state, busy: false })),
  on(setBlockedStateForHashFailue, state => ({ ...state, busy: false }))
);

export const blockedHashesFeature = createFeature({
  name: BLOCKED_HASHES_FEATURE_KEY,
  reducer
});
