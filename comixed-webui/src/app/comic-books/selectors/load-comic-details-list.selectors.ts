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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  COMIC_DETAILS_LIST_FEATURE_KEY,
  ComicDetailsListState
} from '../reducers/comic-details-list.reducer';

export const selectLoadComicDetailsListState =
  createFeatureSelector<ComicDetailsListState>(COMIC_DETAILS_LIST_FEATURE_KEY);

export const selectLoadComicDetailsList = createSelector(
  selectLoadComicDetailsListState,
  state => state.comicDetails
);

export const selectLoadComicDetailsCoverYears = createSelector(
  selectLoadComicDetailsListState,
  state => state.coverYears
);

export const selectLoadComicDetailsCoverMonths = createSelector(
  selectLoadComicDetailsListState,
  state => state.coverMonths
);

export const selectLoadComicDetailsTotalComics = createSelector(
  selectLoadComicDetailsListState,
  state => state.totalCount
);

export const selectLoadComicDetailsFilteredComics = createSelector(
  selectLoadComicDetailsListState,
  state => state.filteredCount
);
