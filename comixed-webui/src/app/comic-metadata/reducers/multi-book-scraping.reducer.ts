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

import { createFeature, createReducer, on } from '@ngrx/store';
import {
  multiBookScrapeComic,
  multiBookScrapeComicFailure,
  multiBookScrapeComicSuccess,
  multiBookScrapingRemoveBook,
  multiBookScrapingRemoveBookFailure,
  multiBookScrapingRemoveBookSuccess,
  multiBookScrapingSetCurrentBook,
  startMultiBookScraping,
  startMultiBookScrapingFailure,
  startMultiBookScrapingSuccess
} from '../actions/multi-book-scraping.actions';
import { MultiBookScrapingProcessStatus } from '@app/comic-metadata/models/multi-book-scraping-process-status';
import { ComicBook } from '@app/comic-books/models/comic-book';

export const MULTI_BOOK_SCRAPING_FEATURE_KEY = 'multi_book_scraping_state';

export interface MultiBookScrapingState {
  busy: boolean;
  status: MultiBookScrapingProcessStatus;
  comicBooks: ComicBook[];
  currentComicBook: ComicBook;
}

export const initialState: MultiBookScrapingState = {
  busy: false,
  status: MultiBookScrapingProcessStatus.SETUP,
  comicBooks: [],
  currentComicBook: null
};

function getCurrentComicBook(comicBooks): ComicBook {
  if (comicBooks?.length > 0) {
    return comicBooks[0];
  }
  return null;
}

function updateStatus(comicBooks): MultiBookScrapingProcessStatus {
  if (comicBooks?.length > 0) {
    return MultiBookScrapingProcessStatus.STARTED;
  } else {
    return MultiBookScrapingProcessStatus.FINISHED;
  }
}

export const reducer = createReducer(
  initialState,
  on(startMultiBookScraping, state => ({ ...state, busy: true })),
  on(startMultiBookScrapingSuccess, (state, action) => ({
    ...state,
    busy: false,
    comicBooks: action.comicBooks,
    currentComicBook: getCurrentComicBook(action.comicBooks),
    status: updateStatus(action.comicBooks)
  })),
  on(startMultiBookScrapingFailure, state => ({
    ...state,
    busy: false,
    status: MultiBookScrapingProcessStatus.ERROR
  })),
  on(multiBookScrapingSetCurrentBook, (state, action) => ({
    ...state,
    currentComicBook: action.comicBook
  })),
  on(multiBookScrapingRemoveBook, state => ({ ...state, busy: true })),
  on(multiBookScrapingRemoveBookSuccess, (state, action) => ({
    ...state,
    busy: false,
    comicBooks: action.comicBooks,
    currentComicBook: getCurrentComicBook(action.comicBooks),
    status: updateStatus(action.comicBooks)
  })),
  on(multiBookScrapingRemoveBookFailure, state => ({ ...state, busy: false })),
  on(multiBookScrapeComic, state => ({ ...state, busy: true })),
  on(multiBookScrapeComicSuccess, (state, action) => ({
    ...state,
    busy: false,
    comicBooks: action.comicBooks,
    currentComicBook: getCurrentComicBook(action.comicBooks),
    status: updateStatus(action.comicBooks)
  })),
  on(multiBookScrapeComicFailure, state => ({ ...state, busy: false }))
);

export const multiBookScrapingFeature = createFeature({
  name: MULTI_BOOK_SCRAPING_FEATURE_KEY,
  reducer
});
