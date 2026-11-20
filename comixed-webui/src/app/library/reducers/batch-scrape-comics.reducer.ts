/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { BatchScrapeComicsActions } from '../actions/batch-scrape-comics.actions';

export const BATCH_SCRAPE_COMICS_FEATURE_KEY = 'batch_scrape_comics_state';

export interface BatchScrapeComicsState {
  busy: boolean;
}

export const initialBatchScrapeComicsState: BatchScrapeComicsState = {
  busy: false
};

export const batchScrapeComicsReducer = createReducer(
  initialBatchScrapeComicsState,
  on(BatchScrapeComicsActions.startBatchScraping, state => ({
    ...state,
    busy: true
  })),
  on(BatchScrapeComicsActions.startBatchScrapingSuccess, state => ({
    ...state,
    busy: false
  })),
  on(BatchScrapeComicsActions.startBatchScrapingFailure, state => ({
    ...state,
    busy: false
  }))
);

export const batchScrapeComicsFeature = createFeature({
  name: BATCH_SCRAPE_COMICS_FEATURE_KEY,
  reducer: batchScrapeComicsReducer
});
