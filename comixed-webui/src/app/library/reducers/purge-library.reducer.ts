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
  libraryPurging,
  purgeLibrary,
  purgeLibraryFailed
} from '@app/library/actions/purge-library.actions';

export const PURGE_LIBRARY_FEATURE_KEY = 'purge_library_state';

export interface PurgeLibraryState {
  working: boolean;
}

export const initialState: PurgeLibraryState = {
  working: false
};

export const reducer = createReducer(
  initialState,

  on(purgeLibrary, state => ({ ...state, working: true })),
  on(libraryPurging, state => ({ ...state, working: false })),
  on(purgeLibraryFailed, state => ({ ...state, working: false }))
);
