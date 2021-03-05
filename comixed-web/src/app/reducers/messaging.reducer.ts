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
  messagingStarting,
  messagingStopped,
  restartMessaging,
  startMessaging,
  startMessagingFailed,
  stopMessaging,
  stopMessagingFailed
} from '@app/actions/messaging.actions';

export const MESSAGING_FEATURE_KEY = 'messaging_state';

export interface MessagingState {
  startingMessaging: boolean;
  stoppingMessaging: boolean;
  messagingStarted: boolean;
}

export const initialState: MessagingState = {
  startingMessaging: false,
  stoppingMessaging: false,
  messagingStarted: false
};

export const reducer = createReducer(
  initialState,
  on(startMessaging, state => ({
    ...state,
    startingMessaging: true,
    messagingStarted: false
  })),
  on(messagingStarting, state => ({ ...state, startingMessaging: true })),
  on(startMessagingFailed, state => ({ ...state, startingMessaging: false })),
  on(messagingStarted, state => ({
    ...state,
    startingMessaging: false,
    messagingStarted: true
  })),
  on(restartMessaging, state => ({
    ...state,
    startingMessaging: true,
    messagingStarted: false
  })),
  on(stopMessaging, state => ({ ...state, stoppingMessaging: true })),
  on(messagingStopped, state => ({
    ...state,
    stoppingMessaging: false,
    messagingStarted: false
  })),
  on(stopMessagingFailed, state => ({ ...state, stoppingMessaging: false }))
);
