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

import { USER_FEATURE_KEY, UserState } from '../reducers/user.reducer';
import { selectUser, selectUserState } from './user.selectors';
import { USER_READER } from '@app/user/user.fixtures';

describe('User Selectors', () => {
  const USER = USER_READER;

  let state: UserState;

  beforeEach(() => {
    state = {
      initializing: Math.random() > 0.5,
      loading: Math.random() > 0.5,
      authenticating: Math.random() > 0.5,
      authenticated: Math.random() > 0.5,
      user: USER,
      saving: Math.random() > 0.5
    };
  });

  it('selects the feature state', () => {
    expect(
      selectUserState({
        [USER_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects the user', () => {
    expect(selectUser({ [USER_FEATURE_KEY]: state })).toEqual(USER);
  });
});
