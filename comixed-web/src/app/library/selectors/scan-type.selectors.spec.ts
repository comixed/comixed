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
  SCAN_TYPE_FEATURE_KEY,
  ScanTypeState
} from '../reducers/scan-type.reducer';
import { selectScanTypes, selectScanTypeState } from './scan-type.selectors';
import {
  SCAN_TYPE_1,
  SCAN_TYPE_3,
  SCAN_TYPE_5,
  SCAN_TYPE_7
} from '@app/library/library.fixtures';

describe('ScanType Selectors', () => {
  const SCAN_TYPES = [SCAN_TYPE_1, SCAN_TYPE_3, SCAN_TYPE_5, SCAN_TYPE_7];

  let state: ScanTypeState;

  beforeEach(() => {
    state = { scanTypes: SCAN_TYPES };
  });

  it('should select the feature state', () => {
    expect(
      selectScanTypeState({
        [SCAN_TYPE_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the scan types', () => {
    expect(selectScanTypes({ [SCAN_TYPE_FEATURE_KEY]: state })).toEqual(
      SCAN_TYPES
    );
  });
});
