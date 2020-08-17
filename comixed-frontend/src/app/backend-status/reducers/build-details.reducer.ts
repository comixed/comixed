/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import * as BuildDetailActions from '../actions/build-details.actions';
import { BuildDetails } from 'app/backend-status/models/build-details';

export const BUILD_DETAILS_FEATURE_KEY = 'build_details_state';

export interface BuildDetailsState {
  fetching: boolean;
  details: BuildDetails;
}

export const initialState: BuildDetailsState = {
  fetching: false,
  details: null
};

const buildDetailsReducer = createReducer(
  initialState,

  on(BuildDetailActions.fetchBuildDetails, state => ({
    ...state,
    fetching: true
  })),
  on(BuildDetailActions.buildDetailsReceived, (state, action) => ({
    ...state,
    fetching: false,
    details: action.buildDetails
  })),
  on(BuildDetailActions.fetchBuildDetailsFailed, state => ({
    ...state,
    fetching: false
  }))
);

export function reducer(state: BuildDetailsState | undefined, action: Action) {
  return buildDetailsReducer(state, action);
}
