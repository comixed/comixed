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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  MULTI_COMIC_SCRAPING_FEATURE_KEY,
  multiComicScrapingAdapter,
  MultiComicScrapingState
} from '@app/metadata/reducers/multi-comic-scraping.reducer';

const selectMultiComicScrapingState =
  createFeatureSelector<MultiComicScrapingState>(
    MULTI_COMIC_SCRAPING_FEATURE_KEY
  );

export const selectMultiComicScrapingBusy = createSelector(
  selectMultiComicScrapingState,
  state => state.busy
);

export const selectMultiComicScrapingEntries = createSelector(
  selectMultiComicScrapingState,
  state => multiComicScrapingAdapter.getSelectors().selectAll(state)
);

export const selectMultiComicScrapingTotal = createSelector(
  selectMultiComicScrapingState,
  state => state.total
);

export const selectMultiComicsScrapingCurrent = createSelector(
  selectMultiComicScrapingState,
  state => state.current
);
