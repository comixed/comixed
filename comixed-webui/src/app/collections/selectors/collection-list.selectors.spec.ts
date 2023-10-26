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

import {
  COLLECTION_LIST_FEATURE_KEY,
  CollectionListState
} from '../reducers/collection-list.reducer';
import {
  selectCollectionListEntries,
  selectCollectionListState,
  selectCollectionListTotalEntries
} from './collection-list.selectors';
import {
  COLLECTION_ENTRY_1,
  COLLECTION_ENTRY_2,
  COLLECTION_ENTRY_3,
  COLLECTION_ENTRY_4,
  COLLECTION_ENTRY_5
} from '@app/collections/collections.fixtures';

describe('CollectionList Selectors', () => {
  const COLLECTION_ENTRIES = [
    COLLECTION_ENTRY_1,
    COLLECTION_ENTRY_2,
    COLLECTION_ENTRY_3,
    COLLECTION_ENTRY_4,
    COLLECTION_ENTRY_5
  ];
  const TOTAL_ENTRIES = Math.floor(Math.random() * 1000);

  let state: CollectionListState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      entries: COLLECTION_ENTRIES,
      totalEntries: TOTAL_ENTRIES
    };
  });

  it('should select the feature state', () => {
    expect(
      selectCollectionListState({
        [COLLECTION_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the list of collection entries', () => {
    expect(
      selectCollectionListEntries({
        [COLLECTION_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });

  it('should select the total number of entries', () => {
    expect(
      selectCollectionListTotalEntries({
        [COLLECTION_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.totalEntries);
  });
});
