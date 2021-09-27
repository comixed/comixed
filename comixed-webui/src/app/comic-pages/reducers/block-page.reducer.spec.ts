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

import { BlockPageState, initialState, reducer } from './block-page.reducer';
import { PAGE_2 } from '@app/comic-book/comic-book.fixtures';
import {
  blockedStateSet,
  setBlockedState,
  setBlockedStateFailed
} from '@app/comic-pages/actions/block-page.actions';

describe('BlockPage Reducer', () => {
  const PAGE = PAGE_2;

  let state: BlockPageState;

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

  describe('setting the blocked state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false },
        setBlockedState({ hashes: [PAGE.hash], blocked: true })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });
  });

  describe('successfully setting the blocked state', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, blockedStateSet());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('failure setting the blocked state', () => {
    beforeEach(() => {
      state = reducer({ ...state, saving: true }, setBlockedStateFailed());
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });
});
