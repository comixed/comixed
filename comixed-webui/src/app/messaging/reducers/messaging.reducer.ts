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
import { MessagingActions } from '@app/messaging/actions/messaging.actions';

export const MESSAGING_FEATURE_KEY = 'messaging_state';

export interface MessagingState {
  started: boolean;
  starting: boolean;
  stopping: boolean;
}

export const initialMessagingState: MessagingState = {
  started: false,
  starting: false,
  stopping: false
};

export const messagingReducer = createReducer(
  initialMessagingState,
  on(MessagingActions.start, state => ({
    ...state,
    starting: true,
    stopping: false
  })),
  on(MessagingActions.started, state => ({
    ...state,
    starting: false,
    started: true
  })),
  on(MessagingActions.stop, state => ({
    ...state,
    starting: false,
    stopping: true
  })),
  on(MessagingActions.stopped, state => ({
    ...state,
    stopping: false,
    started: false
  }))
);

export const messagingFeature = createFeature({
  name: MESSAGING_FEATURE_KEY,
  reducer: messagingReducer
});
