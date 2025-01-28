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

import { SERIES_FEATURE_KEY, SeriesState } from '../reducers/series.reducer';
import {
  selectSeriesDetail,
  selectSeriesList,
  selectSeriesState,
  selectSeriesTotal
} from './series.selectors';
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

describe('Series Selectors', () => {
  let state: SeriesState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      totalSeries: 27,
      series: [SERIES_1, SERIES_2, SERIES_3, SERIES_4, SERIES_5],
      detail: [ISSUE_1, ISSUE_2, ISSUE_3]
    };
  });

  it('should select the feature state', () => {
    expect(
      selectSeriesState({
        [SERIES_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the series count', () => {
    expect(
      selectSeriesTotal({
        [SERIES_FEATURE_KEY]: state
      })
    ).toEqual(state.totalSeries);
  });

  it('should select the series list', () => {
    expect(
      selectSeriesList({
        [SERIES_FEATURE_KEY]: state
      })
    ).toEqual(state.series);
  });

  it('should select the series detail', () => {
    expect(
      selectSeriesDetail({
        [SERIES_FEATURE_KEY]: state
      })
    ).toEqual(state.detail);
  });
});
