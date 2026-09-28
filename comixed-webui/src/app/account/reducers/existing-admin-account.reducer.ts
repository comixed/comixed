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
import { ExistingAdminAccountActions } from '../actions/existing-admin-account.actions';

export const EXISTING_ADMIN_ACCOUNT_FEATURE_KEY =
  'existing_admin_account_state';

export interface ExistingAdminAccountState {
  loading: boolean;
  checked: boolean;
  create: boolean;
}

export const initialExistingAdminAccountState: ExistingAdminAccountState = {
  loading: false,
  checked: false,
  create: false
};

export const reducer = createReducer(
  initialExistingAdminAccountState,
  on(ExistingAdminAccountActions.check, state => ({
    ...state,
    loading: true,
    checked: false,
    create: false
  })),
  on(ExistingAdminAccountActions.checkSuccess, (state, action) => ({
    ...state,
    loading: false,
    checked: true,
    create: !action.exists
  })),
  on(ExistingAdminAccountActions.checkFailure, state => ({
    ...state,
    loading: false,
    checked: false,
    create: false
  })),
  on(ExistingAdminAccountActions.create, state => ({
    ...state,
    loading: true,
    checked: false,
    create: false
  })),
  on(ExistingAdminAccountActions.createSuccess, state => ({
    ...state,
    loading: false,
    checked: true,
    create: false
  })),
  on(ExistingAdminAccountActions.createFailure, state => ({
    ...state,
    loading: false,
    checked: true,
    create: true
  }))
);

export const existingAdminAccountFeature = createFeature({
  name: EXISTING_ADMIN_ACCOUNT_FEATURE_KEY,
  reducer
});
