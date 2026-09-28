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
  EXISTING_ADMIN_ACCOUNT_FEATURE_KEY,
  ExistingAdminAccountState,
  initialExistingAdminAccountState
} from '@app/account/reducers/existing-admin-account.reducer';
import {
  selectExistingAdminAccountChecked,
  selectExistingAdminAccountCreate,
  selectExistingAdminAccountExists
} from '@app/account/selectors/existing-admin-account.selectors';
import { beforeEach } from 'vitest';

describe('ExistingAdminAccount Selectors', () => {
  let state: ExistingAdminAccountState;

  beforeEach(() => {
    state = { ...initialExistingAdminAccountState };
  });

  describe('selecting the checked flag', () => {
    it('should return false when not checked', () => {
      expect(
        selectExistingAdminAccountChecked({
          [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
            ...state,
            loading: false,
            checked: false
          }
        })
      ).toBeFalsy();
    });

    it('should return false when still checking', () => {
      expect(
        selectExistingAdminAccountChecked({
          [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
            ...state,
            loading: true,
            checked: false
          }
        })
      ).toBeFalsy();
    });

    it('should return true when checked', () => {
      expect(
        selectExistingAdminAccountChecked({
          [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
            ...state,
            loading: false,
            checked: true
          }
        })
      ).toBeTruthy();
    });
  });

  describe('selecting the exists flag', () => {
    it('should return false when not checked', () => {
      expect(
        selectExistingAdminAccountExists({
          [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
            ...state,
            loading: false,
            checked: false
          }
        })
      ).toBeFalsy();
    });

    it('should return false when still checking', () => {
      expect(
        selectExistingAdminAccountExists({
          [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
            ...state,
            loading: true,
            checked: false
          }
        })
      ).toBeFalsy();
    });

    it('should return true when checked and found', () => {
      expect(
        selectExistingAdminAccountExists({
          [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
            ...state,
            loading: false,
            checked: true,
            create: false
          }
        })
      ).toBeTruthy();
    });

    it('should return false when checked and not found', () => {
      expect(
        selectExistingAdminAccountExists({
          [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
            ...state,
            loading: false,
            checked: true,
            create: true
          }
        })
      ).toBeFalsy();
    });
  });

  describe('selecting the create flag', () => {
    it('should return false when not checked', () => {
      expect(
        selectExistingAdminAccountCreate({
          [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
            ...state,
            loading: false,
            checked: false
          }
        })
      ).toBeFalsy();
    });

    it('should return false when still checking', () => {
      expect(
        selectExistingAdminAccountCreate({
          [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
            ...state,
            loading: true,
            checked: false
          }
        })
      ).toBeFalsy();
    });

    it('should return false when checked and found', () => {
      expect(
        selectExistingAdminAccountCreate({
          [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
            ...state,
            loading: false,
            checked: true,
            create: false
          }
        })
      ).toBeFalsy();
    });

    it('should return true when checked and not found', () => {
      expect(
        selectExistingAdminAccountCreate({
          [EXISTING_ADMIN_ACCOUNT_FEATURE_KEY]: {
            ...state,
            loading: false,
            checked: true,
            create: true
          }
        })
      ).toBeTruthy();
    });
  });
});
