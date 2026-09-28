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
  ComicsReadStatisticsState,
  initialState,
  reducer
} from './comics-read-statistics.reducer';
import {
  loadComicsReadStatistics,
  loadComicsReadStatisticsFailure,
  loadComicsReadStatisticsSuccess
} from '@app/actions/comics-read-statistics.actions';
import {
  COMICS_READ_STATISTICS_1,
  COMICS_READ_STATISTICS_2,
  COMICS_READ_STATISTICS_3,
  COMICS_READ_STATISTICS_4,
  COMICS_READ_STATISTICS_5
} from '@app/app.fixtures';

describe('ComicsReadStatistics Reducer', () => {
  const DATA = [
    COMICS_READ_STATISTICS_1,
    COMICS_READ_STATISTICS_2,
    COMICS_READ_STATISTICS_3,
    COMICS_READ_STATISTICS_4,
    COMICS_READ_STATISTICS_5
  ];

  let state: ComicsReadStatisticsState;

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

    it('has no data', () => {
      expect(state.data).toEqual([]);
    });
  });

  describe('loading the comics read statistics', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadComicsReadStatistics());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, data: [] },
          loadComicsReadStatisticsSuccess({ data: DATA })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the data', () => {
        expect(state.data).toEqual(DATA);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true },
          loadComicsReadStatisticsFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });
    });
  });
});
