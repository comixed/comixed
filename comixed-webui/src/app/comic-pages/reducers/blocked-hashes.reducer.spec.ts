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
  BlockedHashesState,
  initialState,
  reducer
} from './blocked-hashes.reducer';
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
} from '@app/comic-pages/actions/blocked-hashes.actions';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_2,
  BLOCKED_HASH_3,
  BLOCKED_HASH_4,
  BLOCKED_HASH_5,
  BLOCKED_PAGE_FILE,
  PAGE_2
} from '@app/comic-pages/comic-pages.fixtures';

describe('BlockedHashes Reducer', () => {
  const DOWNLOADED_FILE = BLOCKED_PAGE_FILE;
  const UPLOADED_FILE = {} as File;
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];
  const HASHES = ENTRIES.map(entry => entry.hash);
  const ENTRY = BLOCKED_HASH_4;
  const PAGE = PAGE_2;

  let state: BlockedHashesState;

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

    it('clears the not found flag', () => {
      expect(state.notFound).toBeFalse();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });

    it('has no entry', () => {
      expect(state.entry).toBeNull();
    });
  });

  describe('loading the blocked page list', () => {
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

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entries: [] },
          loadBlockedHashListSuccess({ entries: ENTRIES })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the entreis', () => {
        expect(state.entries).toEqual(ENTRIES);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, loadBlockedHashListFailure());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
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

  describe('loading a blocked hash', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false, notFound: true, saved: true },
        loadBlockedHashDetail({ hash: ENTRY.hash })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    it('clears the not found flag', () => {
      expect(state.notFound).toBeFalse();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, entry: null },
          loadBlockedHashDetailSuccess({ entry: ENTRY })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the entry', () => {
        expect(state.entry).toBe(ENTRY);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, notFound: false },
          loadBlockedHashDetailFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the not found flag', () => {
        expect(state.notFound).toBeTrue();
      });
    });
  });

  describe('saving a blocked hash', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false, saved: true },
        saveBlockedHash({ entry: ENTRY })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, entry: null, busy: true, saved: false },
          saveBlockedHashSuccess({ entry: ENTRY })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the saved flag', () => {
        expect(state.saved).toBeTrue();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, saveBlockedHashFailure());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
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

    describe('success', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, markPagesWithHashSuccess());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, busy: true }, markPagesWithHashFailure());
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('download the blocked pages list', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, downloadBlockedHashesFile());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('successful', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          downloadBlockedHashesFileSuccess({ document: BLOCKED_PAGE_FILE })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          downloadBlockedHashesFileFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('busy a file', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        uploadBlockedHashesFile({ file: UPLOADED_FILE })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          uploadBlockedHashesFileSuccess({ entries: ENTRIES })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          uploadBlockedHashesFileFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });

  describe('setting the blocked state', () => {
    describe('for one hash', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: false },
          setBlockedStateForHash({ hashes: [PAGE.hash], blocked: true })
        );
      });

      it('sets the busy flag', () => {
        expect(state.busy).toBeTrue();
      });
    });

    describe('for selected hashes', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: false },
          setBlockedStateForSelectedHashes({ blocked: true })
        );
      });

      it('sets the busy flag', () => {
        expect(state.busy).toBeTrue();
      });
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          setBlockedStateForHashSuccess()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          setBlockedStateForHashFailue()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
