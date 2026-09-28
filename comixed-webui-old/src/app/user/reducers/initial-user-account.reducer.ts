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
  createAdminAccount,
  createAdminAccountFailure,
  createAdminAccountSuccess,
  loadInitialUserAccount,
  loadInitialUserAccountFailure,
  loadInitialUserAccountSuccess
} from '../actions/initial-user-account.actions';

export const INITIAL_USER_ACCOUNT_FEATURE_KEY = 'initial_user_account_state';

export interface InitialUserAccountState {
  busy: boolean;
  checked: boolean;
  hasExisting: boolean;
}

export const initialState: InitialUserAccountState = {
  busy: false,
  checked: false,
  hasExisting: false
};

export const reducer = createReducer(
  initialState,
  on(loadInitialUserAccount, state => ({
    ...state,
    busy: true,
    checked: false,
    hasExisting: false
  })),
  on(loadInitialUserAccountSuccess, (state, action) => ({
    ...state,
    busy: false,
    checked: true,
    hasExisting: action.hasExisting
  })),
  on(loadInitialUserAccountFailure, state => ({ ...state, busy: false })),
  on(createAdminAccount, state => ({ ...state, busy: true })),
  on(createAdminAccountSuccess, state => ({ ...state, busy: false })),
  on(createAdminAccountFailure, state => ({ ...state, busy: false }))
);

export const initialUserAccountFeature = createFeature({
  name: INITIAL_USER_ACCOUNT_FEATURE_KEY,
  reducer
});
