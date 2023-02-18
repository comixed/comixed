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

import { METRICS_FEATURE_KEY, MetricsState } from '../reducers/metrics.reducer';
import {
  selectMetricDetail,
  selectMetricList,
  selectMetricsState
} from './metrics.selectors';
import { METRIC_DETAIL, METRIC_LIST } from '@app/admin/admin.fixtures';

describe('Metrics Selectors', () => {
  let state: MetricsState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      list: METRIC_LIST,
      detail: METRIC_DETAIL
    };
  });

  it('should select the feature state', () => {
    expect(
      selectMetricsState({
        [METRICS_FEATURE_KEY]: state
      })
    ).toBe(state);
  });

  it('should select the metric list', () => {
    expect(selectMetricList({ [METRICS_FEATURE_KEY]: state })).toEqual(
      state.list
    );
  });

  it('should select the metric detail', () => {
    expect(selectMetricDetail({ [METRICS_FEATURE_KEY]: state })).toEqual(
      state.detail
    );
  });
});
