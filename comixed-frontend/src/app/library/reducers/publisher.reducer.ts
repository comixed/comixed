/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import {
  PublisherActions,
  PublisherActionTypes
} from '../actions/publisher.actions';
import { Publisher } from 'app/library/models/publisher';

export const PUBLISHER_FEATURE_KEY = 'publisher_state';

export interface PublisherState {
  fetchingPublisher: boolean;
  noSuchPublisher: boolean;
  publisher: Publisher;
}

export const initialState: PublisherState = {
  fetchingPublisher: false,
  noSuchPublisher: false,
  publisher: null
};

export function reducer(
  state = initialState,
  action: PublisherActions
): PublisherState {
  switch (action.type) {
    case PublisherActionTypes.Get:
      return { ...state, fetchingPublisher: true, noSuchPublisher: false };

    case PublisherActionTypes.Received:
      return {
        ...state,
        fetchingPublisher: false,
        publisher: action.payload.publisher
      };

    case PublisherActionTypes.GetFailed:
      return {
        ...state,
        fetchingPublisher: false,
        noSuchPublisher: true,
        publisher: null
      };

    default:
      return state;
  }
}
