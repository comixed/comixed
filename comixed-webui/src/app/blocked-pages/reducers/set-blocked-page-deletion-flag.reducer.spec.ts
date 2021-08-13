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
  reducer,
  SetBlockedPageDeletionFlagsState
} from './set-blocked-page-deletion-flag.reducer';
import {
  blockedPageDeletionFlagsSet,
  setBlockedPageDeletionFlags,
  setBlockedPageDeletionFlagsFailed
} from '@app/blocked-pages/actions/set-blocked-page-deletion-flag.actions';
import {
  BLOCKED_PAGE_1,
  BLOCKED_PAGE_2,
  BLOCKED_PAGE_3
} from '@app/blocked-pages/blocked-pages.fixtures';

describe('SetBlockedPageDeletionFlag Reducer', () => {
  const HASHES = [BLOCKED_PAGE_1, BLOCKED_PAGE_2, BLOCKED_PAGE_3].map(
    page => page.hash
  );

  let state: SetBlockedPageDeletionFlagsState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the default state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the marking flag', () => {
      expect(state.marking).toBeFalse();
    });
  });

  describe('marking pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, marking: false },
        setBlockedPageDeletionFlags({
          hashes: HASHES,
          deleted: Math.random() > 0.5
        })
      );
    });

    it('sets the marking flag', () => {
      expect(state.marking).toBeTrue();
    });
  });

  describe('success marking pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, marking: true },
        blockedPageDeletionFlagsSet()
      );
    });

    it('clears the marking flag', () => {
      expect(state.marking).toBeFalse();
    });
  });

  describe('failure making pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, marking: true },
        setBlockedPageDeletionFlagsFailed()
      );
    });

    it('clears the marking flag', () => {
      expect(state.marking).toBeFalse();
    });
  });
});
