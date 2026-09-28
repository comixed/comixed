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
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Series } from '@app/library/models/series';
import { PublisherSeriesListActions } from '@app/library/actions/publisher-series-list.actions';

export const PUBLISHER_SERIES_LIST_FEATURE_KEY = 'publisher_series_list_state';

export interface PublisherSeriesListState extends EntityState<Series> {
  busy: boolean;
  total: number;
}

export const publisherSeriesListAdapter: EntityAdapter<Series> =
  createEntityAdapter<Series>({
    selectId: series => `${series.name}:${series.volume}`,
    sortComparer: (left, right) =>
      `${left.name}:left.volume}`.localeCompare(`${right.name}:${right.volume}`)
  });

export const initialPublisherSeriesListState: PublisherSeriesListState =
  publisherSeriesListAdapter.getInitialState({
    busy: false,
    total: 0
  });

export const publisherSeriesListReducer = createReducer(
  initialPublisherSeriesListState,
  on(PublisherSeriesListActions.load, state => ({ ...state, busy: true })),
  on(PublisherSeriesListActions.loadSuccess, (state, action) => {
    return publisherSeriesListAdapter.setAll(action.entries, {
      ...state,
      busy: false,
      total: action.total
    });
  }),
  on(PublisherSeriesListActions.loadFailure, state => ({
    ...state,
    busy: true
  }))
);

export const publisherSeriesListsFeature = createFeature({
  name: PUBLISHER_SERIES_LIST_FEATURE_KEY,
  reducer: publisherSeriesListReducer
});
