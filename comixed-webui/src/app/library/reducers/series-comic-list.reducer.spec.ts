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
  initialSeriesComicListState,
  seriesComicListAdapter,
  seriesComicListReducer,
  SeriesComicListState
} from '../reducers/series-comic-list.reducer';
import { ISSUE_1, ISSUE_2 } from '@app/library/library-fixtures';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { SeriesComicListActions } from '@app/library/actions/series-comic-list.actions';

describe('SeriesComicList Reducer', () => {
  const TEST_ISSUE_LIST = [ISSUE_2, ISSUE_1];

  let state: SeriesComicListState;

  beforeEach(() => {
    state = { ...initialSeriesComicListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = seriesComicListReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should not have any comics', () => {
      expect(
        seriesComicListAdapter.getSelectors().selectAll(state)
      ).toStrictEqual([]);
    });
  });

  describe('loading', () => {
    beforeEach(() => {
      state = seriesComicListReducer(
        { ...state, busy: false },
        SeriesComicListActions.load({
          publisherName: 'The Publisher',
          seriesName: 'The Series',
          volume: '2026'
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = seriesComicListReducer(
          seriesComicListAdapter.setAll([], {
            ...state,
            busy: true
          }),
          SeriesComicListActions.loadSuccess({ entries: TEST_ISSUE_LIST })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the list of comics', () => {
        expect(
          seriesComicListAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_ISSUE_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = seriesComicListReducer(
          seriesComicListAdapter.setAll([], {
            ...state,
            busy: true
          }),
          SeriesComicListActions.loadFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
