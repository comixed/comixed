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
  initialPublisherSeriesListState,
  publisherSeriesListAdapter,
  publisherSeriesListReducer,
  PublisherSeriesListState
} from '../reducers/publisher-series-list.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { PublisherSeriesListActions } from '@app/library/actions/publisher-series-list.actions';
import { SERIES_1 } from '@app/library/library-fixtures';

describe('PublisherSeriesList Reducer', () => {
  const TEST_SERIES_LIST = [SERIES_1];
  const TEST_SERIES_TOTAL = 320;

  let state: PublisherSeriesListState;

  beforeEach(() => {
    state = { ...initialPublisherSeriesListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = publisherSeriesListReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should have no series', () => {
      expect(
        publisherSeriesListAdapter.getSelectors().selectAll(state)
      ).toStrictEqual([]);
    });

    it('should have a zero total', () => {
      expect(state.total).toBe(0);
    });
  });

  describe('loading', () => {
    beforeEach(() => {
      state = publisherSeriesListReducer(
        { ...state, busy: false },
        PublisherSeriesListActions.load({
          name: 'The Publisher',
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
        state = publisherSeriesListReducer(
          publisherSeriesListAdapter.setAll([], {
            ...state,
            busy: true,
            total: 0
          }),
          PublisherSeriesListActions.loadSuccess({
            entries: TEST_SERIES_LIST,
            total: TEST_SERIES_TOTAL
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should set the total series', () => {
        expect(state.total).toBe(TEST_SERIES_TOTAL);
      });

      it('should set the list of series', () => {
        expect(
          publisherSeriesListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_SERIES_LIST);
      });
    });
  });
});
