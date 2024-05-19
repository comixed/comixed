/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import {
  loadCurrentUser,
  loadCurrentUserFailure,
  loadCurrentUserSuccess,
  loginUser,
  loginUserFailure,
  loginUserSuccess,
  logoutUser,
  logoutUserFailure,
  logoutUserSuccess,
  saveCurrentUser,
  saveCurrentUserFailure,
  saveUserPreference,
  saveUserPreferenceFailure,
  saveUserPreferenceSuccess
} from '../actions/user.actions';
import { User } from '@app/user/models/user';

export const USER_FEATURE_KEY = 'user_state';

export interface UserState {
  initializing: boolean;
  loading: boolean;
  authenticating: boolean;
  authenticated: boolean;
  user: User;
  saving: boolean;
}

export const initialState: UserState = {
  initializing: true,
  loading: false,
  authenticating: false,
  authenticated: false,
  user: null,
  saving: false
};

export const reducer = createReducer(
  initialState,

  on(loadCurrentUser, state => ({
    ...state,
    initializing: true,
    loading: true
  })),
  on(loadCurrentUserSuccess, (state, action) => ({
    ...state,
    initializing: false,
    loading: false,
    saving: false,
    authenticated: true,
    user: action.user
  })),
  on(loadCurrentUserFailure, state => ({
    ...state,
    initializing: false,
    authenticating: false,
    authenticated: false,
    loading: false,
    user: null
  })),
  on(loginUser, state => ({
    ...state,
    authenticating: true,
    authenticated: false,
    user: null
  })),
  on(loginUserSuccess, (state, action) => ({
    ...state,
    authenticating: false,
    authenticated: true
  })),
  on(loginUserFailure, state => ({ ...state, authenticating: false })),
  on(logoutUser, state => ({ ...state, authenticating: true })),
  on(logoutUserSuccess, state => ({
    ...state,
    authenticating: false,
    authenticated: false,
    user: null
  })),
  on(logoutUserFailure, state => ({ ...state, authenticating: false })),
  on(saveUserPreference, state => ({ ...state, saving: true })),
  on(saveUserPreferenceSuccess, (state, action) => ({
    ...state,
    saving: false,
    user: action.user
  })),
  on(saveUserPreferenceFailure, state => ({ ...state, saving: false })),
  on(saveCurrentUser, state => ({ ...state, saving: true })),
  on(saveCurrentUserFailure, state => ({ ...state, saving: false }))
);

export const userFeature = createFeature({
  name: USER_FEATURE_KEY,
  reducer
});
