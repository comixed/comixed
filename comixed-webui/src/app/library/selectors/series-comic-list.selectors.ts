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
  SERIES_COMIC_LIST_FEATURE_KEY,
  seriesComicListAdapter,
  SeriesComicListState
} from '@app/library/reducers/series-comic-list.reducer';

const selectSeriesComicListState = createFeatureSelector<SeriesComicListState>(
  SERIES_COMIC_LIST_FEATURE_KEY
);

export const selectSeriesComicListBusy = createSelector(
  selectSeriesComicListState,
  state => state.busy
);

export const selectSeriesComicListEntries = createSelector(
  selectSeriesComicListState,
  state => seriesComicListAdapter.getSelectors().selectAll(state)
);
