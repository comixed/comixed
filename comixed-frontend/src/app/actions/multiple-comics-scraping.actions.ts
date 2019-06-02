/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Action } from '@ngrx/store';
import { Comic } from 'app/models/comics/comic';

export const MULTIPLE_COMICS_SCRAPING_SETUP =
  '[MULTIPLE COMICS SCRAPING] Setup';
export class MultipleComicsScrapingSetup implements Action {
  readonly type = MULTIPLE_COMICS_SCRAPING_SETUP;

  constructor(
    public payload: {
      api_key: string;
    }
  ) {}
}

export const MULTIPLE_COMICS_SCRAPING_START =
  '[MULTIPLE COMICS SCRAPING] Start scraping';
export class MultipleComicsScrapingStart implements Action {
  readonly type = MULTIPLE_COMICS_SCRAPING_START;

  constructor(public payload: { selected_comics: Array<Comic> }) {}
}

export const MULTIPLE_COMICS_SCRAPING_COMIC_SCRAPED =
  '[MULTIPLE COMICS SCRAPING] Comic scraped';
export class MultipleComicsScrapingComicScraped implements Action {
  readonly type = MULTIPLE_COMICS_SCRAPING_COMIC_SCRAPED;

  constructor(
    public payload: {
      comic: Comic;
    }
  ) {}
}

export type Actions =
  | MultipleComicsScrapingSetup
  | MultipleComicsScrapingStart
  | MultipleComicsScrapingComicScraped;
