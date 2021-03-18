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
import {
  importCountUpdated,
  startImportCount,
  stopImportCount
} from '../actions/import-count.actions';

export const IMPORT_COUNT_FEATURE_KEY = 'import_count_state';

export interface ImportCountState {
  active: boolean;
  count: number;
}

export const initialState: ImportCountState = {
  active: false,
  count: 0
};

export const reducer = createReducer(
  initialState,

  on(startImportCount, state => ({ ...state, active: true, count: 0 })),
  on(importCountUpdated, (state, action) => ({
    ...state,
    count: action.count
  })),
  on(stopImportCount, state => ({ ...state, active: false, count: 0 }))
);
