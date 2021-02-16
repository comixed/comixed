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
  BlockedPageState,
  initialState,
  reducer
} from './blocked-page.reducer';
import {
  blockedPageHashesLoaded,
  pageBlockSet,
  resetBlockedPageHashes,
  setPageBlock,
  setPageBlockFailed
} from '@app/blocked-page/actions/blocked-page.actions';
import { PAGE_1, PAGE_2, PAGE_3 } from '@app/library/library.fixtures';

describe('BlockedPage Reducer', () => {
  const PAGE = PAGE_1;
  const BLOCKED = Math.random() > 0.5;

  let state: BlockedPageState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has no hashes', () => {
      expect(state.hashes).toEqual([]);
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('resetting the state', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          hashes: [PAGE.hash]
        },
        resetBlockedPageHashes()
      );
    });

    it('clears the hashes', () => {
      expect(state.hashes).toEqual([]);
    });
  });

  describe('receiving hashes', () => {
    const ADDED = PAGE_2.hash;
    const REMOVED = PAGE_3.hash;
    const UNTOUCHED = PAGE.hash;

    beforeEach(() => {
      state = reducer(
        {
          ...state,
          hashes: [REMOVED, UNTOUCHED]
        },
        blockedPageHashesLoaded({
          hashes: [`+${ADDED}`, `-${REMOVED}`]
        })
      );
    });

    it('removes marked hashes', () => {
      expect(state.hashes).not.toContain(REMOVED);
    });

    it('adds marked hashes', () => {
      expect(state.hashes).toContain(ADDED);
    });

    it('leaves untouched hashes alone', () => {
      expect(state.hashes).toContain(UNTOUCHED);
    });
  });

  describe('setting the blocked state for a page', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false },
        setPageBlock({ page: PAGE, blocked: BLOCKED })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });
  });

  describe('successfully setting the blocked state', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, pageBlockSet());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('failure to set the blocked state', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, setPageBlockFailed());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });
});
