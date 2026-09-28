/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
  getFeatureEnabled,
  getFeatureEnabledFailure,
  getFeatureEnabledSuccess
} from '../actions/feature-enabled.actions';
import { FeatureFlag } from '@app/admin/models/feature-flag';

export const FEATURE_ENABLED_FEATURE_KEY = 'feature_enabled_state';

export interface FeatureEnabledState {
  busy: boolean;
  features: FeatureFlag[];
}

export const initialState: FeatureEnabledState = {
  busy: false,
  features: []
};

export const reducer = createReducer(
  initialState,
  on(getFeatureEnabled, state => ({ ...state, busy: true })),
  on(getFeatureEnabledSuccess, (state, action) => {
    const features = state.features
      .filter(feature => feature.name !== action.name)
      .concat([
        {
          name: action.name,
          enabled: action.enabled
        }
      ]);
    return { ...state, busy: false, features };
  }),
  on(getFeatureEnabledFailure, state => ({ ...state, busy: false }))
);

export const featureEnabledFeature = createFeature({
  name: FEATURE_ENABLED_FEATURE_KEY,
  reducer
});
