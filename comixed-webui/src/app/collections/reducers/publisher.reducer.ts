/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import {
  loadPublisherDetail,
  loadPublisherDetailFailed,
  loadPublishers,
  loadPublishersFailed,
  publisherDetailLoaded,
  publishersLoaded
} from '../actions/publisher.actions';
import { Publisher } from '@app/collections/models/publisher';
import { Series } from '@app/collections/models/series';

export const PUBLISHER_FEATURE_KEY = 'publisher_state';

export interface PublisherState {
  busy: boolean;
  publishers: Publisher[];
  detail: Series[];
}

export const initialState: PublisherState = {
  busy: false,
  publishers: [],
  detail: []
};

export const reducer = createReducer(
  initialState,

  on(loadPublishers, state => ({ ...state, busy: true, publishers: [] })),
  on(publishersLoaded, (state, action) => ({
    ...state,
    busy: false,
    publishers: action.publishers
  })),
  on(loadPublishersFailed, state => ({ ...state, busy: false })),
  on(loadPublisherDetail, state => ({ ...state, busy: true, detail: [] })),
  on(publisherDetailLoaded, (state, action) => ({
    ...state,
    busy: false,
    detail: action.detail
  })),
  on(loadPublisherDetailFailed, state => ({ ...state, busy: false }))
);

export const publisherFeature = createFeature({
  name: PUBLISHER_FEATURE_KEY,
  reducer
});
