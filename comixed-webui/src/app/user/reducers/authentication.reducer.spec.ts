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
import { USER_READER } from '@app/user/user-fixtures';
import {
  loadCurrentUser,
  loadCurrentUserFailure,
  loadCurrentUserSuccess,
  login,
  loginFailure,
  loginSuccess
} from '@app/user/actions/authentication.actions';
import {
  authenticationReducer,
  AuthenticationState,
  initialAuthenticationState
} from '@app/user/reducers/authentication.reducer';
import { Action } from '@ngrx/store';

describe('AuthenticationService Reducer', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = TEST_USER.email;
  const TEST_PASSWORD = 't35t!p455w0rD';

  let state: AuthenticationState;

  beforeEach(() => {
    state = { ...initialAuthenticationState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = authenticationReducer({ ...state }, {} as Action<string>);
    });

    it('should have a clear busy flag', () => {
      expect(state.busy).toBeFalsy();
    });

    it('should have a clear authenticated flag', () => {
      expect(state.authenticated).toBeFalsy();
    });

    it('should have no user', () => {
      expect(state.user).toBeNull();
    });
  });

  describe('loading the current user', () => {
    beforeEach(() => {
      state = authenticationReducer(
        { ...state, busy: false },
        loadCurrentUser()
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBe(true);
    });

    describe('success', () => {
      beforeEach(() => {
        state = authenticationReducer(
          { ...state, busy: true, authenticated: false, user: null },
          loadCurrentUserSuccess({ user: TEST_USER })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBe(false);
      });

      it('sets the authenticated flag', () => {
        expect(state.authenticated).toBe(true);
      });

      it('sets the user', () => {
        expect(state.user).toBe(TEST_USER);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = authenticationReducer(
          { ...state, busy: true, authenticated: true, user: TEST_USER },
          loadCurrentUserFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBe(false);
      });

      it('clears the authenticated flag', () => {
        expect(state.authenticated).toBe(false);
      });

      it('clears the user', () => {
        expect(state.user).toBeNull();
      });
    });
  });

  describe('authenticating a user', () => {
    beforeEach(() => {
      state = authenticationReducer(
        { ...state, busy: false, authenticated: true, user: TEST_USER },
        login({ email: TEST_EMAIL, password: TEST_PASSWORD })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    it('clears the authenticated flag', () => {
      expect(state.authenticated).toBeFalsy();
    });

    it('clears the user', () => {
      expect(state.user).toBeNull();
    });

    describe('success', () => {
      beforeEach(() => {
        state = authenticationReducer(
          {
            ...state,
            busy: true,
            authenticated: false,
            user: null
          },
          loginSuccess()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('sets the authenticated flag', () => {
        expect(state.authenticated).toBeTruthy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = authenticationReducer(
          {
            ...state,
            busy: true
          },
          loginFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
