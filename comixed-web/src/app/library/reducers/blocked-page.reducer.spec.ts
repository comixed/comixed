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
  pageBlockSet,
  setPageBlock,
  setPageBlockFailed
} from '@app/library/actions/blocked-page.actions';
import { PAGE_1 } from '@app/library/library.fixtures';

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

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
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
