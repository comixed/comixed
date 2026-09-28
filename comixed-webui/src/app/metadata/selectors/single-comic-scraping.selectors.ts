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
  SINGLE_COMIC_SCRAPING_FEATURE_KEY,
  singleComicScrapingAdapter,
  SingleComicScrapingState
} from '@app/metadata/reducers/single-comic-scraping.reducer';

const selectSingleComicScrapingState =
  createFeatureSelector<SingleComicScrapingState>(
    SINGLE_COMIC_SCRAPING_FEATURE_KEY
  );

export const selectSingleComicScrapingBusy = createSelector(
  selectSingleComicScrapingState,
  state => state.busy
);

export const selectSingleComicScrapingEntries = createSelector(
  selectSingleComicScrapingState,
  state => singleComicScrapingAdapter.getSelectors().selectAll(state)
);

export const selectSingleComicScrapingIssue = createSelector(
  selectSingleComicScrapingState,
  state => state.issue
);
