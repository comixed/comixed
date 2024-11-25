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

import {
  MANAGER_USERS_FEATURE_KEY,
  ManagerUsersState
} from '../reducers/manage-users.reducer';
import {
  selectManageUsersCurrent,
  selectManageUsersList,
  selectManageUsersState
} from './manage-users.selectors';
import { USER_ADMIN, USER_BLOCKED, USER_READER } from '@app/user/user.fixtures';

describe('ManageUsers Selectors', () => {
  const USERS = [USER_ADMIN, USER_BLOCKED, USER_READER];
  const USER = USER_READER;

  let state: ManagerUsersState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      saved: Math.random() > 0.5,
      entries: USERS,
      current: USER
    };
  });

  it('should select the feature state', () => {
    expect(
      selectManageUsersState({
        [MANAGER_USERS_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the list of users', () => {
    expect(
      selectManageUsersList({
        [MANAGER_USERS_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });

  it('should select the current user', () => {
    expect(
      selectManageUsersCurrent({
        [MANAGER_USERS_FEATURE_KEY]: state
      })
    ).toEqual(state.current);
  });
});
