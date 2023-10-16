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
  COMIC_BOOK_SELECTION_FEATURE_KEY,
  ComicBookSelectionState
} from '../reducers/comic-book-selection.reducer';
import {
  selectComicBookSelectionIds,
  selectComicBookSelectionState
} from './comic-book-selection.selectors';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3,
  COMIC_BOOK_4,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';

describe('ComicBookSelection Selectors', () => {
  const COMIC_BOOKS = [
    COMIC_BOOK_1,
    COMIC_BOOK_2,
    COMIC_BOOK_3,
    COMIC_BOOK_4,
    COMIC_BOOK_5
  ];
  const IDS = COMIC_BOOKS.map(comicBook => comicBook.id);

  let state: ComicBookSelectionState;

  beforeEach(() => {
    state = { busy: Math.random() > 0.5, ids: IDS };
  });

  it('should select the feature state', () => {
    expect(
      selectComicBookSelectionState({
        [COMIC_BOOK_SELECTION_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the list of ids', () => {
    expect(
      selectComicBookSelectionIds({
        [COMIC_BOOK_SELECTION_FEATURE_KEY]: state
      })
    ).toEqual(state.ids);
  });
});
