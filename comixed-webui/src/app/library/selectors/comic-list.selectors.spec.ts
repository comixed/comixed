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
  COMIC_LIST_FEATURE_KEY,
  comicListAdaptor,
  ComicListState,
  initialComicListState
} from '../reducers/comic-list.reducer';
import {
  selectComicList,
  selectComicListCoverMonthList,
  selectComicListCoverYearList,
  selectComicListFilterCount,
  selectComicListLoading,
  selectComicListTotalCount
} from './comic-list.selectors';
import { beforeEach } from 'vitest';
import { COMIC_1 } from '@app/library/library-fixtures';

describe('ComicList Selectors', () => {
  const TEST_COMIC_LIST = [COMIC_1];
  const TEST_TOTAL_COUNT = 717;
  const TEST_FILTER_COUNT = 129;
  const TEST_COVER_MONTH_LIST = [1, 3, 4, 7, 9, 12];
  const TEST_COVER_YEAR_LIST = [1965, 1971, 1986, 1996, 1998, 2006];

  let state: ComicListState;

  beforeEach(() => {
    state = comicListAdaptor.setAll(TEST_COMIC_LIST, {
      ...initialComicListState,
      totalCount: TEST_TOTAL_COUNT,
      filterCount: TEST_FILTER_COUNT,
      coverMonthList: TEST_COVER_MONTH_LIST,
      coverYearList: TEST_COVER_YEAR_LIST
    });
  });

  describe('the loading flag', () => {
    it('should return true when loading', () => {
      expect(
        selectComicListLoading({
          [COMIC_LIST_FEATURE_KEY]: { ...state, loading: true }
        })
      ).toBeTruthy();
    });

    it('should return false when not loading', () => {
      expect(
        selectComicListLoading({
          [COMIC_LIST_FEATURE_KEY]: { ...state, loading: false }
        })
      ).toBeFalsy();
    });
  });

  it('should return the comic list', () => {
    expect(selectComicList({ [COMIC_LIST_FEATURE_KEY]: state })).toStrictEqual(
      TEST_COMIC_LIST
    );
  });

  it('should return the total count', () => {
    expect(
      selectComicListTotalCount({ [COMIC_LIST_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_TOTAL_COUNT);
  });

  it('should return the filter count', () => {
    expect(
      selectComicListFilterCount({ [COMIC_LIST_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_FILTER_COUNT);
  });

  it('should return the cover month list', () => {
    expect(
      selectComicListCoverMonthList({ [COMIC_LIST_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_COVER_MONTH_LIST);
  });

  it('should return the cover year list', () => {
    expect(
      selectComicListCoverYearList({ [COMIC_LIST_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_COVER_YEAR_LIST);
  });
});
