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
import { User } from '@app/user/models/user';
import {
  loadCurrentUser,
  loadCurrentUserFailure,
  loadCurrentUserSuccess,
  login,
  loginFailure,
  loginSuccess
} from '@app/user/actions/authentication.actions';

export const AUTHENTICATION_FEATURE_KEY = 'authentication_state';

export interface AuthenticationState {
  busy: boolean;
  authenticated: boolean;
  user: User | null;
}

export const initialAuthenticationState: AuthenticationState = {
  busy: false,
  authenticated: false,
  user: null
};

export const authenticationReducer = createReducer(
  initialAuthenticationState,
  on(loadCurrentUser, state => ({ ...state, busy: true })),
  on(loadCurrentUserSuccess, (state, action) => ({
    ...state,
    busy: false,
    authenticated: true,
    user: action.user
  })),
  on(loadCurrentUserFailure, state => ({
    ...state,
    busy: false,
    authenticated: false,
    user: null
  })),
  on(login, state => ({
    ...state,
    busy: true,
    authenticated: false,
    user: null
  })),
  on(loginSuccess, state => ({
    ...state,
    busy: false,
    authenticated: true
  })),
  on(loginFailure, state => ({ ...state, busy: false }))
);

export const authenticationFeature = createFeature({
  name: AUTHENTICATION_FEATURE_KEY,
  reducer: authenticationReducer
});
