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
import { User } from 'app/user';

export enum AuthenticationActionTypes {
  AUTH_CHECK_STATE = '[AUTH] Check authentication state',
  AUTH_USER_LOADED = '[AUTH] Authentication user was loaded',
  AUTH_NO_USER_LOADED = '[AUTH] No user was loaded',
  AUTH_SET_TOKEN = '[AUTH] Set auth token',
  AUTH_CLEAR_TOKEN = '[AUTH] Clear auth token',
  AUTH_SHOW_LOGIN = '[AUTH] Show login panel',
  AUTH_HIDE_LOGIN = '[AUTH] Hide login panel',
  AUTH_SUBMIT_LOGIN = '[AUTH] Submit login data',
  AUTH_LOGIN_FAILED = '[AUTH] Login failed',
  AUTH_LOGOUT = '[AUTH] Log the user out',
  AUTH_SET_PREFERENCE = '[AUTH] Set user preference',
  AUTH_PREFERENCE_SET = '[AUTH] User preference set',
  AUTH_SET_PREFERENCE_FAILED = '[AUTH] Failed to set preference'
}

export class AuthCheckState implements Action {
  readonly type = AuthenticationActionTypes.AUTH_CHECK_STATE;

  constructor() {}
}

export class AuthUserLoaded implements Action {
  readonly type = AuthenticationActionTypes.AUTH_USER_LOADED;

  constructor(public payload: { user: User }) {}
}

export class AuthNoUserLoaded implements Action {
  readonly type = AuthenticationActionTypes.AUTH_NO_USER_LOADED;

  constructor() {}
}

export class AuthSetToken implements Action {
  readonly type = AuthenticationActionTypes.AUTH_SET_TOKEN;

  constructor(public payload: { token: string }) {}
}

export class AuthClearToken implements Action {
  readonly type = AuthenticationActionTypes.AUTH_CLEAR_TOKEN;

  constructor() {}
}

export class AuthShowLogin implements Action {
  readonly type = AuthenticationActionTypes.AUTH_SHOW_LOGIN;

  constructor() {}
}

export class AuthHideLogin implements Action {
  readonly type = AuthenticationActionTypes.AUTH_HIDE_LOGIN;

  constructor() {}
}

export class AuthSubmitLogin implements Action {
  readonly type = AuthenticationActionTypes.AUTH_SUBMIT_LOGIN;

  constructor(public payload: { email: string; password: string }) {}
}

export class AuthLoginFailed implements Action {
  readonly type = AuthenticationActionTypes.AUTH_LOGIN_FAILED;

  constructor() {}
}

export class AuthLogout implements Action {
  readonly type = AuthenticationActionTypes.AUTH_LOGOUT;

  constructor() {}
}

export class AuthSetPreference implements Action {
  readonly type = AuthenticationActionTypes.AUTH_SET_PREFERENCE;

  constructor(public payload: { name: string; value: string }) {}
}

export class AuthPreferenceSet implements Action {
  readonly type = AuthenticationActionTypes.AUTH_PREFERENCE_SET;

  constructor(public payload: { user: User }) {}
}

export class AuthSetPreferenceFailed implements Action {
  readonly type = AuthenticationActionTypes.AUTH_SET_PREFERENCE_FAILED;

  constructor() {}
}

export type AuthenticationActions =
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
