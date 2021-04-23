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
  LastReadListState,
  reducer
} from './last-read-list.reducer';
import {
  LAST_READ_1,
  LAST_READ_2,
  LAST_READ_3,
  LAST_READ_4,
  LAST_READ_5
} from '@app/last-read/last-read.fixtures';
import {
  lastReadDateRemoved,
  lastReadDatesLoaded,
  lastReadDateUpdated,
  loadLastReadDates,
  loadLastReadDatesFailed,
  resetLastReadDates
} from '@app/last-read/actions/last-read-list.actions';

describe('LastReadList Reducer', () => {
  const ENTRIES = [LAST_READ_1, LAST_READ_3, LAST_READ_5];
  const LAST_ID = 17;

  let state: LastReadListState;

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

    it('clears the last payload flag', () => {
      expect(state.lastPayload).toBeFalse();
    });
  });

  describe('resetting the feature state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, entries: ENTRIES, lastPayload: true },
        resetLastReadDates()
      );
    });

    it('clears the last read entries', () => {
      expect(state.entries).toEqual([]);
    });

    it('clears the last payload flag', () => {
      expect(state.lastPayload).toBeFalse();
    });
  });

  describe('loading a block of last read dates', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadLastReadDates({ lastId: LAST_ID })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving a block of last read dates', () => {
    const BLOCK = [LAST_READ_2, LAST_READ_4];

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: true,
          entries: ENTRIES,
          lastPayload: false
        },
        lastReadDatesLoaded({ entries: BLOCK, lastPayload: true })
      );
    });

    it('maintains the previous last read dates', () => {
      ENTRIES.forEach(entry => expect(state.entries).toContain(entry));
    });

    it('adds the new entries', () => {
      BLOCK.forEach(entry => expect(state.entries).toContain(entry));
    });
  });

  describe('receiving a new last read date', () => {
    const ENTRY = LAST_READ_2;

    beforeEach(() => {
      state = reducer(
        { ...state, entries: ENTRIES },
        lastReadDateUpdated({ entry: ENTRY })
      );
    });

    it('maintains the previous last read dates', () => {
      ENTRIES.forEach(entry => expect(state.entries).toContain(entry));
    });

    it('adds the new entry', () => {
      expect(state.entries).toContain(ENTRY);
    });
  });

  describe('receiving an updated last read date', () => {
    const EXISTING = ENTRIES[1];
    const UPDATED = { ...EXISTING, lastRead: new Date().getTime() };

    beforeEach(() => {
      state = reducer(
        { ...state, entries: ENTRIES },
        lastReadDateUpdated({ entry: UPDATED })
      );
    });

    it('removes the existing entry', () => {
      expect(state.entries).not.toContain(EXISTING);
    });

    it('adds the updated entry', () => {
      expect(state.entries).toContain(UPDATED);
    });
  });

  describe('receiving a last read date removal', () => {
    const REMOVED = ENTRIES[2];

    beforeEach(() => {
      state = reducer(
        { ...state, entries: ENTRIES },
        lastReadDateRemoved({ entry: REMOVED })
      );
    });

    it('removes the entry', () => {
      expect(state.entries).not.toContain(REMOVED);
    });
  });

  describe('failure to load a block of last read dates', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadLastReadDatesFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });
});
