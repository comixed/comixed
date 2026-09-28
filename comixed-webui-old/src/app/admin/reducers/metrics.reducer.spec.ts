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

import { initialState, MetricsState, reducer } from './metrics.reducer';
import {
  loadMetricDetails,
  loadMetricDetailsFailed,
  loadMetricList,
  loadMetricListFailed,
  metricDetailsLoaded,
  metricListLoaded
} from '@app/admin/actions/metrics.actions';
import { METRIC_DETAIL, METRIC_LIST } from '@app/admin/admin.fixtures';

describe('Metrics Reducer', () => {
  let state: MetricsState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has no metric list', () => {
      expect(state.list).toBeNull();
    });

    it('has no metric detail', () => {
      expect(state.detail).toBeNull();
    });
  });

  describe('fetching the metric list', () => {
    beforeEach(() => {
      state = reducer({ ...initialState, busy: false }, loadMetricList());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('receiving the metric list', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...initialState,
          busy: true,
          list: null
        },
        metricListLoaded({ list: METRIC_LIST })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the metric list', () => {
      expect(state.list).toEqual(METRIC_LIST);
    });
  });

  describe('fails to load the metric list', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...initialState,
          busy: true
        },
        loadMetricListFailed()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('loading the details for a metric', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: false },
        loadMetricDetails({ name: METRIC_LIST.names[0] })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('receiving the details for a metric', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: true, detail: null },
        metricDetailsLoaded({ detail: METRIC_DETAIL })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the metric details', () => {
      expect(state.detail).toBe(METRIC_DETAIL);
    });
  });

  describe('failure loading the details for a metric', () => {
    beforeEach(() => {
      state = reducer(
        { ...initialState, busy: true },
        loadMetricDetailsFailed()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
