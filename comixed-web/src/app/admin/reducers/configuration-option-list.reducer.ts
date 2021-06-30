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
  configurationOptionsLoaded,
  loadConfigurationOptions,
  loadConfigurationOptionsFailed
} from '../actions/configuration-option-list.actions';
import { ConfigurationOption } from '@app/admin/models/configuration-option';

export const CONFIGURATION_OPTION_LIST_FEATURE_KEY =
  'configuration_option_list_state';

export interface ConfigurationOptionListState {
  loading: boolean;
  saving: boolean;
  options: ConfigurationOption[];
}

export const initialState: ConfigurationOptionListState = {
  loading: false,
  saving: false,
  options: []
};

export const reducer = createReducer(
  initialState,

  on(loadConfigurationOptions, state => ({ ...state, loading: true })),
  on(configurationOptionsLoaded, (state, action) => ({
    ...state,
    loading: false,
    options: action.options
  })),
  on(loadConfigurationOptionsFailed, state => ({ ...state, loading: false }))
);
