/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Action } from '@ngrx/store';
import { User } from 'app/models/user/user';
import { Preference } from 'app/models/user/preference';
import * as UserActions from 'app/actions/user.actions';

const initial_state: User = {
  initialized: false,
  id: null,
  token: null,
  fetching: false,
  authenticating: false,
  busy: false,
  authenticated: false,
  is_admin: false,
  is_reader: false,
  email: null,
  roles: [],
  preferences: [],
  first_login_date: null,
  last_login_date: null
};

export function userReducer(
  state: User = initial_state,
  action: UserActions.Actions
) {
  switch (action.type) {
    case UserActions.USER_AUTH_CHECK:
      return {
        ...state,
        fetching: true,
        authenticating: false,
        is_admin: false,
        is_reader: false
      };

    case UserActions.USER_SET_AUTH_TOKEN:
      return {
        ...state,
        initialized: true,
        fetching: false,
        authentication: false,
        busy: false,
        token: action.payload.token
      };

    case UserActions.USER_LOADED: {
      const user = action.payload.user;
      let is_admin = false;
      let is_reader = false;

      if (user) {
        is_admin = user.roles.some((pref: Preference) => {
          return pref.name === 'ADMIN';
        });
        is_reader = user.roles.some((pref: Preference) => {
          return pref.name === 'READER';
        });
      }
      return {
        ...state,
        initialized: true,
        fetching: false,
        authenticating: false,
        authenticated: user ? true : false,
        is_admin: is_admin,
        is_reader: is_reader,
        id: user ? user.id : null,
        email: user ? user.email : null,
        roles: user ? user.roles : [],
        preferences: user ? user.preferences : [],
        first_login_date: user ? user.first_login_date : null,
        last_login_date: user ? user.last_login_date : null
      };
    }

    case UserActions.USER_START_LOGIN:
      return {
        ...state,
        authenticating: true
      };

    case UserActions.USER_CANCEL_LOGIN:
      return {
        ...state,
        authenticating: false
      };

    case UserActions.USER_LOGGING_IN:
      return {
        ...state,
        authenticated: false,
        busy: true
      };

    case UserActions.USER_LOGOUT:
      return {
        ...state,
        authenticated: false,
        is_admin: false,
        is_reader: false,
        token: null,
        busy: false,
        id: null,
        email: null,
        roles: [],
        preferences: [],
        first_login_date: null,
        last_login_date: null
      };

    case UserActions.USER_SET_PREFERENCE:
      return {
        ...state,
        busy: true
      };

    case UserActions.USER_PREFERENCE_SAVED: {
      const preferences = state.preferences.filter((preference: Preference) => {
        return preference.name !== action.payload.name;
      });
      preferences.push({
        name: action.payload.name,
        value: action.payload.value
      });

      return {
        ...state,
        busy: false,
        preferences: preferences
      };
    }

    default:
      return state;
  }
}
