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
import { CurrentUserActions } from '../actions/current-user.actions';
import { User } from '@app/account/models/user';

export const CURRENT_USER_FEATURE_KEY = 'current_user_state';

export interface CurrentUserState {
  loading: boolean;
  checked: boolean;
  user: User | null;
}

export const initialCurrentUserState: CurrentUserState = {
  loading: false,
  checked: false,
  user: null
};

export const currentUserReducer = createReducer(
  initialCurrentUserState,
  on(CurrentUserActions.login, state => ({
    ...state,
    loading: true,
    checked: false,
    user: null
  })),
  on(CurrentUserActions.loginSuccess, state => ({
    ...state,
    loading: false,
    checked: true
  })),
  on(CurrentUserActions.loginFailure, state => ({
    ...state,
    loading: false,
    checked: true
  })),
  on(CurrentUserActions.load, state => ({
    ...state,
    loading: true,
    checked: false,
    user: null
  })),
  on(CurrentUserActions.loadSuccess, (state, action) => ({
    ...state,
    loading: false,
    checked: true,
    user: action.user
  })),
  on(CurrentUserActions.loadFailure, state => ({
    ...state,
    loading: false,
    checked: false
  }))
);

export const currentUserFeature = createFeature({
  name: CURRENT_USER_FEATURE_KEY,
  reducer: currentUserReducer
});
