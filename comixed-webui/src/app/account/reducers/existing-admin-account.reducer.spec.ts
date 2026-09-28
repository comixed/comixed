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
  ExistingAdminAccountState,
  initialExistingAdminAccountState,
  reducer
} from './existing-admin-account.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { ExistingAdminAccountActions } from '@app/account/actions/existing-admin-account.actions';

describe('ExistingAdminAccount Reducer', () => {
  const TEST_EMAIL = 'user@localhost.tld';
  const TEST_PASSWORD = 'th3!p455w0rD';

  let state: ExistingAdminAccountState;

  beforeEach(() => {
    state = { ...initialExistingAdminAccountState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as Action<string>);
    });

    it('should not set the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('should not set the checked flag', () => {
      expect(state.checked).toBeFalsy();
    });

    it('should not set the create flag', () => {
      expect(state.create).toBeFalsy();
    });
  });

  describe('checking for an existing admin account', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false, checked: true, create: true },
        ExistingAdminAccountActions.check()
      );
    });

    it('should set the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });

    it('should clear the checked flag', () => {
      expect(state.checked).toBeFalsy();
    });

    it('should clear the create flag', () => {
      expect(state.create).toBeFalsy();
    });

    describe('success - admins found', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, loading: true, checked: false, create: false },
          ExistingAdminAccountActions.checkSuccess({ exists: true })
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });

      it('should set the checked flag', () => {
        expect(state.checked).toBeTruthy();
      });

      it('should lee[ the create flag clear', () => {
        expect(state.create).toBeFalsy();
      });
    });

    describe('success - admins not found', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, loading: true, checked: false, create: false },
          ExistingAdminAccountActions.checkSuccess({ exists: false })
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });

      it('should set the checked flag', () => {
        expect(state.checked).toBeTruthy();
      });

      it('should set the exists flag', () => {
        expect(state.create).toBeTruthy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, loading: true, checked: false, create: false },
          ExistingAdminAccountActions.checkFailure()
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });

      it('should keep the checked flag clear', () => {
        expect(state.checked).toBeFalsy();
      });

      it('should keep the create flag clear', () => {
        expect(state.create).toBeFalsy();
      });
    });
  });

  describe('creating the initial admin account', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false, checked: true, create: true },
        ExistingAdminAccountActions.create({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });

    it('clears the checked flag', () => {
      expect(state.checked).toBeFalsy();
    });

    it('clears the create flag', () => {
      expect(state.create).toBeFalsy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, loading: true, checked: false, create: false },
          ExistingAdminAccountActions.createSuccess()
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });

      it('should set the checked flag', () => {
        expect(state.checked).toBeTruthy();
      });

      it('should keep the create flag clear', () => {
        expect(state.create).toBeFalsy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, loading: true, checked: false, create: false },
          ExistingAdminAccountActions.createFailure()
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });

      it('should set the checked flag', () => {
        expect(state.checked).toBeTruthy();
      });

      it('should set the create flag', () => {
        expect(state.create).toBeTruthy();
      });
    });
  });
});
