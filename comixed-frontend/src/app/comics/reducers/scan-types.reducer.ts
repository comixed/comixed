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

import { Action, createReducer, on } from '@ngrx/store';
import {
  getScanTypes,
  getScanTypesFailed,
  scanTypesReceived
} from '../actions/scan-types.actions';
import { ScanType } from 'app/comics';

export const SCAN_TYPES_FEATURE_KEY = 'scan_types_state';

export interface ScanTypesState {
  fetching: boolean;
  loaded: boolean;
  types: ScanType[];
}

export const initialState: ScanTypesState = {
  fetching: false,
  loaded: false,
  types: []
};

const scanTypesReducer = createReducer(
  initialState,

  on(getScanTypes, state => ({ ...state, loaded: false, fetching: true })),
  on(scanTypesReceived, (state, action) => ({
    ...state,
    fetching: false,
    loaded: true,
    types: action.types
  })),
  on(getScanTypesFailed, state => ({
    ...state,
    fetching: false,
    loaded: false
  }))
);

export function reducer(state: ScanTypesState | undefined, action: Action) {
  return scanTypesReducer(state, action);
}
