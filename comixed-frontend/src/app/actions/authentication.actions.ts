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
import { User } from 'app/models/user';

export const AUTH_CHECK_STATE = '[AUTH] Check authentication state';
export class AuthCheckState implements Action {
  readonly type = AUTH_CHECK_STATE;

  constructor() {}
}

export const AUTH_USER_LOADED = '[AUTH] Authentication user was loaded';
export class AuthUserLoaded implements Action {
  readonly type = AUTH_USER_LOADED;

  constructor(public payload: { user: User }) {}
}

export const AUTH_NO_USER_LOADED = '[AUTH] No user was loaded';
export class AuthNoUserLoaded implements Action {
  readonly type = AUTH_NO_USER_LOADED;

  constructor() {}
}

export const AUTH_SET_TOKEN = '[AUTH] Set auth token';
export class AuthSetToken implements Action {
  readonly type = AUTH_SET_TOKEN;

  constructor(public payload: { token: string }) {}
}

export const AUTH_CLEAR_TOKEN = '[AUTH] Clear auth token';
export class AuthClearToken implements Action {
  readonly type = AUTH_CLEAR_TOKEN;

  constructor() {}
}

export const AUTH_SHOW_LOGIN = '[AUTH] Show login panel';
export class AuthShowLogin implements Action {
  readonly type = AUTH_SHOW_LOGIN;

  constructor() {}
}

export const AUTH_HIDE_LOGIN = '[AUTH] Hide login panel';
export class AuthHideLogin implements Action {
  readonly type = AUTH_HIDE_LOGIN;

  constructor() {}
}

export const AUTH_SUBMIT_LOGIN = '[AUTH] Submit login data';
export class AuthSubmitLogin implements Action {
  readonly type = AUTH_SUBMIT_LOGIN;

  constructor(public payload: { email: string; password: string }) {}
}

export const AUTH_LOGIN_FAILED = '[AUTH] Login failed';
export class AuthLoginFailed implements Action {
  readonly type = AUTH_LOGIN_FAILED;

  constructor() {}
}

export const AUTH_LOGOUT = '[AUTH] Log the user out';
export class AuthLogout implements Action {
  readonly type = AUTH_LOGOUT;

  constructor() {}
}

export const AUTH_SET_PREFERENCE = '[AUTH] Set user preference';
export class AuthSetPreference implements Action {
  readonly type = AUTH_SET_PREFERENCE;

  constructor(public payload: { name: string; value: string }) {}
}

export const AUTH_PREFERENCE_SET = '[AUTH] User preference set';
export class AuthPreferenceSet implements Action {
  readonly type = AUTH_PREFERENCE_SET;

  constructor(public payload: { user: User }) {}
}

export const AUTH_SET_PREFERENCE_FAILED = '[AUTH] Failed to set preference';
export class AuthSetPreferenceFailed implements Action {
  readonly type = AUTH_SET_PREFERENCE_FAILED;

  constructor() {}
}

export type Actions =
  | AuthCheckState
  | AuthUserLoaded
  | AuthNoUserLoaded
  | AuthSetToken
  | AuthClearToken
  | AuthShowLogin
  | AuthHideLogin
  | AuthSubmitLogin
  | AuthLoginFailed
  | AuthLogout
  | AuthSetPreference
  | AuthPreferenceSet
  | AuthSetPreferenceFailed;
