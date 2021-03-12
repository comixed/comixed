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

import { initialState, MessagingState, reducer } from './messaging.reducer';
import {
  messagingStarted,
  messagingStopped,
  restartMessaging,
  startMessaging,
  stopMessaging
} from '@app/messaging/actions/messaging.actions';

describe('Messaging Reducer', () => {
  let state: MessagingState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('clears the started flag', () => {
      expect(state.started).toBeFalse();
    });
  });

  describe('starting the messaging system', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, started: true },
        startMessaging()
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    it('clears the started flag', () => {
      expect(state.started).toBeFalse();
    });
  });

  describe('when the messaging system is started', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, started: false },
        messagingStarted()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the started flag', () => {
      expect(state.started).toBeTrue();
    });
  });

  describe('when restarting the messaging system', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, restartMessaging());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('stopping the messaging system', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, stopMessaging());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('successfully stopping the messaging subsystem', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, started: true },
        messagingStopped()
      );
    });

    it('clears the started flag', () => {
      expect(state.started).toBeFalse();
    });

    it('clears the started flag', () => {
      expect(state.started).toBeFalse();
    });
  });
});
