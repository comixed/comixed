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
  initialPublisherComicListState,
  publisherComicListAdapter,
  publisherComicListReducer,
  PublisherComicListState
} from '../reducers/publisher-comic-list.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { COMIC_1 } from '@app/library/library-fixtures';
import { PublisherComicListActions } from '@app/library/actions/publisher-comic-list.actions';

describe('PublisherComicList Reducer', () => {
  const TEST_COMIC_LIST = [COMIC_1];
  const TEST_COVER_MONTH_LIST = [1, 3, 4, 7, 9, 12];
  const TEST_COVER_YEAR_LIST = [1965, 1971, 1986, 1996, 1998, 2006];
  const TEST_TOTAL = 920;
  const TEST_FILTERED_TOTAL = 921;

  let state: PublisherComicListState;

  beforeEach(() => {
    state = { ...initialPublisherComicListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = publisherComicListReducer({ ...state }, {} as Action<string>);
    });

    it('should should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should have no comics', () => {
      expect(
        publisherComicListAdapter.getSelectors().selectAll(state)
      ).toStrictEqual([]);
    });

    it('should have no cover months', () => {
      expect(state.coverMonthList).toStrictEqual([]);
    });

    it('should have no cover years', () => {
      expect(state.coverYearList).toStrictEqual([]);
    });
  });

  describe('loading', () => {
    beforeEach(() => {
      state = publisherComicListReducer(
        {
          ...state,
          busy: false
        },
        PublisherComicListActions.load({
          publisherName: 'The Publisher',
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
        state = publisherComicListReducer(
          publisherComicListAdapter.setAll([], {
            ...state,
            busy: true,
            coverMonthList: [],
            coverYearList: [],
            total: 0,
            filteredTotal: 0
          }),
          PublisherComicListActions.loadSuccess({
            entries: TEST_COMIC_LIST,
            coverMonthList: TEST_COVER_MONTH_LIST,
            coverYearList: TEST_COVER_YEAR_LIST,
            total: TEST_TOTAL,
            filteredTotal: TEST_FILTERED_TOTAL
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = publisherComicListReducer(
          {
            ...state,
            busy: true
          },
          PublisherComicListActions.loadFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
