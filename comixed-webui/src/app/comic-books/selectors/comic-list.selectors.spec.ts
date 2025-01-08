/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_4,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import {
  COMIC_LIST_FEATURE_KEY,
  ComicListState
} from '@app/comic-books/reducers/comic-list.reducer';
import {
  selectComicFilteredCount,
  selectComicList,
  selectComicListState,
  selectComicTotalCount,
  selectComicCoverMonths,
  selectComicCoverYears
} from '@app/comic-books/selectors/comic-list.selectors';

describe('ComicList Selectors', () => {
  const COMIC_LIST = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_2,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_4,
    DISPLAYABLE_COMIC_5
  ];
  const COVER_YEARS = [1965, 1971, 1996, 1998, 2006];
  const COVER_MONTHS = [1, 3, 4, 7, 9];
  const TOTAL_COUNT = COMIC_LIST.length * 2;
  const FILTERED_COUNT = Math.floor(TOTAL_COUNT * 0.75);

  let state: ComicListState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      comics: COMIC_LIST,
      coverYears: COVER_YEARS,
      coverMonths: COVER_MONTHS,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    };
  });

  it('should select the feature state', () => {
    expect(
      selectComicListState({
        [COMIC_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the list of comic details', () => {
    expect(
      selectComicList({
        [COMIC_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.comics);
  });

  it('should select the list of cover years', () => {
    expect(
      selectComicCoverYears({
        [COMIC_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.coverYears);
  });

  it('should select the list of cover months', () => {
    expect(
      selectComicCoverMonths({
        [COMIC_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.coverMonths);
  });

  it('should select the total count of comic details', () => {
    expect(
      selectComicTotalCount({
        [COMIC_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.totalCount);
  });

  it('should select the filtered count of comic details', () => {
    expect(
      selectComicFilteredCount({
        [COMIC_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.filteredCount);
  });
});
