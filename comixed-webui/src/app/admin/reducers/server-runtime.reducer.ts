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
  loadServerHealth,
  loadServerHealthFailed,
  serverHealthLoaded,
  serverShutdown,
  shutdownServer,
  shutdownServerFailed
} from '../actions/server-runtime.actions';
import { ServerHealth } from '@app/admin/models/server-health';

export const SERVER_RUNTIME_FEATURE_KEY = 'server_runtime_state';

export interface ShutdownState {
  loading: boolean;
  health: ServerHealth;
  busy: boolean;
  shuttingDown: boolean;
}

export const initialState: ShutdownState = {
  loading: false,
  health: null,
  shuttingDown: false,
  busy: false
};

export const reducer = createReducer(
  initialState,

  on(loadServerHealth, state => ({ ...state, loading: true })),
  on(serverHealthLoaded, (state, action) => ({
    ...state,
    loading: false,
    health: action.health
  })),
  on(loadServerHealthFailed, state => ({ ...state, loading: false })),
  on(shutdownServer, state => ({ ...state, busy: true })),
  on(serverShutdown, state => ({ ...state, busy: false, shuttingDown: true })),
  on(shutdownServerFailed, state => ({ ...state, busy: false }))
);
