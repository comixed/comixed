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
  BlockedHashListState,
  initialState,
  reducer
} from './blocked-hash-list.reducer';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_2,
  BLOCKED_HASH_3,
  BLOCKED_HASH_5
} from '@app/comic-pages/comic-pages.fixtures';
import {
  blockedHashListLoaded,
  blockedHashRemoved,
  blockedHashUpdated,
  loadBlockedHashList,
  loadBlockedHashListFailed,
  markPagesWithHash,
  markPagesWithHashFailed,
  pagesWithHashMarked
} from '@app/comic-pages/actions/blocked-hash-list.actions';

describe('BlockedHashList Reducer', () => {
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];
  const HASHES = ENTRIES.map(entry => entry.hash);

  let state: BlockedHashListState;

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

    it('has no entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('busy the blocked page list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false, entries: ENTRIES },
        loadBlockedHashList()
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    it('clears the entries', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('receiving the blocked page list', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, entries: [] },
        blockedHashListLoaded({ entries: ENTRIES })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the entreis', () => {
      expect(state.entries).toEqual(ENTRIES);
    });
  });

  describe('failure to load the blocked pages', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, loadBlockedHashListFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('receiving a new entry', () => {
    const NEW_ENTRY = BLOCKED_HASH_2;

    beforeEach(() => {
      state = reducer(
        { ...state, entries: ENTRIES },
        blockedHashUpdated({ entry: NEW_ENTRY })
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
        blockedHashUpdated({ entry: UPDATED_ENTRY })
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
        blockedHashRemoved({ entry: REMOVED_ENTRY })
      );
    });

    it('removes the entry', () => {
      expect(state.entries).not.toContain(REMOVED_ENTRY);
    });
  });

  describe('marking pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        markPagesWithHash({
          hashes: HASHES,
          deleted: Math.random() > 0.5
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('success marking pages', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, pagesWithHashMarked());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('failure marking pages', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, markPagesWithHashFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
