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
  DeleteBlockedPagesState,
  initialState,
  reducer
} from './delete-blocked-pages.reducer';
import {
  BLOCKED_HASH_1,
  BLOCKED_HASH_3,
  BLOCKED_HASH_5
} from '@app/comic-pages/comic-pages.fixtures';
import {
  blockedPagesDeleted,
  deleteBlockedPages,
  deleteBlockedPagesFailed
} from '@app/comic-pages/actions/delete-blocked-pages.actions';

describe('DeleteBlockedPages Reducer', () => {
  const ENTRIES = [BLOCKED_HASH_1, BLOCKED_HASH_3, BLOCKED_HASH_5];

  let state: DeleteBlockedPagesState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the deleting flag', () => {
      expect(state.deleting).toBeFalse();
    });
  });

  describe('deleting blocked pages', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, deleting: false },
        deleteBlockedPages({ entries: ENTRIES })
      );
    });

    it('sets the deleting flag', () => {
      expect(state.deleting).toBeTrue();
    });
  });

  describe('when blocked pages are deleted', () => {
    beforeEach(() => {
      state = reducer({ ...state, deleting: true }, blockedPagesDeleted());
    });

    it('clears the deleting flag', () => {
      expect(state.deleting).toBeFalse();
    });
  });

  describe('deleting blocked pages', () => {
    beforeEach(() => {
      state = reducer({ ...state, deleting: true }, deleteBlockedPagesFailed());
    });

    it('clears the deleting flag', () => {
      expect(state.deleting).toBeFalse();
    });
  });
});
