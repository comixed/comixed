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

import {
  initialState,
  ReadingListsState,
  reducer
} from './reading-lists.reducer';
import {
  READING_LIST_1,
  READING_LIST_3,
  READING_LIST_5
} from '@app/lists/lists.fixtures';
import {
  loadReadingLists,
  loadReadingListsFailed,
  readingListsLoaded
} from '@app/lists/actions/reading-lists.actions';

describe('ReadingLists Reducer', () => {
  const READING_LISTS = [READING_LIST_1, READING_LIST_3, READING_LIST_5];

  let state: ReadingListsState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('fetching all reading lists for a user', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, loadReadingLists());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving all reading lists for a user', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, entries: [] },
        readingListsLoaded({ entries: READING_LISTS })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the reading list entries', () => {
      expect(state.entries).toEqual(READING_LISTS);
    });
  });

  describe('failure to load the reading lists', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadReadingListsFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });
});
