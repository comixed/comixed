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
  COMIC_LIST_FEATURE_KEY,
  comicListAdaptor,
  ComicListState
} from '../reducers/comic-list.reducer';

const selectComicListState = createFeatureSelector<ComicListState>(
  COMIC_LIST_FEATURE_KEY
);

export const selectComicListLoading = createSelector(
  selectComicListState,
  state => state.loading
);

export const selectComicList = createSelector(selectComicListState, state =>
  comicListAdaptor.getSelectors().selectAll(state)
);

export const selectComicListTotalCount = createSelector(
  selectComicListState,
  state => state.totalCount
);

export const selectComicListFilterCount = createSelector(
  selectComicListState,
  state => state.filterCount
);

export const selectComicListCoverMonthList = createSelector(
  selectComicListState,
  state => state.coverMonthList
);

export const selectComicListCoverYearList = createSelector(
  selectComicListState,
  state => state.coverYearList
);
