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
  SINGLE_BOOK_SCRAPING_FEATURE_KEY,
  SingleBookScrapingState
} from '../reducers/single-book-scraping.reducer';

/** Selects for the feature state. */
export const selectSingleBookScrapingState =
  createFeatureSelector<SingleBookScrapingState>(
    SINGLE_BOOK_SCRAPING_FEATURE_KEY
  );

/** Selects for the scraping volumes. */
export const selectScrapingVolumeMetadata = createSelector(
  selectSingleBookScrapingState,
  state => state.volumes
);

/** Selects for the scraping issue. */
export const selectScrapingIssueMetadata = createSelector(
  selectSingleBookScrapingState,
  state => state.scrapingIssue
);

export const selectChosenMetadataSource = createSelector(
  selectSingleBookScrapingState,
  state => state.metadataSource
);
