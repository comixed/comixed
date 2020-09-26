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

import { selectScanTypes, selectScanTypesState } from './scan-types.selectors';
import {
  SCAN_TYPES_FEATURE_KEY,
  ScanTypesState
} from 'app/comics/reducers/scan-types.reducer';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3,
  SCAN_TYPE_4,
  SCAN_TYPE_5
} from 'app/comics/comics.fixtures';

describe('ScanTypes Selectors', () => {
  const SCAN_TYPES = [
    SCAN_TYPE_1,
    SCAN_TYPE_2,
    SCAN_TYPE_3,
    SCAN_TYPE_4,
    SCAN_TYPE_5
  ];

  let state: ScanTypesState;

  beforeEach(() => {
    state = {
      fetching: Math.random() * 100 > 50,
      loaded: Math.random() * 100 > 50,
      types: SCAN_TYPES
    };
  });

  it('selects the feature state', () => {
    expect(
      selectScanTypesState({
        [SCAN_TYPES_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects the scan types', () => {
    console.log('*** DLP state 4:', state);
    expect(
      selectScanTypes({
        [SCAN_TYPES_FEATURE_KEY]: state
      })
    ).toEqual(state.types);
  });
});
