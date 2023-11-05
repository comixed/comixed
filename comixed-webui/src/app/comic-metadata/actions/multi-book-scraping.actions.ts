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
  '[Multi-Book Scraping] Starts the process of scraping multiple book'
);

export const startMultiBookScrapingSuccess = createAction(
  '[Multi-Book Scraping] Started the multi-book scraping process',
  props<{
    comicBooks: ComicBook[];
  }>()
);

export const startMultiBookScrapingFailure = createAction(
  '[Multi-Book Scraping] Failed to start multi-book scraping'
);

export const multiBookScrapingSetCurrentBook = createAction(
  '[Multi-Book Scraping] Set the current comic book',
  props<{ comicBook: ComicBook }>()
);

export const multiBookScrapingRemoveBook = createAction(
  '[Multi-Book Scraping] Remove a comic book from the process',
  props<{
    comicBook: ComicBook;
  }>()
);

export const multiBookScrapingRemoveBookSuccess = createAction(
  '[Multi-Book Scraping] Successfully removeped a comic book',
  props<{
    comicBooks: ComicBook[];
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
  }>()
);

export const multiBookScrapeComicSuccess = createAction(
  '[Multi-Book Scraping] Successfully scraped a comic book',
  props<{
    comicBooks: ComicBook[];
  }>()
);

export const multiBookScrapeComicFailure = createAction(
  '[Multi-Book Scraping] Failed to scrape a comic book'
);
