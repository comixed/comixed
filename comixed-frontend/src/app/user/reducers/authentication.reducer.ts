/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  AuthenticationActions,
  AuthenticationActionTypes
} from '../actions/authentication.actions';
import * as AuthActions from 'app/user/actions/authentication.actions';
import {
  AuthenticationState,
  initial_state
} from 'app/user/models/authentication-state';

export const AUTHENTICATION_FEATURE_KEY = 'auth_state';

export function reducer(
  state = initial_state,
  action: AuthenticationActions
): AuthenticationState {
  switch (action.type) {
    case AuthenticationActionTypes.AUTH_CHECK_STATE:
      return { ...state, authenticating: true };

    case AuthenticationActionTypes.AUTH_USER_LOADED:
      return {
        ...state,
        initialized: true,
        authenticated: true,
        authenticating: false,
        show_login: false,
        user: action.payload.user
      };

    case AuthenticationActionTypes.AUTH_NO_USER_LOADED:
      return {
        ...state,
        initialized: true,
        authenticating: false,
        authenticated: false,
        user: null
      };

    case AuthenticationActionTypes.AUTH_SET_TOKEN:
      return {
        ...state,
        authenticated: true,
        auth_token: action.payload.token
      };

    case AuthenticationActionTypes.AUTH_CLEAR_TOKEN:
      return { ...state, authenticated: false, auth_token: null };

    case AuthenticationActionTypes.AUTH_SHOW_LOGIN:
      return { ...state, show_login: true };

    case AuthenticationActionTypes.AUTH_HIDE_LOGIN:
      return { ...state, show_login: false };

    case AuthenticationActionTypes.AUTH_LOGOUT:
      return { ...state, authenticated: false, auth_token: null, user: null };

    case AuthenticationActionTypes.AUTH_SET_PREFERENCE:
      return { ...state, setting_preference: true };

    case AuthenticationActionTypes.AUTH_PREFERENCE_SET:
      return { ...state, setting_preference: false, user: action.payload.user };

    case AuthenticationActionTypes.AUTH_SET_PREFERENCE_FAILED:
      return { ...state, setting_preference: false };

    default:
      return state;
  }
}
