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

import {
  COMICS_READ_STATISTICS_FEATURE_KEY,
  ComicsReadStatisticsState
} from '../reducers/comics-read-statistics.reducer';
import {
  selectComicsReadStatisticsData,
  selectComicsReadStatisticsState
} from './comics-read-statistics.selectors';
import {
  COMICS_READ_STATISTICS_1,
  COMICS_READ_STATISTICS_2,
  COMICS_READ_STATISTICS_3,
  COMICS_READ_STATISTICS_4,
  COMICS_READ_STATISTICS_5
} from '@app/app.fixtures';

describe('LastReadStatistics Selectors', () => {
  const DATA = [
    COMICS_READ_STATISTICS_1,
    COMICS_READ_STATISTICS_2,
    COMICS_READ_STATISTICS_3,
    COMICS_READ_STATISTICS_4,
    COMICS_READ_STATISTICS_5
  ];

  let state: ComicsReadStatisticsState;

  beforeEach(() => {
    state = { busy: Math.random() > 0.5, data: DATA };
  });

  it('should select the feature state', () => {
    expect(
      selectComicsReadStatisticsState({
        [COMICS_READ_STATISTICS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the data', () => {
    expect(
      selectComicsReadStatisticsData({
        [COMICS_READ_STATISTICS_FEATURE_KEY]: state
      })
    ).toEqual(state.data);
  });
});
