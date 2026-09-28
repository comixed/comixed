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
import { Action } from '@ngrx/store';
import { UserActions } from '@app/account/actions/user.actions';
import { USER_READER } from '@app/account/account-fixtures';
import {
  initialUserState,
  userReducer,
  UserState
} from '@app/account/reducers/user.reducer';

describe('User Reducer', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = 'user@localhost.tld';
  const TEST_PASSWORD = 'th3!p455w0rD';
  const TEST_PREFERENCE_NAME = 'preference.name';
  const TEST_PREFERENCE_VALUE = 'preference.value';

  let state: UserState;

  beforeEach(() => {
    state = { ...initialUserState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = userReducer({ ...state }, {} as Action<string>);
    });

    it('should not set the busy flag', () => {
      expect(state.busy).toBeFalsy();
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
      state = userReducer(
        { ...state, busy: false, checked: true },
        UserActions.load()
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    it('should clear the checked flag', () => {
      expect(state.checked).toBeFalsy();
    });

    describe('success - user loaded', () => {
      beforeEach(() => {
        state = userReducer(
          { ...state, busy: true, checked: false, user: null },
          UserActions.loadSuccess({ user: TEST_USER })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
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
        state = userReducer(
          { ...state, busy: true, checked: false, user: null },
          UserActions.loadSuccess({ user: null })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
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
        state = userReducer(
          { ...state, busy: true, checked: false, user: null },
          UserActions.loadFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should clear the checked flag', () => {
        expect(state.checked).toBeFalsy();
      });

      it('should clear the user', () => {
        expect(state.user).toBeNull();
      });
    });
  });

  describe('receiving a user update', () => {
    const TEST_UPDATED_USER = {
      ...TEST_USER,
      email: TEST_USER.email.substring(1)
    };

    beforeEach(() => {
      state = userReducer(
        { ...state },
        UserActions.userUpdate({ user: TEST_UPDATED_USER })
      );
    });

    it('should update the user', () => {
      expect(state.user).toStrictEqual(TEST_UPDATED_USER);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      state = userReducer(
        { ...state, busy: false, checked: true, user: TEST_USER },
        UserActions.login({ email: TEST_EMAIL, password: TEST_PASSWORD })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    it('should clear the checked flag', () => {
      expect(state.checked).toBeFalsy();
    });

    it('should clear the current user', () => {
      expect(state.user).toBeNull();
    });

    describe('success', () => {
      beforeEach(() => {
        state = userReducer(
          { ...state, busy: true, checked: false },
          UserActions.loginSuccess()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should set the checked flag', () => {
        expect(state.checked).toBeTruthy();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = userReducer(
          { ...state, busy: true, checked: false },
          UserActions.loginFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should set the checked flag', () => {
        expect(state.checked).toBeTruthy();
      });
    });
  });

  describe('saving user preferences', () => {
    beforeEach(() => {
      state = userReducer(
        { ...state, busy: false },
        UserActions.savePreference({
          name: TEST_PREFERENCE_NAME,
          value: TEST_PREFERENCE_VALUE
        })
      );
    });

    it('should set the busy flag', () => {
      expect(state.busy).toBeTruthy();
    });

    describe('success', () => {
      beforeEach(() => {
        state = userReducer(
          { ...state, busy: true },
          UserActions.savePreferenceSuccess({ user: TEST_USER })
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });

      it('should update the user', () => {
        expect(state.user).toStrictEqual(TEST_USER);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = userReducer(
          { ...state, busy: true },
          UserActions.savePreferenceFailure()
        );
      });

      it('should clear the busy flag', () => {
        expect(state.busy).toBeFalsy();
      });
    });
  });
});
