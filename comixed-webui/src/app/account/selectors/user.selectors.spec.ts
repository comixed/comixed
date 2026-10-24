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

import { beforeEach } from 'vitest';
import selectUserState, {
  selectUserAuthenticated,
  selectUserIsAdmin,
  selectUserIsReader,
  selectUserLoading,
  selectUserReadComicIds
} from '@app/account/selectors/user.selectors';
import { USER_READER } from '@app/account/account-fixtures';
import {
  ROLE_NAME_ADMIN,
  ROLE_NAME_READER
} from '@app/account/account-constants';
import { RoleCheck } from '@app/account/guards/role-check';
import {
  USER_FEATURE_KEY,
  UserState,
  initialUserState
} from '@app/account/reducers/user.reducer';

describe('User Selectors', () => {
  const TEST_USER = USER_READER;
  const TEST_READ_COMIC_IDS = [1000, 2000, 3000, 4000, 5000];

  let state: UserState;

  beforeEach(() => {
    state = { ...initialUserState };
  });

  it('should select the feature state', () => {
    expect(selectUserState({ [USER_FEATURE_KEY]: state })).toBe(state);
  });

  describe('selecting the busy state', () => {
    it('should return false when not busy', () => {
      expect(
        selectUserLoading({
          [USER_FEATURE_KEY]: { ...state, busy: false }
        })
      ).toBeFalsy();
    });

    it('should return true when busy', () => {
      expect(
        selectUserLoading({
          [USER_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeTruthy();
    });
  });

  describe('selecting the authenticated state', () => {
    it('should return false when not checked', () => {
      expect(
        selectUserAuthenticated({
          [USER_FEATURE_KEY]: { ...state, checked: false }
        })
      ).toBeFalsy();
    });

    it('should return true when checked and a user was loaded', () => {
      expect(
        selectUserAuthenticated({
          [USER_FEATURE_KEY]: {
            ...state,
            checked: true,
            user: TEST_USER
          }
        })
      ).toBeTruthy();
    });

    it('should return false when checked and no user was loaded', () => {
      expect(
        selectUserAuthenticated({
          [USER_FEATURE_KEY]: { ...state, checked: true, user: null }
        })
      ).toBeFalsy();
    });
  });

  describe('selecting the admin flag', () => {
    it('should return true when the user is an admin', () => {
      expect(
        selectUserIsAdmin({
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            checked: true,
            user: {
              ...TEST_USER,
              roles: [{ name: ROLE_NAME_ADMIN }]
            }
          }
        })
      ).toStrictEqual({ checked: true, passed: true } as RoleCheck);
    });

    it('should return false when the user is not an admin', () => {
      expect(
        selectUserIsAdmin({
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            checked: true,
            user: { ...TEST_USER, roles: [] }
          }
        })
      ).toStrictEqual({ checked: true, passed: false } as RoleCheck);
    });
  });

  describe('selecting the reader flag', () => {
    it('should return true when the user is an reader', () => {
      expect(
        selectUserIsReader({
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            checked: true,
            user: {
              ...TEST_USER,
              roles: [{ name: ROLE_NAME_READER }]
            }
          }
        })
      ).toStrictEqual({ checked: true, passed: true } as RoleCheck);
    });

    it('should return false when the user is not a reader', () => {
      expect(
        selectUserIsReader({
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            checked: true,
            user: { ...TEST_USER, roles: [] }
          }
        })
      ).toStrictEqual({ checked: true, passed: false } as RoleCheck);
    });
  });

  describe('selecting the read comic ids', () => {
    it('should return the list of ids for a user', () => {
      expect(
        selectUserReadComicIds({
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            user: { ...TEST_USER, readComics: TEST_READ_COMIC_IDS }
          }
        })
      ).toStrictEqual(TEST_READ_COMIC_IDS);
    });

    it('should return an empty array when there is no user', () => {
      expect(
        selectUserReadComicIds({
          [USER_FEATURE_KEY]: {
            ...initialUserState,
            user: null
          }
        })
      ).toStrictEqual([]);
    });
  });
});
