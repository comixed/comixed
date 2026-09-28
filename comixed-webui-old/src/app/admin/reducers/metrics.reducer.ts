/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  loadMetricDetails,
  loadMetricDetailsFailed,
  loadMetricList,
  loadMetricListFailed,
  metricDetailsLoaded,
  metricListLoaded
} from '../actions/metrics.actions';
import { MetricList } from '@app/admin/models/metric-list';
import { MetricDetail } from '@app/admin/models/metric-detail';

export const METRICS_FEATURE_KEY = 'metrics_state';

export interface MetricsState {
  busy: boolean;
  list: MetricList;
  detail: MetricDetail;
}

export const initialState: MetricsState = {
  busy: false,
  list: null,
  detail: null
};

export const reducer = createReducer(
  initialState,

  on(loadMetricList, state => ({ ...state, busy: true })),
  on(metricListLoaded, (state, action) => ({
    ...state,
    busy: false,
    list: action.list
  })),
  on(loadMetricListFailed, state => ({ ...state, busy: false })),
  on(loadMetricDetails, state => ({ ...state, busy: true })),
  on(metricDetailsLoaded, (state, action) => ({
    ...state,
    busy: false,
    detail: action.detail
  })),
  on(loadMetricDetailsFailed, state => ({ ...state, busy: false }))
);

export const metricsFeature = createFeature({
  name: METRICS_FEATURE_KEY,
  reducer
});
