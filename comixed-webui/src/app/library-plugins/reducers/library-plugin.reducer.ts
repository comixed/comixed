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
  clearCurrentLibraryPlugin,
  createLibraryPlugin,
  createLibraryPluginFailure,
  createLibraryPluginSuccess,
  deleteLibraryPlugin,
  deleteLibraryPluginFailure,
  deleteLibraryPluginSuccess,
  loadLibraryPlugins,
  loadLibraryPluginsFailure,
  loadLibraryPluginsSuccess,
  setCurrentLibraryPlugin,
  updateLibraryPlugin,
  updateLibraryPluginFailure,
  updateLibraryPluginSuccess
} from '../actions/library-plugin.actions';
import { LibraryPlugin } from '@app/library-plugins/models/library-plugin';

export const LIBRARY_PLUGIN_FEATURE_KEY = 'plugin_list_state';

export interface LibraryPluginState {
  busy: boolean;
  list: LibraryPlugin[];
  current: LibraryPlugin;
}

export const initialState: LibraryPluginState = {
  busy: false,
  list: [],
  current: null
};

export const reducer = createReducer(
  initialState,
  on(loadLibraryPlugins, state => ({ ...state, busy: true })),
  on(loadLibraryPluginsSuccess, (state, action) => ({
    ...state,
    busy: false,
    list: action.plugins
  })),
  on(loadLibraryPluginsFailure, state => ({
    ...state,
    busy: false,
    list: []
  })),
  on(setCurrentLibraryPlugin, (state, action) => ({
    ...state,
    current: action.plugin
  })),
  on(clearCurrentLibraryPlugin, state => ({ ...state, current: null })),
  on(createLibraryPlugin, state => ({ ...state, busy: true })),
  on(createLibraryPluginSuccess, (state, action) => ({
    ...state,
    busy: false,
    current: action.plugin
  })),
  on(createLibraryPluginFailure, state => ({ ...state, busy: false })),
  on(updateLibraryPlugin, state => ({ ...state, busy: true })),
  on(updateLibraryPluginSuccess, (state, action) => ({
    ...state,
    busy: false,
    current: action.plugin
  })),
  on(updateLibraryPluginFailure, state => ({ ...state, busy: false })),
  on(deleteLibraryPlugin, state => ({ ...state, busy: true })),
  on(deleteLibraryPluginSuccess, state => ({
    ...state,
    busy: false,
    current: null
  })),
  on(deleteLibraryPluginFailure, state => ({ ...state, busy: false }))
);

export const libraryPluginFeature = createFeature({
  name: LIBRARY_PLUGIN_FEATURE_KEY,
  reducer
});
