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

import { createFeature, createReducer, on } from '@ngrx/store';
import {
  configurationOptionsSaved,
  saveConfigurationOptions,
  saveConfigurationOptionsFailed
} from '../actions/save-configuration-options.actions';

export const SAVE_CONFIGURATION_OPTIONS_FEATURE_KEY =
  'save_configuration_options_state';

export interface SaveConfigurationOptionsState {
  saving: boolean;
}

export const initialState: SaveConfigurationOptionsState = {
  saving: false
};

export const reducer = createReducer(
  initialState,

  on(saveConfigurationOptions, state => ({ ...state, saving: true })),
  on(configurationOptionsSaved, state => ({ ...state, saving: false })),
  on(saveConfigurationOptionsFailed, state => ({ ...state, saving: false }))
);

export const saveConfigurationOptionsFeature = createFeature({
  name: SAVE_CONFIGURATION_OPTIONS_FEATURE_KEY,
  reducer
});
