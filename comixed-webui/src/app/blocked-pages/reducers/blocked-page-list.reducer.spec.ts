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
  BlockedPageListState,
  initialState,
  reducer
} from './blocked-page-list.reducer';
import {
  BLOCKED_PAGE_1,
  BLOCKED_PAGE_2,
  BLOCKED_PAGE_3,
  BLOCKED_PAGE_5
} from '@app/blocked-pages/blocked-pages.fixtures';
import {
  blockedPageListLoaded,
  blockedPageListRemoval,
  blockedPageListUpdated,
  loadBlockedPageList,
  loadBlockedPageListFailed
} from '@app/blocked-pages/actions/blocked-page-list.actions';

describe('BlockedPageList Reducer', () => {
  const ENTRIES = [BLOCKED_PAGE_1, BLOCKED_PAGE_3, BLOCKED_PAGE_5];

  let state: BlockedPageListState;

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

  describe('loading the blocked page list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false, entries: ENTRIES },
        loadBlockedPageList()
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });

    it('clears the entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('receiving the blocked page list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, entries: [] },
        blockedPageListLoaded({ entries: ENTRIES })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the entreis', () => {
      expect(state.entries).toEqual(ENTRIES);
    });
  });

  describe('failure to load the blocked pages', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadBlockedPageListFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });

  describe('receiving a new entry', () => {
    const NEW_ENTRY = BLOCKED_PAGE_2;

    beforeEach(() => {
      state = reducer(
        { ...state, entries: ENTRIES },
        blockedPageListUpdated({ entry: NEW_ENTRY })
      );
    });

    it('adds the new entries', () => {
      expect(state.entries).toContain(NEW_ENTRY);
    });

    it('maintains the existing entries', () => {
      ENTRIES.forEach(entry => expect(state.entries).toContain(entry));
    });
  });

  describe('receiving an updated entry', () => {
    const ORIGINAL_ENTRY = ENTRIES[1];
    const UPDATED_ENTRY = {
      ...ORIGINAL_ENTRY,
      label: ORIGINAL_ENTRY.label.substr(1)
    };

    beforeEach(() => {
      state = reducer(
        { ...state, entries: ENTRIES },
        blockedPageListUpdated({ entry: UPDATED_ENTRY })
      );
    });

    it('removes the original entry', () => {
      expect(state.entries).not.toContain(ORIGINAL_ENTRY);
    });

    it('adds the updated entry', () => {
      expect(state.entries).toContain(UPDATED_ENTRY);
    });
  });

  describe('when an entry has been removed', () => {
    const REMOVED_ENTRY = ENTRIES[1];

    beforeEach(() => {
      state = reducer(
        { ...state, entries: ENTRIES },
        blockedPageListRemoval({ entry: REMOVED_ENTRY })
      );
    });

    it('removes the entry', () => {
      expect(state.entries).not.toContain(REMOVED_ENTRY);
    });
  });
});
