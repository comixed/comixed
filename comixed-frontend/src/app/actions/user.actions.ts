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

import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { User } from 'app/models/user/user';

export const USER_AUTH_CHECK = '[USER] Check if the user is already logged in.';
export class UserAuthCheck implements Action {
  readonly type = USER_AUTH_CHECK;

  constructor() {}
}

export const USER_LOADED = '[USER] Retrieved the remote user';
export class UserLoaded implements Action {
  readonly type = USER_LOADED;

  constructor(
    public payload: {
      user: User;
    }
  ) {}
}

export const USER_START_LOGIN = '[USER] Start the login process';
export class UserStartLogin implements Action {
  readonly type = USER_START_LOGIN;

  constructor() {}
}

export const USER_CANCEL_LOGIN = '[USER] Cancel the login process';
export class UserCancelLogin implements Action {
  readonly type = USER_CANCEL_LOGIN;

  constructor() {}
}

export const USER_LOGGING_IN = '[USER] Performing the actual login process';
export class UserLoggingIn implements Action {
  readonly type = USER_LOGGING_IN;

  constructor(
    public payload: {
      email: string;
      password: string;
    }
  ) {}
}

export const USER_SET_AUTH_TOKEN = '[USER] Save the auth token';
export class UserSetAuthToken implements Action {
  readonly type = USER_SET_AUTH_TOKEN;

  constructor(
    public payload: {
      token: string;
    }
  ) {}
}

export const USER_LOGOUT = '[USER] Logout';
export class UserLogout implements Action {
  readonly type = USER_LOGOUT;

  constructor() {}
}

export const USER_SET_PREFERENCE = '[USER] Saves the given user preference';
export class UserSetPreference implements Action {
  readonly type = USER_SET_PREFERENCE;

  constructor(
    public payload: {
      name: string;
      value: string;
    }
  ) {}
}

export const USER_PREFERENCE_SAVED = '[USER] The user preference was saved';
export class UserPreferenceSaved implements Action {
  readonly type = USER_PREFERENCE_SAVED;

  constructor(
    public payload: {
      name: string;
      value: string;
    }
  ) {}
}

export type Actions =
  | UserAuthCheck
  | UserLoaded
  | UserStartLogin
  | UserCancelLogin
  | UserLoggingIn
  | UserSetAuthToken
  | UserLogout
  | UserSetPreference
  | UserPreferenceSaved;
