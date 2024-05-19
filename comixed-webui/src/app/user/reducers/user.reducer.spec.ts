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

import { initialState, reducer, UserState } from './user.reducer';
import { USER_READER } from '@app/user/user.fixtures';
import {
  loadCurrentUser,
  loadCurrentUserFailure,
  loadCurrentUserSuccess,
  loginUser,
  loginUserFailure,
  loginUserSuccess,
  logoutUser,
  logoutUserFailure,
  logoutUserSuccess,
  saveCurrentUser,
  saveCurrentUserFailure,
  saveUserPreference,
  saveUserPreferenceFailure,
  saveUserPreferenceSuccess
} from '@app/user/actions/user.actions';

describe('User Reducer', () => {
  const USER = USER_READER;
  const PASSWORD = 'this!is!my!password';
  const PREFERENCE_NAME = 'user.preference';
  const PREFERENCE_VALUE = 'preference.value';

  let state: UserState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the default state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('sets the initializing flag', () => {
      expect(state.initializing).toBeTrue();
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('clears the authenticating flag', () => {
      expect(state.authenticating).toBeFalse();
    });

    it('clears the authenticated flag', () => {
      expect(state.authenticated).toBeFalse();
    });

    it('has no user', () => {
      expect(state.user).toBeNull();
    });

    it('clears the saving flag', () => {
      expect(state.saving).toBeFalse();
    });
  });

  describe('loading the current user', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, initializing: false, loading: false },
        loadCurrentUser()
      );
    });

    it('sets the initializing flag', () => {
      expect(state.initializing).toBeTrue();
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            initializing: true,
            loading: true,
            authenticated: false,
            user: null,
            saving: true
          },
          loadCurrentUserSuccess({ user: USER })
        );
      });

      it('clears the initializing flag', () => {
        expect(state.initializing).toBeFalse();
      });

      it('clears the loading flag', () => {
        expect(state.loading).toBeFalse();
      });

      it('sets the authenticated flag', () => {
        expect(state.authenticated).toBeTrue();
      });

      it('clears the saving flag', () => {
        expect(state.saving).toBeFalse();
      });

      it('sets the current user', () => {
        expect(state.user).toEqual(USER);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            initializing: true,
            loading: true,
            user: USER,
            authenticated: true
          },
          loadCurrentUserFailure()
        );
      });

      it('clears the initializing flag', () => {
        expect(state.initializing).toBeFalse();
      });

      it('clears the loading flag', () => {
        expect(state.loading).toBeFalse();
      });

      it('clears the authenticated flag', () => {
        expect(state.authenticated).toBeFalse();
      });

      it('clears the user', () => {
        expect(state.user).toBeNull();
      });
    });
  });

  describe('login user', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, authenticating: false, authenticated: true, user: USER },
        loginUser({
          email: USER.email,
          password: PASSWORD
        })
      );
    });

    it('sets the authenticating flag', () => {
      expect(state.authenticating).toBeTrue();
    });

    it('clears the authenticated flag', () => {
      expect(state.authenticated).toBeFalse();
    });

    it('clears the current user', () => {
      expect(state.user).toBeNull();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, authenticating: true, authenticated: false, user: null },
          loginUserSuccess()
        );
      });

      it('clears the authenticating flag', () => {
        expect(state.authenticating).toBeFalse();
      });

      it('sets the authenticated flag', () => {
        expect(state.authenticated).toBeTrue();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, authenticating: true }, loginUserFailure());
      });

      it('clears the authenticating flag', () => {
        expect(state.authenticating).toBeFalse();
      });
    });
  });

  describe('logout user', () => {
    beforeEach(() => {
      state = reducer({ ...state, authenticating: false }, logoutUser());
    });

    it('sets the authenticating flag', () => {
      expect(state.authenticating).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, authenticating: true, authenticated: true, user: USER },
          logoutUserSuccess()
        );
      });

      it('clears the authenticating flag', () => {
        expect(state.authenticating).toBeFalse();
      });

      it('clears the authenticated flag', () => {
        expect(state.authenticated).toBeFalse();
      });

      it('clears the user', () => {
        expect(state.user).toBeNull();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, authenticating: true, authenticated: true, user: USER },
          logoutUserFailure()
        );
      });

      it('clears the authenticating flag', () => {
        expect(state.authenticating).toBeFalse();
      });

      it('leaves the authenticated flag intact', () => {
        expect(state.authenticated).toBeTrue();
      });

      it('leaves the user intact', () => {
        expect(state.user).toBe(USER);
      });
    });
  });

  describe('saving a user preference', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false },
        saveUserPreference({ name: PREFERENCE_NAME, value: PREFERENCE_VALUE })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, user: null, saving: true },
          saveUserPreferenceSuccess({ user: USER })
        );
      });

      it('clears the saving flag', () => {
        expect(state.saving).toBeFalse();
      });

      it('updates the user', () => {
        expect(state.user).toEqual(USER);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, saving: true },
          saveUserPreferenceFailure()
        );
      });

      it('clears the saving flag', () => {
        expect(state.saving).toBeFalse();
      });
    });
  });

  describe('saving the current user', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, saving: false },
        saveCurrentUser({ user: USER, password: PASSWORD })
      );
    });

    it('sets the saving flag', () => {
      expect(state.saving).toBeTrue();
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer({ ...state, saving: true }, saveCurrentUserFailure());
      });

      it('clears the saving flag', () => {
        expect(state.saving).toBeFalse();
      });
    });
  });
});
