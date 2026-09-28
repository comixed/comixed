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
  PUBLISHER_SERIES_LIST_FEATURE_KEY,
  publisherSeriesListAdaptor,
  PublisherSeriesListState
} from '@app/library/reducers/publisher-series-list.reducer';

const selectPublisherSeriesListState =
  createFeatureSelector<PublisherSeriesListState>(
    PUBLISHER_SERIES_LIST_FEATURE_KEY
  );

export const selectPublisherSeriesListBusy = createSelector(
  selectPublisherSeriesListState,
  state => state.busy
);

export const selectPublisherSeriesListEntries = createSelector(
  selectPublisherSeriesListState,
  state => publisherSeriesListAdaptor.getSelectors().selectAll(state)
);

export const selectPublisherSeriesListTotal = createSelector(
  selectPublisherSeriesListState,
  state => state.total
);
