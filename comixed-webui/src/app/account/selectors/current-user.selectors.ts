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
import {
  CURRENT_USER_FEATURE_KEY,
  CurrentUserState
} from '../reducers/current-user.reducer';
import { hasRole } from '@app/account/account-functions';
import {
  ROLE_NAME_ADMIN,
  ROLE_NAME_READER
} from '@app/account/account-constants';
import { RoleCheck } from '@app/account/guards/role-check';

const selectCurrentUserState = createFeatureSelector<CurrentUserState>(
  CURRENT_USER_FEATURE_KEY
);
export default selectCurrentUserState;

export const selectCurrentUserLoading = createSelector(
  selectCurrentUserState,
  state => state.loading
);

export const selectCurrentUserAuthenticated = createSelector(
  selectCurrentUserState,
  state => state.checked && !!state.user
);

export const selectCurrentUserIsAdmin = createSelector(
  selectCurrentUserState,
  state => {
    return {
      checked: state.checked,
      passed: hasRole(state.user?.roles || [], ROLE_NAME_ADMIN)
    } as RoleCheck;
  }
);

export const selectCurrentUserIsReader = createSelector(
  selectCurrentUserState,
  state => {
    return {
      checked: state.checked,
      passed: hasRole(state.user?.roles || [], ROLE_NAME_READER)
    } as RoleCheck;
  }
);

export const selectCurrentUserReadComicIds = createSelector(
  selectCurrentUserState,
  state => state.user?.readComics || []
);
