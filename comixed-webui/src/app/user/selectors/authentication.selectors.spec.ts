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

import {
  AUTHENTICATION_FEATURE_KEY,
  AuthenticationState,
  initialAuthenticationState
} from '@app/user/reducers/authentication.reducer';
import { selectAuthenticationUserLoaded } from '@app/user/selectors/authentication.selectors';
import { beforeEach } from 'vitest';
import { USER_READER } from '@app/user/user-fixtures';

describe('AuthenticationService Selectors', () => {
  const TEST_USER = USER_READER;

  let state: AuthenticationState;

  beforeEach(() => {
    state = { ...initialAuthenticationState };
  });

  describe('checking if the user is already authenticated', () => {
    it('should return false when busy', () => {
      expect(
        selectAuthenticationUserLoaded({
          [AUTHENTICATION_FEATURE_KEY]: {
            ...state,
            busy: true
          }
        })
      ).toBeFalsy();
    });

    it('should return false when no user is loaded', () => {
      expect(
        selectAuthenticationUserLoaded({
          [AUTHENTICATION_FEATURE_KEY]: {
            ...state,
            busy: false,
            user: null
          }
        })
      ).toBeFalsy();
    });

    it('should return true when the user is loaded', () => {
      expect(
        selectAuthenticationUserLoaded({
          [AUTHENTICATION_FEATURE_KEY]: {
            ...state,
            busy: false,
            user: TEST_USER
          }
        })
      ).toBeTruthy();
    });
  });
});
