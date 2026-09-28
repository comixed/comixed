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

import {
  messagingReducer,
  initialMessagingState,
  MessagingState
} from './messaging.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { MessagingActions } from '@app/messaging/actions/messaging.actions';

describe('Messaging Reducer', () => {
  let state: MessagingState;

  beforeEach(() => {
    state = { ...initialMessagingState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = messagingReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the started flag', () => {
      expect(state.started).toBeFalsy();
    });

    it('should not set the starting flag', () => {
      expect(state.starting).toBeFalsy();
    });

    it('should not set the stopping flag', () => {
      expect(state.stopping).toBeFalsy();
    });
  });

  describe('starting messaging', () => {
    beforeEach(() => {
      state = messagingReducer(
        { ...state, starting: false, stopping: true },
        MessagingActions.start()
      );
    });

    it('should set the starting flag', () => {
      expect(state.starting).toBeTruthy();
    });

    it('should clear the stopping flag', () => {
      expect(state.stopping).toBeFalsy();
    });
  });

  describe('messaging has started', () => {
    beforeEach(() => {
      state = messagingReducer(
        { ...state, starting: true, started: false },
        MessagingActions.started()
      );
    });

    it('should clear the starting flag', () => {
      expect(state.starting).toBeFalsy();
    });

    it('should set the started flag', () => {
      expect(state.started).toBeTruthy();
    });
  });

  describe('stopping messaging', () => {
    beforeEach(() => {
      state = messagingReducer(
        { ...state, starting: true, stopping: false },
        MessagingActions.stop()
      );
    });

    it('should set the stopping flag', () => {
      expect(state.stopping).toBeTruthy();
    });

    it('should clear the starting flag', () => {
      expect(state.starting).toBeFalsy();
    });
  });

  describe('messaging has stopped', () => {
    beforeEach(() => {
      state = messagingReducer(
        { ...state, started: true, stopping: true },
        MessagingActions.stopped()
      );
    });

    it('should clear the started flag', () => {
      expect(state.started).toBeFalsy();
    });

    it('should clear the stopping flag', () => {
      expect(state.stopping).toBeFalsy();
    });
  });
});
