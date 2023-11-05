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

import { createFeature, createReducer, on } from '@ngrx/store';
import {
  fetchIssuesForSeries,
  fetchIssuesForSeriesFailed,
  issuesForSeriesFetched
} from '../actions/fetch-issues-for-series.actions';

export const FETCH_ISSUES_FOR_SERIES_FEATURE_KEY =
  'fetch_issues_for_series_state';

export interface FetchIssuesForSeriesState {
  busy: boolean;
}

export const initialState: FetchIssuesForSeriesState = {
  busy: false
};

export const reducer = createReducer(
  initialState,

  on(fetchIssuesForSeries, state => ({ ...state, busy: true })),
  on(issuesForSeriesFetched, state => ({ ...state, busy: false })),
  on(fetchIssuesForSeriesFailed, state => ({ ...state, busy: false }))
);

export const fetchIssuesForSeriesFeature = createFeature({
  name: FETCH_ISSUES_FOR_SERIES_FEATURE_KEY,
  reducer
});
