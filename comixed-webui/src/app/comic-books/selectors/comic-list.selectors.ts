/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
  COMIC_LIST_FEATURE_KEY,
  ComicListState
} from '../reducers/comic-list.reducer';

export const selectComicListState = createFeatureSelector<ComicListState>(
  COMIC_LIST_FEATURE_KEY
);

export const selectComicList = createSelector(
  selectComicListState,
  state => state.comics
);

export const selectComicCoverYears = createSelector(
  selectComicListState,
  state => state.coverYears
);

export const selectComicCoverMonths = createSelector(
  selectComicListState,
  state => state.coverMonths
);

export const selectComicTotalCount = createSelector(
  selectComicListState,
  state => state.totalCount
);

export const selectComicFilteredCount = createSelector(
  selectComicListState,
  state => state.filteredCount
);
