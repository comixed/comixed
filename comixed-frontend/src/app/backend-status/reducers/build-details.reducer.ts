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

import {
  BuildDetailsActions,
  BuildDetailsActionTypes
} from '../actions/build-details.actions';
import { BuildDetails } from 'app/backend-status/models/build-details';

export const BUILD_DETAILS_FEATURE_KEY = 'build_details';

export interface BuildDetailsState {
  fetching_details: boolean;
  details: BuildDetails;
}

export const initial_state: BuildDetailsState = {
  fetching_details: false,
  details: null
};

export function reducer(
  state = initial_state,
  action: BuildDetailsActions
): BuildDetailsState {
  switch (action.type) {
    case BuildDetailsActionTypes.GetBuildDetails:
      return { ...state, fetching_details: true };

    case BuildDetailsActionTypes.BuildDetailsReceived:
      return {
        ...state,
        fetching_details: false,
        details: action.payload.build_details
      };

    case BuildDetailsActionTypes.GetBuildDetailsFailed:
      return { ...state, fetching_details: false };

    default:
      return state;
  }
}
