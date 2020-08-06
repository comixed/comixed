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

import { PluginActions, PluginActionTypes } from '../actions/plugin.actions';
import { PluginDescriptor } from 'app/library/models/plugin-descriptor';

export const PLUGIN_FEATURE_KEY = 'plugin_state';

export interface PluginState {
  loading: boolean;
  plugins: PluginDescriptor[];
}

export const initialState: PluginState = {
  loading: false,
  plugins: []
};

export function reducer(
  state = initialState,
  action: PluginActions
): PluginState {
  switch (action.type) {
    case PluginActionTypes.GetAll:
      return { ...state, loading: true };

    case PluginActionTypes.AllReceived:
      return {
        ...state,
        loading: false,
        plugins: action.payload.pluginDescriptors
      };

    case PluginActionTypes.GetAllFailed:
      return { ...state, loading: false };

    case PluginActionTypes.Reload:
      return { ...state, loading: true };

    case PluginActionTypes.Reloaded:
      return {
        ...state,
        loading: false,
        plugins: action.payload.pluginDescriptors
      };

    case PluginActionTypes.ReloadFailed:
      return { ...state, loading: false };

    default:
      return state;
  }
}
