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
import { Publisher } from '@app/library/models/publisher';
import { PublisherListActions } from '@app/library/actions/publisher-list.actions';

export const PUBLISHER_LIST_FEATURE_KEY = 'publisher_list_state';

export interface PublisherListState extends EntityState<Publisher> {
  loading: boolean;
  total: number;
}

export const publisherListAdaptor: EntityAdapter<Publisher> =
  createEntityAdapter<Publisher>({
    selectId: publisher => publisher.name,
    sortComparer: (left, right) => left.name.localeCompare(right.name)
  });

export const initialPublisherListState: PublisherListState =
  publisherListAdaptor.getInitialState({
    loading: false,
    total: 0
  });

export const publisherListReducer = createReducer(
  initialPublisherListState,
  on(PublisherListActions.load, state => ({ ...state, loading: true })),
  on(PublisherListActions.loadSuccess, (state, action) =>
    publisherListAdaptor.setAll(action.publishers, {
      ...state,
      loading: false,
      total: action.total
    })
  ),
  on(PublisherListActions.loadFailure, state => ({ ...state, loading: false }))
);

export const publisherListsFeature = createFeature({
  name: PUBLISHER_LIST_FEATURE_KEY,
  reducer: publisherListReducer
});
