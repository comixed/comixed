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
  DUPLICATE_COMIC_FEATURE_KEY,
  DuplicateComicState
} from '../reducers/duplicate-comic.reducer';
import {
  selectDuplicateComicList,
  selectDuplicateComicState,
  selectDuplicateComicTotal
} from './duplicate-comic.selectors';
import {
  DUPLICATE_COMIC_1,
  DUPLICATE_COMIC_2,
  DUPLICATE_COMIC_3,
  DUPLICATE_COMIC_4,
  DUPLICATE_COMIC_5
} from '@app/library/library.fixtures';

describe('DuplicateComic Selectors', () => {
  const DUPLICATE_COMIC_LIST = [
    DUPLICATE_COMIC_1,
    DUPLICATE_COMIC_2,
    DUPLICATE_COMIC_3,
    DUPLICATE_COMIC_4,
    DUPLICATE_COMIC_5
  ];

  let state = {
    busy: Math.random() > 0.5,
    entries: DUPLICATE_COMIC_LIST,
    total: DUPLICATE_COMIC_LIST.length
  } as DuplicateComicState;

  it('should select the feature state', () => {
    expect(
      selectDuplicateComicState({
        [DUPLICATE_COMIC_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the duplicate comic list', () => {
    expect(
      selectDuplicateComicList({
        [DUPLICATE_COMIC_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });

  it('should select the duplicate comic totals', () => {
    expect(
      selectDuplicateComicTotal({
        [DUPLICATE_COMIC_FEATURE_KEY]: state
      })
    ).toEqual(state.total);
  });
});
