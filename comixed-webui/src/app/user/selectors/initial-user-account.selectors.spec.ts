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
  INITIAL_USER_ACCOUNT_FEATURE_KEY,
  InitialUserAccountState
} from '../reducers/initial-user-account.reducer';
import {
  selectCheckedForExistingAccount,
  selectCreateInitialUserAccount,
  selectHasExistingAccounts
} from './initial-user-account.selectors';

describe('InitialUserAccount Selectors', () => {
  let state: InitialUserAccountState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      checked: Math.random() > 0.5,
      hasExisting: Math.random() > 0.5
    };
  });

  describe('having checked for existing accounts', () => {
    it('returns false when no check has been performed', () => {
      expect(
        selectCheckedForExistingAccount({
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
            ...state,
            busy: false,
            checked: false
          }
        })
      ).toBeFalse();
    });

    it('returns false while checking', () => {
      expect(
        selectCheckedForExistingAccount({
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
            ...state,
            busy: true,
            checked: false
          }
        })
      ).toBeFalse();
    });

    it('returns true after checking', () => {
      expect(
        selectCheckedForExistingAccount({
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
            ...state,
            busy: false,
            checked: true
          }
        })
      ).toBeTrue();
    });
  });

  describe('checking for existing accounts', () => {
    it('returns false when not checked', () => {
      expect(
        selectHasExistingAccounts({
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
            ...state,
            checked: false,
            busy: false,
            hasExisting: true
          }
        })
      ).toBeFalse();
    });

    it('returns false when busy', () => {
      expect(
        selectHasExistingAccounts({
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
            ...state,
            busy: true,
            checked: false,
            hasExisting: true
          }
        })
      ).toBeFalse();
    });

    it('returns true when checked and has existing accounts', () => {
      expect(
        selectHasExistingAccounts({
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
            ...state,
            busy: false,
            checked: true,
            hasExisting: true
          }
        })
      ).toBeTrue();
    });

    it('returns false when checked and no existing accounts found', () => {
      expect(
        selectHasExistingAccounts({
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
            ...state,
            busy: false,
            checked: true,
            hasExisting: false
          }
        })
      ).toBeFalse();
    });
  });

  describe('creating the initial admina ccount', () => {
    it('returns false when busy', () => {
      expect(
        selectCreateInitialUserAccount({
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: { ...state, busy: true }
        })
      ).toBeFalse();
    });

    it('returns false when not checked', () => {
      expect(
        selectCreateInitialUserAccount({
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: { ...state, checked: false }
        })
      ).toBeFalse();
    });

    it('returns false when an account exists', () => {
      expect(
        selectCreateInitialUserAccount({
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: { ...state, hasExisting: true }
        })
      ).toBeFalse();
    });

    it('returns true when no account exists', () => {
      expect(
        selectCreateInitialUserAccount({
          [INITIAL_USER_ACCOUNT_FEATURE_KEY]: {
            ...state,
            busy: false,
            checked: true,
            hasExisting: false
          }
        })
      ).toBeTrue();
    });
  });
});
