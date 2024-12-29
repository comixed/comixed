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
  batchScrapeComicBooks,
  batchScrapeComicBooksFailure,
  batchScrapeComicBooksSuccess,
  loadMultiBookScrapingPage,
  loadMultiBookScrapingPageFailure,
  loadMultiBookScrapingPageSuccess,
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
import { PAGE_SIZE_DEFAULT } from '@app/core';

export const MULTI_BOOK_SCRAPING_FEATURE_KEY = 'multi_book_scraping_state';

export interface MultiBookScrapingState {
  busy: boolean;
  status: MultiBookScrapingProcessStatus;
  comicBooks: ComicBook[];
  pageSize: number;
  pageNumber: number;
  totalComics: number;
  currentComicBook: ComicBook;
}

export const initialState: MultiBookScrapingState = {
  busy: false,
  status: MultiBookScrapingProcessStatus.SETUP,
  comicBooks: [],
  pageSize: PAGE_SIZE_DEFAULT,
  pageNumber: 0,
  totalComics: 0,
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
    pageSize: action.pageSize,
    pageNumber: action.pageNumber,
    totalComics: action.totalComics,
    comicBooks: action.comicBooks,
    currentComicBook: getCurrentComicBook(action.comicBooks),
    status: updateStatus(action.comicBooks)
  })),
  on(startMultiBookScrapingFailure, state => ({
    ...state,
    busy: false,
    status: MultiBookScrapingProcessStatus.ERROR
  })),
  on(loadMultiBookScrapingPage, state => ({ ...state, busy: true })),
  on(loadMultiBookScrapingPageSuccess, (state, action) => ({
    ...state,
    busy: false,
    pageSize: action.pageSize,
    pageNumber: action.pageNumber,
    totalComics: action.totalComics,
    comicBooks: action.comicBooks
  })),
  on(loadMultiBookScrapingPageFailure, state => ({ ...state, busy: false })),
  on(multiBookScrapingSetCurrentBook, (state, action) => ({
    ...state,
    currentComicBook: action.comicBook
  })),
  on(multiBookScrapingRemoveBook, state => ({ ...state, busy: true })),
  on(multiBookScrapingRemoveBookSuccess, (state, action) => ({
    ...state,
    busy: false,
    pageSize: action.pageSize,
    pageNumber: action.pageNumber,
    totalComics: action.totalComics,
    comicBooks: action.comicBooks,
    currentComicBook: getCurrentComicBook(action.comicBooks),
    status: updateStatus(action.comicBooks)
  })),
  on(multiBookScrapingRemoveBookFailure, state => ({ ...state, busy: false })),
  on(multiBookScrapeComic, state => ({ ...state, busy: true })),
  on(multiBookScrapeComicSuccess, (state, action) => ({
    ...state,
    busy: false,
    pageSize: action.pageSize,
    pageNumber: action.pageNumber,
    totalComics: action.totalComics,
    comicBooks: action.comicBooks,
    currentComicBook: getCurrentComicBook(action.comicBooks),
    status: updateStatus(action.comicBooks)
  })),
  on(multiBookScrapeComicFailure, state => ({ ...state, busy: false })),
  on(batchScrapeComicBooks, state => ({ ...state, busy: true })),
  on(batchScrapeComicBooksSuccess, state => ({ ...state, busy: false })),
  on(batchScrapeComicBooksFailure, state => ({ ...state, busy: false }))
);

export const multiBookScrapingFeature = createFeature({
  name: MULTI_BOOK_SCRAPING_FEATURE_KEY,
  reducer
});
