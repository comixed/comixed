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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { USER_FEATURE_KEY, UserState } from '../reducers/user.reducer';
import {
  getPageSize,
  getUserPreference,
  isAdmin
} from '@app/user/user.functions';
import {
  MATCH_PUBLISHER_PREFERENCE,
  MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
  SKIP_CACHE_PREFERENCE
} from '@app/library/library.constants';

const selectUserState = createFeatureSelector<UserState>(USER_FEATURE_KEY);

export const selectUserInitializingProgress = createSelector(
  selectUserState,
  state => {
    return {
      initializing: state.initializing,
      authenticated: state.authenticated,
      user: state.user
    };
  }
);

export const selectUserAuthenticated = createSelector(
  selectUserState,
  state => state.authenticated
);

export const selectUserSaving = createSelector(
  selectUserState,
  state => state.saving
);

export const selectUserAuthenticating = createSelector(
  selectUserState,
  state => state.initializing || state.authenticated
);

export const selectUser = createSelector(selectUserState, state => state.user);

export const selectUserIsAdmin = createSelector(selectUserState, state => {
  return isAdmin(state?.user);
});

export const selectUserPageSize = createSelector(selectUserState, state => {
  return getPageSize(state?.user);
});

export const selectUserSkipCache = createSelector(selectUserState, state => {
  return (
    getUserPreference(
      state?.user?.preferences,
      SKIP_CACHE_PREFERENCE,
      `${false}`
    ) === `${true}`
  );
});

export const selectUserMatchPublisher = createSelector(
  selectUserState,
  state => {
    return (
      getUserPreference(
        state?.user?.preferences,
        MATCH_PUBLISHER_PREFERENCE,
        `${false}`
      ) === `${true}`
    );
  }
);

export const selectUserMaximumRecords = createSelector(
  selectUserState,
  state => {
    return parseInt(
      getUserPreference(
        state?.user?.preferences,
        MAXIMUM_SCRAPING_RECORDS_PREFERENCE,
        '0'
      ),
      10
    );
  }
);
