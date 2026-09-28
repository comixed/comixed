/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
  initialSeriesListState,
  seriesListAdapter,
  seriesListReducer,
  SeriesListState
} from '@app/library/reducers/series-list.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { SERIES_1 } from '@app/library/library-fixtures';
import { SeriesListActions } from '@app/library/actions/series-list.actions';

describe('SeriesList Reducer', () => {
  const TEST_SERIES_LIST = [SERIES_1];
  const TEST_TOTAL = 129;

  let state: SeriesListState;

  beforeEach(() => {
    state = { ...initialSeriesListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = seriesListReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should not have any series', () => {
      expect(seriesListAdapter.getSelectors().selectAll(state)).toStrictEqual(
        []
      );
    });

    it('should have no total series', () => {
      expect(state.total).toBe(0);
    });
  });

  describe('loading the series list', () => {
    beforeEach(() => {
      state = seriesListReducer(
        { ...state, busy: false },
        SeriesListActions.load({
          searchText: '',
          index: 0,
          size: 10,
          sortBy: '',
          sortDirection: ''
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = seriesListReducer(
          seriesListAdapter.setAll([], { ...state, busy: true, total: 0 }),
          SeriesListActions.loadSuccess({
            entries: TEST_SERIES_LIST,
            total: TEST_TOTAL
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of series', () => {
        expect(seriesListAdapter.getSelectors().selectAll(state)).toStrictEqual(
          TEST_SERIES_LIST
        );
      });

      it('should update the total', () => {
        expect(state.total).toBe(TEST_TOTAL);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = seriesListReducer(
          seriesListAdapter.setAll([], { ...state, busy: true, total: 0 }),
          SeriesListActions.loadFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
