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
import { SCAN_TYPE_1, SCAN_TYPE_3 } from '@app/library/library.fixtures';
import {
  resetScanTypes,
  scanTypeAdded
} from '@app/library/actions/scan-type.actions';

describe('ScanType Reducer', () => {
  const SCAN_TYPE = SCAN_TYPE_1;

  let state: ScanTypeState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has no scan types', () => {
      expect(state.scanTypes).toEqual([]);
    });
  });

  describe('loading the scan types', () => {
    beforeEach(() => {
      state = reducer({ ...state, scanTypes: [SCAN_TYPE] }, resetScanTypes());
    });

    it('clears the scan types', () => {
      expect(state.scanTypes).toEqual([]);
    });
  });

  describe('receiving a new scan type', () => {
    const EXISTING_SCAN_TYPE = SCAN_TYPE_1;
    const NEW_SCAN_TYPE = SCAN_TYPE_3;

    beforeEach(() => {
      state = reducer(
        { ...state, scanTypes: [EXISTING_SCAN_TYPE] },
        scanTypeAdded({ scanType: NEW_SCAN_TYPE })
      );
    });

    it('retains the existing scan type', () => {
      expect(state.scanTypes).toContain(EXISTING_SCAN_TYPE);
    });

    it('adds the new scan type', () => {
      expect(state.scanTypes).toContain(NEW_SCAN_TYPE);
    });
  });

  describe('receiving an updated scan type', () => {
    const EXISTING_SCAN_TYPE = SCAN_TYPE_1;
    const UPDATED_SCAN_TYPE = {
      ...EXISTING_SCAN_TYPE,
      name: EXISTING_SCAN_TYPE.name.substr(1)
    };

    beforeEach(() => {
      state = reducer(
        { ...state, scanTypes: [EXISTING_SCAN_TYPE] },
        scanTypeAdded({ scanType: UPDATED_SCAN_TYPE })
      );
    });

    it('removes the existing scan type', () => {
      expect(state.scanTypes).not.toContain(EXISTING_SCAN_TYPE);
    });

    it('adds the updated scan type', () => {
      expect(state.scanTypes).toContain(UPDATED_SCAN_TYPE);
    });
  });
});
