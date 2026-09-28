/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  loadCollectionList,
  loadCollectionListFailure,
  loadCollectionListSuccess
} from '../actions/collection-list.actions';
import { CollectionEntry } from '@app/collections/models/collection-entry';

export const COLLECTION_LIST_FEATURE_KEY = 'collection_list_state';

export interface CollectionListState {
  busy: boolean;
  entries: CollectionEntry[];
  totalEntries: number;
}

export const initialState: CollectionListState = {
  busy: false,
  entries: [],
  totalEntries: 0
};

export const reducer = createReducer(
  initialState,
  on(loadCollectionList, state => ({ ...state, busy: true })),
  on(loadCollectionListSuccess, (state, action) => ({
    ...state,
    busy: false,
    entries: action.entries,
    totalEntries: action.totalEntries
  })),
  on(loadCollectionListFailure, state => ({ ...state, busy: false }))
);

export const collectionListFeature = createFeature({
  name: COLLECTION_LIST_FEATURE_KEY,
  reducer
});
