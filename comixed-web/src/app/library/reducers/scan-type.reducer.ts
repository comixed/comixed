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

import { createReducer, on } from '@ngrx/store';
import { resetScanTypes, scanTypeAdded } from '../actions/scan-type.actions';
import { ScanType } from '@app/library';

export const SCAN_TYPE_FEATURE_KEY = 'scan_type_state';

export interface ScanTypeState {
  scanTypes: ScanType[];
}

export const initialState: ScanTypeState = {
  scanTypes: []
};

export const reducer = createReducer(
  initialState,

  on(resetScanTypes, state => ({ ...state, scanTypes: [] })),
  on(scanTypeAdded, (state, action) => {
    const scanTypes = state.scanTypes.filter(
      scanType => scanType.id !== action.scanType.id
    );
    scanTypes.push(action.scanType);
    return {
      ...state,
      scanTypes
    };
  })
);