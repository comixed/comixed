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
  CollectionListState,
  initialState,
  reducer
} from './collection-list.reducer';
import {
  COLLECTION_ENTRY_1,
  COLLECTION_ENTRY_2,
  COLLECTION_ENTRY_3,
  COLLECTION_ENTRY_4,
  COLLECTION_ENTRY_5
} from '@app/collections/collections.fixtures';
import {
  loadCollectionList,
  loadCollectionListFailure,
  loadCollectionListSuccess
} from '@app/collections/actions/collection-list.actions';
import { TagType } from '@app/collections/models/comic-collection.enum';

describe('CollectionList Reducer', () => {
  const COLLECTION_ENTRIES = [
    COLLECTION_ENTRY_1,
    COLLECTION_ENTRY_2,
    COLLECTION_ENTRY_3,
    COLLECTION_ENTRY_4,
    COLLECTION_ENTRY_5
  ];
  const TAG_TYPE = TagType.TEAMS;
  const PAGE_SIZE = 25;
  const PAGE_INDEX = 10;
  const SORT_BY = 'comic-count';
  const SORT_DIRECTION = 'desc';
  const TOTAL_ENTRIES = Math.floor(Math.random() * 1000);

  let state: CollectionListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no list of entries', () => {
      expect(state.entries).toEqual([]);
    });

    it('has no total count of entries', () => {
      expect(state.totalEntries).toEqual(0);
    });
  });

  describe('loading a page of entries', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        loadCollectionList({
          tagType: TAG_TYPE,
          pageIndex: PAGE_INDEX,
          pageSize: PAGE_SIZE,
          sortBy: SORT_BY,
          sortDirection: SORT_DIRECTION
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [], totalEntries: 0 },
          loadCollectionListSuccess({
            entries: COLLECTION_ENTRIES,
            totalEntries: TOTAL_ENTRIES
          })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('updates the entries', () => {
        expect(state.entries).toEqual(COLLECTION_ENTRIES);
      });

      it('updates the total number of entries', () => {
        expect(state.totalEntries).toEqual(TOTAL_ENTRIES);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: COLLECTION_ENTRIES },
          loadCollectionListFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('leaves the entries untouched', () => {
        expect(state.entries).toEqual(COLLECTION_ENTRIES);
      });
    });
  });
});
