/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { createFeature, createReducer, on } from '@ngrx/store';
import {
  runLibraryPluginFailure,
  runLibraryPluginOnOneComicBook,
  runLibraryPluginOnSelectedComicBooks,
  runLibraryPluginSuccess
} from '../actions/run-library-plugin.actions';

export const RUN_LIBRARY_PLUGIN_FEATURE_KEY = 'run_library_plugin_state';

export interface RunLibraryPluginState {
  busy: boolean;
}

export const initialState: RunLibraryPluginState = {
  busy: false
};

export const reducer = createReducer(
  initialState,
  on(runLibraryPluginOnOneComicBook, state => ({ ...state, busy: true })),
  on(runLibraryPluginOnSelectedComicBooks, state => ({ ...state, busy: true })),
  on(runLibraryPluginSuccess, state => ({ ...state, busy: false })),
  on(runLibraryPluginFailure, state => ({ ...state, busy: false }))
);

export const runLibraryPluginFeature = createFeature({
  name: RUN_LIBRARY_PLUGIN_FEATURE_KEY,
  reducer
});
