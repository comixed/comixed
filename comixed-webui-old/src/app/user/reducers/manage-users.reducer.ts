/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
  saveUserAccount,
  saveUserAccountFailure,
  saveUserAccountSuccess,
  deleteUserAccount,
  deleteUserAccountFailure,
  deleteUserAccountSuccess,
  loadUserAccountList,
  loadUserAccountListFailure,
  loadUserAccountListSuccess,
  setCurrentUser
} from '../actions/manage-users.actions';
import { User } from '@app/user/models/user';

export const MANAGER_USERS_FEATURE_KEY = 'manage_users_state';

export interface ManagerUsersState {
  busy: boolean;
  saved: boolean;
  entries: User[];
  current: User;
}

export const initialState: ManagerUsersState = {
  busy: false,
  saved: false,
  entries: [],
  current: null
};

export const reducer = createReducer(
  initialState,
  on(loadUserAccountList, state => ({ ...state, busy: true })),
  on(loadUserAccountListSuccess, (state, action) => ({
    ...state,
    busy: false,
    entries: action.users
  })),
  on(loadUserAccountListFailure, state => ({ ...state, busy: false })),
  on(setCurrentUser, (state, action) => ({ ...state, current: action.user })),
  on(saveUserAccount, state => ({ ...state, busy: true, saved: false })),
  on(saveUserAccountSuccess, (state, action) => ({
    ...state,
    busy: false,
    entries: action.users,
    saved: true
  })),
  on(saveUserAccountFailure, state => ({ ...state, busy: false })),
  on(deleteUserAccount, state => ({ ...state, busy: true })),
  on(deleteUserAccountSuccess, (state, action) => ({
    ...state,
    busy: false,
    entries: action.users
  })),
  on(deleteUserAccountFailure, state => ({ ...state, busy: false }))
);

export const manageUsersFeature = createFeature({
  name: MANAGER_USERS_FEATURE_KEY,
  reducer
});
