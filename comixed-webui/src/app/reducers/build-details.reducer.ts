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
  buildDetailsLoaded,
  loadBuildDetails,
  loadBuildDetailsFailed
} from '../actions/build-details.actions';
import { BuildDetails } from '@app/models/build-details';

export const BUILD_DETAILS_FEATURE_KEY = 'build_details_state';

export interface BuildDetailsState {
  loading: boolean;
  details: BuildDetails;
}

export const initialState: BuildDetailsState = {
  loading: false,
  details: null
};

export const reducer = createReducer(
  initialState,

  on(loadBuildDetails, state => ({ ...state, loading: true })),
  on(buildDetailsLoaded, (state, action) => ({
    ...state,
    loading: false,
    details: action.details
  })),
  on(loadBuildDetailsFailed, state => ({ ...state, loading: false }))
);
