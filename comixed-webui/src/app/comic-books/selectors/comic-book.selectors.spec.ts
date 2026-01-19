/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
  COMIC_BOOK_FEATURE_KEY,
  ComicBookState
} from '../reducers/comic-book.reducer';
import { selectComicBookState } from './comic-book.selectors';
import {
  COMIC_METADATA_SOURCE_1,
  COMIC_TAG_1,
  COMIC_TAG_2,
  COMIC_TAG_3,
  COMIC_TAG_4,
  COMIC_TAG_5,
  DISPLAYABLE_COMIC_1
} from '@app/comic-books/comic-books.fixtures';
import {
  PAGE_1,
  PAGE_2,
  PAGE_3,
  PAGE_4
} from '@app/comic-pages/comic-pages.fixtures';

describe('ComicBook Selectors', () => {
  let state: ComicBookState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      details: DISPLAYABLE_COMIC_1,
      metadata: COMIC_METADATA_SOURCE_1,
      pages: [PAGE_1, PAGE_2, PAGE_3, PAGE_4],
      tags: [COMIC_TAG_1, COMIC_TAG_2, COMIC_TAG_3, COMIC_TAG_4, COMIC_TAG_5],
      saving: Math.random() > 0.5,
      saved: Math.random() > 0.5
    };
  });

  it('should select the feature state', () => {
    expect(
      selectComicBookState({
        [COMIC_BOOK_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });
});
