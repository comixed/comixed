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

import { initialState, reducer, ShutdownState } from './server-runtime.reducer';
import {
  loadServerHealth,
  loadServerHealthFailed,
  serverHealthLoaded,
  serverShutdown,
  shutdownServer,
  shutdownServerFailed
} from '@app/admin/actions/server-runtime.actions';
import { SERVER_HEALTH } from '@app/admin/admin.fixtures';

describe('ServerRuntime Reducer', () => {
  const HEALTH = SERVER_HEALTH;

  let state: ShutdownState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('has no health status', () => {
      expect(state.health).toBeNull();
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('clears the shutting down flag', () => {
      expect(state.shuttingDown).toBeFalse();
    });
  });

  describe('loading the server health', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, loadServerHealth());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('success loading server health', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, health: null },
        serverHealthLoaded({ health: HEALTH })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });

  describe('failure loading server health', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadServerHealthFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });

  describe('shutting the server down', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, shutdownServer());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });
  });

  describe('shutting the server down succeeded', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: true, shuttingDown: false },
        serverShutdown()
      );
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('sets the shutting down flag', () => {
      expect(state.shuttingDown).toBeTrue();
    });
  });

  describe('shutting the server down failed', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: true }, shutdownServerFailed());
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });
  });
});
