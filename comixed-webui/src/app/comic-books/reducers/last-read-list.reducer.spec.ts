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
  LAST_READ_5
} from '@app/comic-books/comic-books.fixtures';
import {
  lastReadDateRemoved,
  lastReadDateUpdated,
  loadUnreadComicBookCount,
  loadUnreadComicBookCountFailure,
  loadUnreadComicBookCountSuccess,
  resetLastReadList,
  setLastReadList
} from '@app/comic-books/actions/last-read-list.actions';

describe('LastReadList Reducer', () => {
  const UNREAD_COUNT = 416;
  const ENTRIES = [LAST_READ_1, LAST_READ_3, LAST_READ_5];

  let state: LastReadListState;

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

    it('has an unread count of 0', () => {
      expect(state.unreadCount).toEqual(0);
    });

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('resetting the feature state', () => {
    beforeEach(() => {
      state = reducer({ ...state, entries: ENTRIES }, resetLastReadList());
    });

    it('resets the unread count', () => {
      expect(state.unreadCount).toEqual(0);
    });

    it('clears the last read entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('loading the unread comic book count', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadUnreadComicBookCount());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          loadUnreadComicBookCountSuccess({ unreadCount: UNREAD_COUNT })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the unread count', () => {
        expect(state.unreadCount).toEqual(UNREAD_COUNT);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          loadUnreadComicBookCountFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('setting the last read list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, entries: [] },
        setLastReadList({ entries: ENTRIES })
      );
    });

    it('replaces the entries', () => {
      expect(state.entries).toEqual(ENTRIES);
    });
  });

  describe('receiving a new last read update', () => {
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
});
