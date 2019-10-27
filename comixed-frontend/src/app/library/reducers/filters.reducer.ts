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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { FiltersActions, FiltersActionTypes } from '../actions/filters.actions';

export const FILTERS_FEATURE_KEY = 'filter_state';

export interface FilterState {
  publisher: string;
  series: string;
}

export const initialState: FilterState = {
  publisher: null,
  series: null
};

export function reducer(
  state = initialState,
  action: FiltersActions
): FilterState {
  switch (action.type) {
    case FiltersActionTypes.SetPublisher: {
      const name = action.payload.name;
      return { ...state, publisher: !!name && name.length > 0 ? name : null };
    }

    case FiltersActionTypes.SetSeries: {
      const name = action.payload.name;
      return { ...state, series: !!name && name.length > 0 ? name : null };
    }

    case FiltersActionTypes.Clear:
      return { ...state, publisher: null, series: null };

    default:
      return state;
  }
}
