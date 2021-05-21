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

import { initialState, reducer, ScanTypeState } from './scan-type.reducer';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3
} from '@app/comic-book/comic-book.fixtures';
import {
  loadScanTypes,
  loadScanTypesFailed,
  scanTypesLoaded
} from '@app/comic-book/actions/scan-type.actions';

describe('ScanType Reducer', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_2, SCAN_TYPE_3];

  let state: ScanTypeState;

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

    it('clears the loaded flag', () => {
      expect(state.loaded).toBeFalse();
    });

    it('has no scan types', () => {
      expect(state.scanTypes).toEqual([]);
    });
  });

  describe('loading the scan types', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, loadScanTypes());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('receiving the scan types', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          loading: true,
          loaded: false,
          scanTypes: []
        },
        scanTypesLoaded({ scanTypes: SCAN_TYPES })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the loaded flag', () => {
      expect(state.loaded).toBeTrue();
    });

    it('sets the scan types', () => {
      expect(state.scanTypes).toEqual(SCAN_TYPES);
    });
  });

  describe('failure to load the scan types', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, loaded: true },
        loadScanTypesFailed()
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('clears the loaded flag', () => {
      expect(state.loaded).toBeFalse();
    });
  });
});
