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
  ConsolidateLibraryState,
  initialState,
  reducer
} from './consolidate-library.reducer';
import {
  libraryConsolidationStarted,
  startLibraryConsolidation,
  startLibraryConsolidationFailed
} from '@app/library/actions/consolidate-library.actions';

describe('ConsolidateLibrary Reducer', () => {
  const IDS = [1000, 1001, 1002, 1003];

  let state: ConsolidateLibraryState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the sending flag', () => {
      expect(state.sending).toBeFalse();
    });
  });

  describe('starting consolidation', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, sending: false },
        startLibraryConsolidation()
      );
    });

    it('sets the sending flag', () => {
      expect(state.sending).toBeTrue();
    });
  });

  describe('success starting consolidation', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, sending: true },
        libraryConsolidationStarted()
      );
    });

    it('clears the sending flag', () => {
      expect(state.sending).toBeFalse();
    });
  });

  describe('failure starting consolidation', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, sending: true },
        startLibraryConsolidationFailed()
      );
    });

    it('clears the sending flag', () => {
      expect(state.sending).toBeFalse();
    });
  });
});
