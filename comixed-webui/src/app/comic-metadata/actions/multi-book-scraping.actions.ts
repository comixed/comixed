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

import { createAction, props } from '@ngrx/store';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { ComicBook } from '@app/comic-books/models/comic-book';

export const startMultiBookScraping = createAction(
  '[Multi-Book Scraping] Starts the process of scraping multiple book',
  props<{ pageSize: number }>()
);

export const startMultiBookScrapingSuccess = createAction(
  '[Multi-Book Scraping] Started the multi-book scraping process',
  props<{
    comicBooks: ComicBook[];
    pageSize: number;
    pageNumber: number;
    totalComics: number;
  }>()
);

export const startMultiBookScrapingFailure = createAction(
  '[Multi-Book Scraping] Failed to start multi-book scraping'
);

export const loadMultiBookScrapingPage = createAction(
  '[Multi-Book Scraping] Load a page of scraping targets',
  props<{
    pageSize: number;
    pageNumber: number;
  }>()
);

export const loadMultiBookScrapingPageSuccess = createAction(
  '[Multi-Book Scraping] Loaded a page of scraping targets',
  props<{
    pageSize: number;
    pageNumber: number;
    totalComics: number;
    comicBooks: ComicBook[];
  }>()
);

export const loadMultiBookScrapingPageFailure = createAction(
  '[Multi-Book Scraping] Failed to load a page of scraping targets'
);

export const multiBookScrapingSetCurrentBook = createAction(
  '[Multi-Book Scraping] Set the current comic book',
  props<{
    comicBook: ComicBook;
  }>()
);

export const multiBookScrapingRemoveBook = createAction(
  '[Multi-Book Scraping] Remove a comic book from the process',
  props<{
    pageSize: number;
    comicBook: ComicBook;
  }>()
);

export const multiBookScrapingRemoveBookSuccess = createAction(
  '[Multi-Book Scraping] Successfully removeped a comic book',
  props<{
    comicBooks: ComicBook[];
    pageSize: number;
    pageNumber: number;
    totalComics: number;
  }>()
);
export const multiBookScrapingRemoveBookFailure = createAction(
  '[Multi-Book Scraping] Failed to remove a comic book'
);

export const multiBookScrapeComic = createAction(
  '[Multi-Book Scraping] Scrape the current comic book',
  props<{
    metadataSource: MetadataSource;
    issueId: string;
    comicBook: ComicBook;
    skipCache: boolean;
    pageSize: number;
  }>()
);

export const multiBookScrapeComicSuccess = createAction(
  '[Multi-Book Scraping] Successfully scraped a comic book',
  props<{
    comicBooks: ComicBook[];
    pageSize: number;
    pageNumber: number;
    totalComics: number;
  }>()
);

export const multiBookScrapeComicFailure = createAction(
  '[Multi-Book Scraping] Failed to scrape a comic book'
);

export const batchScrapeComicBooks = createAction(
  '[Multi-Book Scraping] Batch scrape selected comic books'
);

export const batchScrapeComicBooksSuccess = createAction(
  '[Multi-Book Scraping] Batch scraping selected comic books started'
);

export const batchScrapeComicBooksFailure = createAction(
  '[Multi-Book Scraping] Failed to start batch scraping selected comic books'
);
