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
  duplicateComicAdapter,
  duplicateComicReducer,
  DuplicateComicState,
  initialDuplicateComicState
} from './duplicate-comic.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { DuplicateComicActions } from '@app/admin/actions/duplicate-comic.actions';
import { COMIC_1, COMIC_2 } from '@app/library/library-fixtures';

describe('DuplicateComicDetail Reducer', () => {
  const TEST_COMIC_LIST = [COMIC_1, COMIC_2];
  const TEST_INDEX = 17;
  const TEST_SIZE = 25;
  const TEST_SORT_BY = 'coverDate';
  const TEST_SORT_DIRECTION = 'asc';
  const TEST_COVER_MONTHS = [1, 3, 4, 7, 9, 12];
  const TEST_COVER_YEARS = [1965, 1971, 1986, 1996, 1998, 2006];
  const TEST_TOTAL = 61;
  const TEST_PUBLISHER = 'The Publisher';
  const TEST_SERIES = 'The Series';
  const TEST_VOLUME = '2026';
  const TEST_ISSUE_NUMBER = '717';
  const TEST_COVER_DATE = new Date().getTime();

  let state: DuplicateComicState;

  beforeEach(() => {
    state = { ...initialDuplicateComicState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = duplicateComicReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should not contain cover months', () => {
      expect(state.coverMonths).toStrictEqual([]);
    });

    it('should not contain cover years', () => {
      expect(state.coverYears).toStrictEqual([]);
    });

    it('should have no total', () => {
      expect(state.total).toBe(0);
    });
  });

  describe('loading a duplicate comic', () => {
    beforeEach(() => {
      state = duplicateComicReducer(
        { ...state, busy: false },
        DuplicateComicActions.load({
          publisher: TEST_PUBLISHER,
          series: TEST_SERIES,
          volume: TEST_VOLUME,
          issueNumber: TEST_ISSUE_NUMBER,
          index: TEST_INDEX,
          size: TEST_SIZE,
          coverDate: TEST_COVER_DATE,
          sortBy: TEST_SORT_BY,
          sortDirection: TEST_SORT_DIRECTION
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = duplicateComicReducer(
          duplicateComicAdapter.setAll([], {
            ...state,
            busy: true,
            coverMonths: [],
            coverYears: [],
            total: 0
          }),
          DuplicateComicActions.loadSuccess({
            entries: TEST_COMIC_LIST,
            coverMonths: TEST_COVER_MONTHS,
            coverYears: TEST_COVER_YEARS,
            total: TEST_TOTAL
          })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should set the comic list', () => {
        expect(
          duplicateComicAdapter.getSelectors().selectAll(state)
        ).toStrictEqual(TEST_COMIC_LIST);
      });

      it('should set the cover month list', () => {
        expect(state.coverMonths).toStrictEqual(TEST_COVER_MONTHS);
      });

      it('should set the cover year list', () => {
        expect(state.coverYears).toStrictEqual(TEST_COVER_YEARS);
      });

      it('should set the total', () => {
        expect(state.total).toBe(TEST_TOTAL);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = duplicateComicReducer(
          duplicateComicAdapter.setAll([], {
            ...state,
            busy: true,
            coverMonths: [],
            coverYears: [],
            total: 0
          }),
          DuplicateComicActions.loadFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
