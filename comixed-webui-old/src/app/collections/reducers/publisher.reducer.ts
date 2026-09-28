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
  loadPublisherDetailFailure,
  loadPublisherDetailSuccess,
  loadPublisherList,
  loadPublisherListFailure,
  loadPublisherListSuccess
} from '../actions/publisher.actions';
import { Publisher } from '@app/collections/models/publisher';
import { Series } from '@app/collections/models/series';

export const PUBLISHER_FEATURE_KEY = 'publisher_state';

export interface PublisherState {
  busy: boolean;
  total: number;
  publishers: Publisher[];
  totalSeries: number;
  detail: Series[];
}

export const initialState: PublisherState = {
  busy: false,
  total: 0,
  publishers: [],
  totalSeries: 0,
  detail: []
};

export const reducer = createReducer(
  initialState,

  on(loadPublisherList, state => ({ ...state, busy: true, publishers: [] })),
  on(loadPublisherListSuccess, (state, action) => ({
    ...state,
    busy: false,
    total: action.total,
    publishers: action.publishers
  })),
  on(loadPublisherListFailure, state => ({ ...state, busy: false })),
  on(loadPublisherDetail, state => ({ ...state, busy: true, detail: [] })),
  on(loadPublisherDetailSuccess, (state, action) => ({
    ...state,
    busy: false,
    totalSeries: action.totalSeries,
    detail: action.detail
  })),
  on(loadPublisherDetailFailure, state => ({ ...state, busy: false }))
);

export const publisherFeature = createFeature({
  name: PUBLISHER_FEATURE_KEY,
  reducer
});
