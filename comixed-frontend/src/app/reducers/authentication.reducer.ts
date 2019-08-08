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

import { AuthenticationState } from 'app/models/state/authentication-state';
import * as AuthActions from 'app/actions/authentication.actions';

export const initial_state: AuthenticationState = {
  initialized: false,
  authenticating: false,
  authenticated: false,
  setting_preference: false,
  user: null,
  auth_token: null,
  show_login: false
};

export function authenticationReducer(
  state: AuthenticationState = initial_state,
  action: AuthActions.Actions
) {
  switch (action.type) {
    case AuthActions.AUTH_CHECK_STATE:
      return { ...state, authenticating: true };

    case AuthActions.AUTH_USER_LOADED:
      return {
        ...state,
        initialized: true,
        authenticated: true,
        authenticating: false,
        show_login: false,
        user: action.payload.user
      };

    case AuthActions.AUTH_NO_USER_LOADED:
      return {
        ...state,
        initialized: true,
        authenticating: false,
        authenticated: false,
        user: null
      };

    case AuthActions.AUTH_SET_TOKEN:
      return {
        ...state,
        authenticated: true,
        auth_token: action.payload.token
      };

    case AuthActions.AUTH_CLEAR_TOKEN:
      return { ...state, authenticated: false, auth_token: null };

    case AuthActions.AUTH_SHOW_LOGIN:
      return { ...state, show_login: true };

    case AuthActions.AUTH_HIDE_LOGIN:
      return { ...state, show_login: false };

    case AuthActions.AUTH_LOGOUT:
      return { ...state, authenticated: false, auth_token: null, user: null };

    case AuthActions.AUTH_SET_PREFERENCE:
      return { ...state, setting_preference: true };

    case AuthActions.AUTH_PREFERENCE_SET:
      return { ...state, setting_preference: false, user: action.payload.user };

    case AuthActions.AUTH_SET_PREFERENCE_FAILED:
      return { ...state, setting_preference: false };

    default:
      return state;
  }
}
