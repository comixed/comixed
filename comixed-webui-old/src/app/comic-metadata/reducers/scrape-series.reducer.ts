/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
  scrapeSeriesMetadata,
  scrapeSeriesMetadataFailure,
  scrapeSeriesMetadataSuccess
} from '../actions/scrape-series.actions';

export const SCRAPE_SERIES_FEATURE_KEY = 'scrape_series_state';

export interface SeriesScrapingState {
  busy: boolean;
}

export const initialState: SeriesScrapingState = {
  busy: false
};

export const reducer = createReducer(
  initialState,

  on(scrapeSeriesMetadata, state => ({ ...state, busy: true })),
  on(scrapeSeriesMetadataSuccess, state => ({ ...state, busy: false })),
  on(scrapeSeriesMetadataFailure, state => ({ ...state, busy: false }))
);

export const scrapeSeriesFeature = createFeature({
  name: SCRAPE_SERIES_FEATURE_KEY,
  reducer
});
