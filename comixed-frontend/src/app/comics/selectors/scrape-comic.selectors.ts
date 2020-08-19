/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  SCRAPE_COMIC_FEATURE_KEY,
  ScrapeComicState
} from '../reducers/scrape-comic.reducer';

/**
 * Selects the feature state.
 */
export const selectScrapeComicState = createFeatureSelector<ScrapeComicState>(
  SCRAPE_COMIC_FEATURE_KEY
);

/**
 * Selects the saving flag.
 */
export const selectScrapeComicScraping = createSelector(
  selectScrapeComicState,
  state => state.scraping
);

/**
 * Selects the saving flag.
 */
export const selectScrapeComicSuccess = createSelector(
  selectScrapeComicState,
  state => state.success
);

/**
 * Selects the comic.
 */
export const selectScrapeComic = createSelector(
  selectScrapeComicState,
  state => state.comic
);
