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
  COMIC_DETAILS_LIST_FEATURE_KEY,
  ComicDetailsListState
} from '../reducers/comic-details-list.reducer';
import {
  selectLoadComicDetailsFilteredComics,
  selectLoadComicDetailsList,
  selectLoadComicDetailsListState,
  selectLoadComicDetailsTotalComics
} from './load-comic-details-list.selectors';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';

describe('LoadComicDetailsList Selectors', () => {
  const COMIC_DETAILS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];
  const TOTAL_COUNT = COMIC_DETAILS.length * 2;
  const FILTERED_COUNT = Math.floor(TOTAL_COUNT * 0.75);

  let state: ComicDetailsListState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      comicDetails: COMIC_DETAILS,
      totalCount: TOTAL_COUNT,
      filteredCount: FILTERED_COUNT
    };
  });

  it('should select the feature state', () => {
    expect(
      selectLoadComicDetailsListState({
        [COMIC_DETAILS_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the list of comic details', () => {
    expect(
      selectLoadComicDetailsList({
        [COMIC_DETAILS_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.comicDetails);
  });

  it('should select the total count of comic details', () => {
    expect(
      selectLoadComicDetailsTotalComics({
        [COMIC_DETAILS_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.totalCount);
  });

  it('should select the filtered count of comic details', () => {
    expect(
      selectLoadComicDetailsFilteredComics({
        [COMIC_DETAILS_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.filteredCount);
  });
});
