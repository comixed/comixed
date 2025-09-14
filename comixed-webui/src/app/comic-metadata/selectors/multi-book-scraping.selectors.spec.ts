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
  DISPLAYABLE_COMIC_1,
  DISPLAYABLE_COMIC_2,
  DISPLAYABLE_COMIC_3,
  DISPLAYABLE_COMIC_4,
  DISPLAYABLE_COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { MultiBookScrapingProcessStatus } from '@app/comic-metadata/models/multi-book-scraping-process-status';
import { PAGE_SIZE_DEFAULT } from '@app/core';

describe('MultiBookScraping Selectors', () => {
  const COMIC_BOOKS = [
    DISPLAYABLE_COMIC_1,
    DISPLAYABLE_COMIC_2,
    DISPLAYABLE_COMIC_3,
    DISPLAYABLE_COMIC_4,
    DISPLAYABLE_COMIC_5
  ];
  const CURRENT_COMIC_BOOK =
    COMIC_BOOKS[Math.floor(Math.random() * COMIC_BOOKS.length)];

  let state: MultiBookScrapingState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      status: MultiBookScrapingProcessStatus.ERROR,
      pageSize: PAGE_SIZE_DEFAULT,
      pageNumber: Math.floor(Math.random() * 10),
      totalComics: Math.floor(Math.random() * 100),
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
