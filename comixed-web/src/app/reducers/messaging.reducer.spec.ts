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
  messagingStarting,
  messagingStopped,
  restartMessaging,
  startMessaging,
  startMessagingFailed,
  stopMessaging,
  stopMessagingFailed
} from '@app/actions/messaging.actions';

describe('Messaging Reducer', () => {
  let state: MessagingState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the starting messaging flag', () => {
      expect(state.startingMessaging).toBeFalse();
    });

    it('clears the stopping messaging flag', () => {
      expect(state.stoppingMessaging).toBeFalse();
    });

    it('clears the messaging started flag', () => {
      expect(state.messagingStarted).toBeFalse();
    });
  });

  describe('starting the messaging system', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, startingMessaging: true, messagingStarted: true },
        startMessaging()
      );
    });

    it('clears the starting messaging flag', () => {
      expect(state.startingMessaging).toBeTrue();
    });

    it('clears the messaging started flag', () => {
      expect(state.messagingStarted).toBeFalse();
    });
  });

  describe('failure to start the messaging system', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, startingMessaging: true },
        startMessagingFailed()
      );
    });

    it('clears the starting messaging flag', () => {
      expect(state.startingMessaging).toBeFalse();
    });
  });

  describe('when the messaging system is starting', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, startingMessaging: false },
        messagingStarting()
      );
    });

    it('sets the starting messaging flag', () => {
      expect(state.startingMessaging).toBeTrue();
    });
  });

  describe('when the messaging system is started', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, startingMessaging: true, messagingStarted: false },
        messagingStarted()
      );
    });

    it('clears the starting messaging flag', () => {
      expect(state.startingMessaging).toBeFalse();
    });

    it('sets the messaging started flag', () => {
      expect(state.messagingStarted).toBeTrue();
    });
  });

  describe('when the messaging system fails to start', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, startingMessaging: true, messagingStarted: true },
        restartMessaging()
      );
    });

    it('sets the starting messaging flag', () => {
      expect(state.startingMessaging).toBeTrue();
    });

    it('clears the messaging started flag', () => {
      expect(state.messagingStarted).toBeFalse();
    });
  });

  describe('stopping the messaging system', () => {
    beforeEach(() => {
      state = reducer({ ...state, stoppingMessaging: false }, stopMessaging());
    });

    it('sets the stopping messaging flag', () => {
      expect(state.stoppingMessaging).toBeTrue();
    });
  });

  describe('successfully stopping the messaging subsystem', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, stoppingMessaging: true, messagingStarted: true },
        messagingStopped()
      );
    });

    it('clears the stopping messaging flag', () => {
      expect(state.stoppingMessaging).toBeFalsy();
    });

    it('clears the messaging started flag', () => {
      expect(state.messagingStarted).toBeFalse();
    });
  });

  describe('failure to stop the messaging subsystem', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, stoppingMessaging: true },
        stopMessagingFailed()
      );
    });

    it('clears the stopping messaging flag', () => {
      expect(state.stoppingMessaging).toBeFalsy();
    });
  });
});
