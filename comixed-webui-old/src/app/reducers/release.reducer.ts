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
  currentReleaseDetailsLoaded,
  latestReleaseDetailsLoaded,
  loadCurrentReleaseDetails,
  loadCurrentReleaseDetailsFailed,
  loadLatestReleaseDetails,
  loadLatestReleaseDetailsFailed
} from '../actions/release.actions';
import { CurrentRelease } from '@app/models/current-release';
import { LatestRelease } from '@app/models/latest-release';

export const RELEASE_DETAILS_FEATURE_KEY = 'release_details_state';

export interface ReleaseDetailsState {
  currentLoading: boolean;
  current: CurrentRelease;
  latestLoading: boolean;
  loaded: boolean;
  latest: LatestRelease;
}

export const initialState: ReleaseDetailsState = {
  currentLoading: false,
  current: null,
  latestLoading: false,
  loaded: false,
  latest: null
};

export const reducer = createReducer(
  initialState,

  on(loadCurrentReleaseDetails, state => ({ ...state, currentLoading: true })),
  on(currentReleaseDetailsLoaded, (state, action) => ({
    ...state,
    currentLoading: false,
    current: action.details
  })),
  on(loadCurrentReleaseDetailsFailed, state => ({
    ...state,
    currentLoading: false
  })),
  on(loadLatestReleaseDetails, state => ({
    ...state,
    latestLoading: true,
    loaded: false
  })),
  on(latestReleaseDetailsLoaded, (state, action) => ({
    ...state,
    latestLoading: false,
    latest: action.details,
    loaded: true
  })),
  on(loadLatestReleaseDetailsFailed, state => ({
    ...state,
    latestLoading: false,
    loaded: true
  }))
);
