/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ConfigurationOption } from '@app/settings/models/configuration-option';
import { ConfigurationActions } from '@app/settings/actions/configuration.actions';

export const CONFIGURATION_FEATURE_KEY = 'configuration_state';

export interface ConfigurationState extends EntityState<ConfigurationOption> {
  busy: boolean;
}

export const configurationAdapter: EntityAdapter<ConfigurationOption> =
  createEntityAdapter<ConfigurationOption>({
    selectId: option => option.name,
    sortComparer: (left, right) => left.name.localeCompare(right.name)
  });

export const initialConfigurationState: ConfigurationState =
  configurationAdapter.getInitialState({
    busy: false
  });

export const configurationReducer = createReducer(
  initialConfigurationState,
  on(ConfigurationActions.load, state => ({ ...state, busy: true })),
  on(ConfigurationActions.loadSuccess, (state, action) => {
    return configurationAdapter.setAll(action.entries, {
      ...state,
      busy: false
    });
  }),
  on(ConfigurationActions.loadFailure, state => ({ ...state, busy: false })),
  on(ConfigurationActions.save, state => ({ ...state, busy: true })),
  on(ConfigurationActions.saveSuccess, (state, action) => {
    return configurationAdapter.setAll(action.entries, {
      ...state,
      busy: false
    });
  }),
  on(ConfigurationActions.saveFailure, state => ({ ...state, busy: false }))
);

export const configurationsFeature = createFeature({
  name: CONFIGURATION_FEATURE_KEY,
  reducer: configurationReducer
});
