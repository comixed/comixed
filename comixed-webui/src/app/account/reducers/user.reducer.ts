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
import { User } from '@app/account/models/user';
import { UserActions } from '@app/account/actions/user.actions';

export const USER_FEATURE_KEY = 'user_state';

export interface UserState {
  busy: boolean;
  checked: boolean;
  user: User | null;
}

export const initialUserState: UserState = {
  busy: false,
  checked: false,
  user: null
};

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.login, state => ({
    ...state,
    busy: true,
    checked: false,
    user: null
  })),
  on(UserActions.loginSuccess, state => ({
    ...state,
    busy: false,
    checked: true
  })),
  on(UserActions.loginFailure, state => ({
    ...state,
    busy: false,
    checked: true
  })),
  on(UserActions.load, state => ({
    ...state,
    busy: true,
    checked: false,
    user: null
  })),
  on(UserActions.loadSuccess, (state, action) => ({
    ...state,
    busy: false,
    checked: true,
    user: action.user
  })),
  on(UserActions.loadFailure, state => ({
    ...state,
    busy: false,
    checked: false
  })),
  on(UserActions.userUpdate, (state, action) => ({
    ...state,
    user: action.user
  })),
  on(UserActions.savePreference, state => ({ ...state, busy: true })),
  on(UserActions.savePreferenceSuccess, (state, action) => ({
    ...state,
    busy: false,
    user: action.user
  })),
  on(UserActions.savePreferenceFailure, state => ({ ...state, busy: false }))
);

export const userFeature = createFeature({
  name: USER_FEATURE_KEY,
  reducer: userReducer
});
