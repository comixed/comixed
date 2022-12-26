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

import { initialState, reducer, SeriesState } from './series.reducer';
import {
  loadSeriesDetail,
  loadSeriesDetailFailed,
  loadSeriesFailed,
  loadSeriesList,
  seriesDetailLoaded,
  seriesLoaded
} from '@app/collections/actions/series.actions';
import {
  ISSUE_1,
  ISSUE_2,
  ISSUE_3,
  SERIES_1,
  SERIES_2,
  SERIES_3,
  SERIES_4,
  SERIES_5
} from '@app/collections/collections.fixtures';

describe('Series Reducer', () => {
  const SERIES_LIST = [SERIES_1, SERIES_2, SERIES_3, SERIES_4, SERIES_5];
  const SERIES_DETAIL = [ISSUE_1, ISSUE_2, ISSUE_3];
  const PUBLISHER = 'The Publisher';
  const SERIES = 'The Series';
  const VOLUME = '2022';

  let state: SeriesState;

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

    it('has no series list loaded', () => {
      expect(state.series).toEqual([]);
    });

    it('has no series detail loaded', () => {
      expect(state.detail).toEqual([]);
    });
  });

  describe('loading series', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadSeriesList());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('series loaded', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, series: [] },
        seriesLoaded({ series: SERIES_LIST })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the list series', () => {
      expect(state.series).toEqual(SERIES_LIST);
    });
  });

  describe('failed to load series', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, loadSeriesFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });

  describe('loading a series detail', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false, detail: SERIES_DETAIL },
        loadSeriesDetail({
          publisher: PUBLISHER,
          name: SERIES,
          volume: VOLUME
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    it('clears the loaded detail', () => {
      expect(state.detail).toEqual([]);
    });
  });

  describe('series detail loaded', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, series: [] },
        seriesDetailLoaded({ detail: SERIES_DETAIL })
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the series detail', () => {
      expect(state.detail).toEqual(SERIES_DETAIL);
    });
  });

  describe('failed to load series detail', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, loadSeriesDetailFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
