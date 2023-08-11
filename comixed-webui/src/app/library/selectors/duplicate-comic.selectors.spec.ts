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
  DUPLICATE_COMIC_FEATURE_KEY,
  DuplicateComicState
} from '../reducers/duplicate-comic.reducer';
import {
  selectDuplicateComicList,
  selectDuplicateComicState
} from './duplicate-comic.selectors';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';

describe('DuplicateComic Selectors', () => {
  const COMIC_DETAILS = [
    COMIC_DETAIL_1,
    COMIC_DETAIL_2,
    COMIC_DETAIL_3,
    COMIC_DETAIL_4,
    COMIC_DETAIL_5
  ];

  let state: DuplicateComicState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      comics: COMIC_DETAILS
    };
  });

  it('should select the feature state', () => {
    expect(
      selectDuplicateComicState({
        [DUPLICATE_COMIC_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the list of duplicate comics', () => {
    expect(
      selectDuplicateComicList({
        [DUPLICATE_COMIC_FEATURE_KEY]: state
      })
    ).toEqual(state.comics);
  });
});
