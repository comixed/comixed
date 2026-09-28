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
  currentUserReducer,
  CurrentUserState,
  initialCurrentUserState
} from './current-user.reducer';
import { beforeEach } from 'vitest';
import { Action } from '@ngrx/store';
import { CurrentUserActions } from '@app/account/actions/current-user.actions';
import { USER_READER } from '@app/account/account-fixtures';

describe('CurrentUser Reducer', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = 'user@localhost.tld';
  const TEST_PASSWORD = 'th3!p455w0rD';

  let state: CurrentUserState;

  beforeEach(() => {
    state = { ...initialCurrentUserState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = currentUserReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('should not set the checked flag', () => {
      expect(state.checked).toBeFalsy();
    });

    it('should not have a user', () => {
      expect(state.user).toBeNull();
    });
  });

  describe('loading the current user', () => {
    beforeEach(() => {
      state = currentUserReducer(
        { ...state, loading: false, checked: true },
        CurrentUserActions.load()
      );
    });

    it('should set the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });

    it('should clear the checked flag', () => {
      expect(state.checked).toBeFalsy();
    });

    describe('success - user loaded', () => {
      beforeEach(() => {
        state = currentUserReducer(
          { ...state, loading: true, checked: false, user: null },
          CurrentUserActions.loadSuccess({ user: TEST_USER })
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });

      it('should set the checked flag', () => {
        expect(state.checked).toBeTruthy();
      });

      it('should set the user', () => {
        expect(state.user).toBe(TEST_USER);
      });
    });

    describe('success - no user loaded', () => {
      beforeEach(() => {
        state = currentUserReducer(
          { ...state, loading: true, checked: false, user: null },
          CurrentUserActions.loadSuccess({ user: null })
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });

      it('should set the checked flag', () => {
        expect(state.checked).toBeTruthy();
      });

      it('should clear the user', () => {
        expect(state.user).toBeNull();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = currentUserReducer(
          { ...state, loading: true, checked: false, user: null },
          CurrentUserActions.loadFailure()
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });

      it('should clear the checked flag', () => {
        expect(state.checked).toBeFalsy();
      });

      it('should clear the user', () => {
        expect(state.user).toBeNull();
      });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      state = currentUserReducer(
        { ...state, loading: false, checked: true, user: TEST_USER },
        CurrentUserActions.login({ email: TEST_EMAIL, password: TEST_PASSWORD })
      );
    });

    it('should set the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });

    it('should clear the checked flag', () => {
      expect(state.checked).toBeFalsy();
    });

    it('should clear the current user', () => {
      expect(state.user).toBeNull();
    });

    describe('success', () => {
      beforeEach(() => {
        state = currentUserReducer(
          { ...state, loading: true, checked: false },
          CurrentUserActions.loginSuccess()
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });

      it('should set the checked flag', () => {
        expect(state.checked).toBeTruthy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = currentUserReducer(
          { ...state, loading: true, checked: false },
          CurrentUserActions.loginFailure()
        );
      });

      it('should clear the loading flag', () => {
        expect(state.loading).toBeFalsy();
      });

      it('should set the checked flag', () => {
        expect(state.checked).toBeTruthy();
      });
    });
  });
});
