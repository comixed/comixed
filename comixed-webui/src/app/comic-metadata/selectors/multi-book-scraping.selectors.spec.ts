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
  MULTI_BOOK_SCRAPING_FEATURE_KEY,
  MultiBookScrapingState
} from '../reducers/multi-book-scraping.reducer';
import {
  selectMultiBookScrapingCurrent,
  selectMultiBookScrapingList,
  selectMultiBookScrapingState
} from './multi-book-scraping.selectors';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_2,
  COMIC_BOOK_3,
  COMIC_BOOK_4,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import { MultiBookScrapingProcessStatus } from '@app/comic-metadata/models/multi-book-scraping-process-status';

describe('MultiBookScraping Selectors', () => {
  const COMIC_BOOKS = [
    COMIC_BOOK_1,
    COMIC_BOOK_2,
    COMIC_BOOK_3,
    COMIC_BOOK_4,
    COMIC_BOOK_5
  ];
  const CURRENT_COMIC_BOOK =
    COMIC_BOOKS[Math.floor(Math.random() * COMIC_BOOKS.length)];

  let state: MultiBookScrapingState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      status: MultiBookScrapingProcessStatus.ERROR,
      comicBooks: COMIC_BOOKS,
      currentComicBook: CURRENT_COMIC_BOOK
    };
  });

  it('should select the feature state', () => {
    expect(
      selectMultiBookScrapingState({
        [MULTI_BOOK_SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the comic book list', () => {
    expect(
      selectMultiBookScrapingList({
        [MULTI_BOOK_SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state.comicBooks);
  });

  it('should select the current comic book', () => {
    expect(
      selectMultiBookScrapingCurrent({
        [MULTI_BOOK_SCRAPING_FEATURE_KEY]: state
      })
    ).toEqual(state.currentComicBook);
  });
});
