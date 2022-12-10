/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
  loadSeriesFailed,
  loadSeriesList,
  seriesLoaded
} from '../actions/series.actions';
import { Series } from '@app/collections/models/series';

export const SERIES_FEATURE_KEY = 'series_state';

export interface SeriesState {
  busy: boolean;
  series: Series[];
}

export const initialState: SeriesState = {
  busy: false,
  series: []
};

export const reducer = createReducer(
  initialState,

  on(loadSeriesList, state => ({ ...state, busy: true })),
  on(seriesLoaded, (state, action) => ({
    ...state,
    busy: false,
    series: action.series
  })),
  on(loadSeriesFailed, state => ({ ...state, busy: false }))
);
