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
  comicListAdaptor,
  comicListReducer,
  ComicListState,
  initialComicListState
} from './comic-list.reducer';
import { beforeEach, Mock } from 'vitest';
import { Action } from '@ngrx/store';
import { ComicListActions } from '@app/library/actions/comic-list.actions';
import { COMIC_1 } from '@app/library/library-fixtures';

describe('ComicList Reducer', () => {
  const TEST_COMIC = COMIC_1;
  const TEST_COMIC_LIST = [TEST_COMIC];
  const TEST_TOTAL_COUNT = 717;
  const TEST_FILTER_COUNT = 129;
  const TEST_COVER_MONTH_LIST = [1, 3, 4, 7, 9, 12];
  const TEST_COVER_YEAR_LIST = [1965, 1971, 1986, 1996, 1998, 2006];

  let state: ComicListState;

  beforeEach(() => {
    state = { ...initialComicListState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = comicListReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('should have no comics', () => {
      expect(comicListAdaptor.getSelectors().selectAll(state)).toStrictEqual(
        []
      );
    });

    it('should have no total count', () => {
      expect(state.totalCount).toBe(0);
    });

    it('should have no filter count', () => {
      expect(state.filterCount).toBe(0);
    });

    it('should have no cover months', () => {
      expect(state.coverMonthList).toStrictEqual([]);
    });

    it('should have no cover years', () => {
      expect(state.coverYearList).toStrictEqual([]);
    });
  });

  describe('loading comic list by filter', () => {
    beforeEach(() => {
      state = comicListReducer(
        { ...state, loading: false },
        ComicListActions.loadByFilters({
          pageSize: 10,
          pageIndex: 5,
          coverYear: null,
          coverMonth: null,
          archiveType: null,
          comicType: null,
          comicState: null,
          selected: false,
          unscrapedState: false,
          missing: false,
          searchText: '',
          publisher: '',
          series: '',
          volume: '',
          pageCount: null,
          sortBy: '',
          sortDirection: ''
        })
      );
    });

    it('should set the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });
  });

  describe('success loading the comic list', () => {
    beforeEach(() => {
      state = comicListReducer(
        comicListAdaptor.setAll(TEST_COMIC_LIST, {
          ...state,
          loading: true,
          totalCount: 0,
          filterCount: 0,
          coverMonthList: [],
          coverYearList: []
        }),
        ComicListActions.loadSuccess({
          comicList: TEST_COMIC_LIST,
          totalCount: TEST_TOTAL_COUNT,
          filterCount: TEST_FILTER_COUNT,
          coverMonthList: TEST_COVER_MONTH_LIST,
          coverYearList: TEST_COVER_YEAR_LIST
        })
      );
    });

    it('should clear the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('should set the comic list', () => {
      expect(comicListAdaptor.getSelectors().selectAll(state)).toStrictEqual(
        TEST_COMIC_LIST
      );
    });

    it('should set the total count', () => {
      expect(state.totalCount).toStrictEqual(TEST_TOTAL_COUNT);
    });

    it('should set the filter count', () => {
      expect(state.filterCount).toStrictEqual(TEST_FILTER_COUNT);
    });

    it('should set the cover month list', () => {
      expect(state.coverMonthList).toStrictEqual(TEST_COVER_MONTH_LIST);
    });

    it('should set the cover year list', () => {
      expect(state.coverYearList).toStrictEqual(TEST_COVER_YEAR_LIST);
    });
  });

  describe('failure loading the comic list', () => {
    beforeEach(() => {
      state = comicListReducer(
        {
          ...state,
          loading: true
        },
        ComicListActions.loadFailure()
      );
    });

    it('should clear the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });
  });

  describe('when a comic is updated', () => {
    let updateOneSpy: Mock;

    beforeEach(() => {
      updateOneSpy = vi.spyOn(comicListAdaptor, 'updateOne');
      state = comicListReducer(
        comicListAdaptor.setAll(TEST_COMIC_LIST, { ...state }),
        ComicListActions.listUpdate({
          comic: TEST_COMIC
        })
      );
    });

    it('should update the comic', () => {
      expect(updateOneSpy).toHaveBeenCalled();
    });
  });
});
