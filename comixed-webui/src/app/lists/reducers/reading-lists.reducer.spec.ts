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
  READING_LIST_2,
  READING_LIST_3,
  READING_LIST_5
} from '@app/lists/lists.fixtures';
import {
  deleteReadingLists,
  deleteReadingListsFailed,
  loadReadingLists,
  loadReadingListsFailed,
  readingListRemoved,
  readingListsDeleted,
  readingListsLoaded,
  readingListUpdate
} from '@app/lists/actions/reading-lists.actions';
import { ReadingList } from '@app/lists/models/reading-list';

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

    it('clears the deleting flag', () => {
      expect(state.deleting).toBeFalse();
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

  describe('deleting reading lists', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deleting: false },
        deleteReadingLists({ lists: READING_LISTS })
      );
    });

    it('sets the deleting flag', () => {
      expect(state.deleting).toBeTrue();
    });
  });

  describe('successfully deleting reading lists', () => {
    beforeEach(() => {
      state = reducer({ ...state, deleting: true }, readingListsDeleted());
    });

    it('clears the deleting flag', () => {
      expect(state.deleting).toBeFalse();
    });
  });

  describe('failure deleting reading lists', () => {
    beforeEach(() => {
      state = reducer({ ...state, deleting: true }, deleteReadingListsFailed());
    });

    it('clears the deleting flag', () => {
      expect(state.deleting).toBeFalse();
    });
  });

  describe('a reading list was removed', () => {
    const REMOVED = READING_LISTS[1];

    beforeEach(() => {
      state = reducer(
        { ...state, entries: READING_LISTS },
        readingListRemoved({ list: REMOVED })
      );
    });

    it('removes the reading list', () => {
      expect(state.entries).not.toContain(REMOVED);
    });

    it('keeps the other entries', () => {
      expect(state.entries).toEqual(
        READING_LISTS.filter(entry => entry.id !== REMOVED.id)
      );
    });
  });

  describe('a reading list was added', () => {
    const LIST = READING_LIST_2;

    beforeEach(() => {
      state = reducer(
        { ...state, entries: READING_LISTS },
        readingListUpdate({ list: LIST })
      );
    });

    it('adds the new entry', () => {
      expect(state.entries).toContain(LIST);
    });
  });

  describe('a reading list was updated', () => {
    const ORIGINAL = READING_LISTS[0];
    const UPDATE = { ...ORIGINAL, name: 'updated' } as ReadingList;

    beforeEach(() => {
      state = reducer(
        { ...state, entries: READING_LISTS },
        readingListUpdate({ list: UPDATE })
      );
    });

    it('removes the previous list entry', () => {
      expect(state.entries).not.toContain(ORIGINAL);
    });

    it('adds the update', () => {
      expect(state.entries).toContain(UPDATE);
    });
  });
});
