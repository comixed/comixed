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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { hasRole } from '@app/account/account-functions';
import {
  ROLE_NAME_ADMIN,
  ROLE_NAME_READER
} from '@app/account/account-constants';
import { RoleCheck } from '@app/account/guards/role-check';
import {
  USER_FEATURE_KEY,
  UserState
} from '@app/account/reducers/user.reducer';

const selectUserState = createFeatureSelector<UserState>(USER_FEATURE_KEY);
export default selectUserState;

export const selectUserLoading = createSelector(
  selectUserState,
  state => state.busy
);

export const selectUserAuthenticated = createSelector(
  selectUserState,
  state => state.checked && !!state.user
);

export const selectUserIsAdmin = createSelector(selectUserState, state => {
  return {
    checked: state.checked,
    passed: hasRole(state.user?.roles || [], ROLE_NAME_ADMIN)
  } as RoleCheck;
});

export const selectUserIsReader = createSelector(selectUserState, state => {
  return {
    checked: state.checked,
    passed: hasRole(state.user?.roles || [], ROLE_NAME_READER)
  } as RoleCheck;
});

export const selectUserReadComicIds = createSelector(
  selectUserState,
  state => state.user?.readComics || []
);
