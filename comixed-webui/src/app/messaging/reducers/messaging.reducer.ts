/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { createReducer, on } from '@ngrx/store';
import {
  messagingStarted,
  messagingStopped,
  restartMessaging,
  startMessaging,
  stopMessaging
} from '@app/messaging/actions/messaging.actions';

export const MESSAGING_FEATURE_KEY = 'messaging_state';

export interface MessagingState {
  busy: boolean;
  started: boolean;
}

export const initialState: MessagingState = {
  busy: false,
  started: false
};

export const reducer = createReducer(
  initialState,
  on(startMessaging, state => ({
    ...state,
    busy: true,
    started: false
  })),
  on(messagingStarted, state => ({
    ...state,
    busy: false,
    started: true
  })),
  on(restartMessaging, state => ({
    ...state,
    busy: true
  })),
  on(stopMessaging, state => ({ ...state, busy: true })),
  on(messagingStopped, state => ({
    ...state,
    busy: false,
    started: false
  }))
);
