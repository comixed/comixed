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
  BlockedPageDetailState,
  initialState,
  reducer
} from './blocked-page-detail.reducer';
import { BLOCKED_HASH_4 } from '@app/comic-pages/comic-pages.fixtures';
import {
  blockedPageLoaded,
  blockedPageSaved,
  loadBlockedPageByHash,
  loadBlockedPageFailed,
  saveBlockedPage,
  saveBlockedPageFailed
} from '@app/comic-pages/actions/blocked-page-detail.actions';

describe('BlockedPageDetail Reducer', () => {
  const ENTRY = BLOCKED_HASH_4;

  let state: BlockedPageDetailState;

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

    it('clears the not found flag', () => {
      expect(state.notFound).toBeFalse();
    });

    it('has no entry', () => {
      expect(state.entry).toBeNull();
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });
  });

  describe('loading a blocked page by hash', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false, notFound: true, saved: true },
        loadBlockedPageByHash({ hash: ENTRY.hash })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });

    it('clears the not found flag', () => {
      expect(state.notFound).toBeFalse();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });
  });

  describe('receiving a blocked page', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, entry: null },
        blockedPageLoaded({ entry: ENTRY })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the entry', () => {
      expect(state.entry).toBe(ENTRY);
    });
  });

  describe('failure to load a blocked page', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, notFound: false },
        loadBlockedPageFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the not found flag', () => {
      expect(state.notFound).toBeTrue();
    });
  });

  describe('saving a blocked page', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false, saved: true },
        saveBlockedPage({ entry: ENTRY })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });

    it('clears the saved flag', () => {
      expect(state.saved).toBeFalse();
    });
  });

  describe('successfully saving a blocked page', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, entry: null, saving: true, saved: false },
        blockedPageSaved({ entry: ENTRY })
      );
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });

    it('sets the saved flag', () => {
      expect(state.saved).toBeTrue();
    });
  });

  describe('failure to save a blocked page', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, saveBlockedPageFailed());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });
});
