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
  CURRENT_USER_FEATURE_KEY,
  CurrentUserState,
  initialCurrentUserState
} from '../reducers/current-user.reducer';
import { beforeEach } from 'vitest';
import selectCurrentUserState, {
  selectCurrentUserAuthenticated,
  selectCurrentUserIsAdmin,
  selectCurrentUserIsReader,
  selectCurrentUserLoading,
  selectCurrentUserReadComicIds
} from '@app/account/selectors/current-user.selectors';
import { USER_READER } from '@app/account/account-fixtures';
import {
  ROLE_NAME_ADMIN,
  ROLE_NAME_READER
} from '@app/account/account-constants';
import { RoleCheck } from '@app/account/guards/role-check';

describe('CurrentUser Selectors', () => {
  const TEST_USER = USER_READER;
  const TEST_READ_COMIC_IDS = [1000, 2000, 3000, 4000, 5000];

  let state: CurrentUserState;

  beforeEach(() => {
    state = { ...initialCurrentUserState };
  });

  it('should select the feature state', () => {
    expect(selectCurrentUserState({ [CURRENT_USER_FEATURE_KEY]: state })).toBe(
      state
    );
  });

  describe('selecting the loading state', () => {
    it('should return false when not loading', () => {
      expect(
        selectCurrentUserLoading({
          [CURRENT_USER_FEATURE_KEY]: { ...state, loading: false }
        })
      ).toBeFalsy();
    });

    it('should return true when loading', () => {
      expect(
        selectCurrentUserLoading({
          [CURRENT_USER_FEATURE_KEY]: { ...state, loading: true }
        })
      ).toBeTruthy();
    });
  });

  describe('selecting the authenticated state', () => {
    it('should return false when not checked', () => {
      expect(
        selectCurrentUserAuthenticated({
          [CURRENT_USER_FEATURE_KEY]: { ...state, checked: false }
        })
      ).toBeFalsy();
    });

    it('should return true when checked and a user was loaded', () => {
      expect(
        selectCurrentUserAuthenticated({
          [CURRENT_USER_FEATURE_KEY]: {
            ...state,
            checked: true,
            user: TEST_USER
          }
        })
      ).toBeTruthy();
    });

    it('should return false when checked and no user was loaded', () => {
      expect(
        selectCurrentUserAuthenticated({
          [CURRENT_USER_FEATURE_KEY]: { ...state, checked: true, user: null }
        })
      ).toBeFalsy();
    });
  });

  describe('selecting the admin flag', () => {
    it('should return true when the user is an admin', () => {
      expect(
        selectCurrentUserIsAdmin({
          [CURRENT_USER_FEATURE_KEY]: {
            ...initialCurrentUserState,
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
        selectCurrentUserIsAdmin({
          [CURRENT_USER_FEATURE_KEY]: {
            ...initialCurrentUserState,
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
        selectCurrentUserIsReader({
          [CURRENT_USER_FEATURE_KEY]: {
            ...initialCurrentUserState,
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
        selectCurrentUserIsReader({
          [CURRENT_USER_FEATURE_KEY]: {
            ...initialCurrentUserState,
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
        selectCurrentUserReadComicIds({
          [CURRENT_USER_FEATURE_KEY]: {
            ...initialCurrentUserState,
            user: { ...TEST_USER, readComics: TEST_READ_COMIC_IDS }
          }
        })
      ).toStrictEqual(TEST_READ_COMIC_IDS);
    });

    it('should return an empty array when there is no user', () => {
      expect(
        selectCurrentUserReadComicIds({
          [CURRENT_USER_FEATURE_KEY]: {
            ...initialCurrentUserState,
            user: null
          }
        })
      ).toStrictEqual([]);
    });
  });
});
