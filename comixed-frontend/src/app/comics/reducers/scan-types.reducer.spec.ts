/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { initialState, reducer, ScanTypesState } from './scan-types.reducer';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3,
  SCAN_TYPE_4,
  SCAN_TYPE_5
} from 'app/comics/comics.fixtures';
import {
  getScanTypes,
  getScanTypesFailed,
  scanTypesReceived
} from 'app/comics/actions/scan-types.actions';

describe('ScanTypes Reducer', () => {
  const SCAN_TYPES = [
    SCAN_TYPE_1,
    SCAN_TYPE_2,
    SCAN_TYPE_3,
    SCAN_TYPE_4,
    SCAN_TYPE_5
  ];

  let state: ScanTypesState;

  beforeEach(() => {
    state = initialState;
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the fetching state', () => {
      expect(state.fetching).toBeFalsy();
    });

    it('clears the loaded state', () => {
      expect(state.loaded).toBeFalsy();
    });

    it('has no types', () => {
      expect(state.types).toEqual([]);
    });
  });

  describe('fetching the list of scan types', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching: false, loaded: true },
        getScanTypes()
      );
    });

    it('clears the loaded state', () => {
      expect(state.loaded).toBeFalsy();
    });

    it('sets the fetching flag', () => {
      expect(state.fetching).toBeTruthy();
    });
  });

  describe('receiving the list of scan types', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching: true, loaded: false, types: [] },
        scanTypesReceived({ types: SCAN_TYPES })
      );
    });

    it('clears the fetching flag', () => {
      expect(state.fetching).toBeFalsy();
    });

    it('sets the loaded flag', () => {
      expect(state.loaded).toBeTruthy();
    });

    it('sets the list of scan types', () => {
      expect(state.types).toEqual(SCAN_TYPES);
    });
  });

  describe('failure to load the list of scan types', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, fetching: true, loaded: true },
        getScanTypesFailed()
      );
    });

    it('clears the fetching flag', () => {
      expect(state.fetching).toBeFalsy();
    });

    it('clears the loaded flag', () => {
      expect(state.loaded).toBeFalsy();
    });
  });
});
