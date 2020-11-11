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
  currentUserLoaded,
  loadCurrentUser,
  loadCurrentUserFailed,
  loginUser,
  loginUserFailed,
  logoutUser,
  userLoggedIn,
  userLoggedOut
} from '@app/user/actions/user.actions';

describe('User Reducer', () => {
  const USER = USER_READER;
  const PASSWORD = 'this!is!my!password';
  const AUTH_TOKEN = 'my!token';

  let state: UserState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the default state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('sets the initializing flag', () => {
      expect(state.initializing).toBeTruthy();
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('clears the authenticating flag', () => {
      expect(state.authenticating).toBeFalsy();
    });

    it('clears the authenticated flag', () => {
      expect(state.authenticated).toBeFalsy();
    });

    it('has no user', () => {
      expect(state.user).toBeNull();
    });
  });

  describe('loading the current user', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, loadCurrentUser());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });
  });

  describe('receiving the current user', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          initializing: true,
          loading: true,
          authenticated: false,
          user: null
        },
        currentUserLoaded({ user: USER })
      );
    });

    it('clears the initializing flag', () => {
      expect(state.initializing).toBeFalsy();
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('sets the authenticated flag', () => {
      expect(state.authenticated).toBeTruthy();
    });

    it('sets the current user', () => {
      expect(state.user).toEqual(USER);
    });
  });

  describe('loading the current user fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, initializing: true, authenticated: true, loading: true },
        loadCurrentUserFailed()
      );
    });

    it('clears the initializing flag', () => {
      expect(state.initializing).toBeFalsy();
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('clears the authenticated flag', () => {
      expect(state.authenticated).toBeFalsy();
    });
  });

  describe('sending the login credentials', () => {
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
      expect(state.authenticating).toBeTruthy();
    });

    it('clears the authenticated flag', () => {
      expect(state.authenticated).toBeFalsy();
    });

    it('clears the current user', () => {
      expect(state.user).toBeNull();
    });
  });

  describe('user login success', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, authenticating: true, authenticated: false, user: null },
        userLoggedIn({ token: AUTH_TOKEN })
      );
    });

    it('clears the authenticating flag', () => {
      expect(state.authenticating).toBeFalsy();
    });

    it('sets the authenticated flag', () => {
      expect(state.authenticated).toBeTruthy();
    });
  });

  describe('user login failure', () => {
    beforeEach(() => {
      state = reducer({ ...state, authenticating: true }, loginUserFailed());
    });

    it('clears the authenticating flag', () => {
      expect(state.authenticating).toBeFalsy();
    });
  });

  describe('logging out the current user', () => {
    beforeEach(() => {
      state = reducer({ ...state, authenticating: false }, logoutUser());
    });

    it('sets the authenticating flag', () => {
      expect(state.authenticating).toBeTruthy();
    });
  });

  describe('user logout success', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, authenticating: true, authenticated: true, user: USER },
        userLoggedOut()
      );
    });

    it('clears the authenticating flag', () => {
      expect(state.authenticating).toBeFalsy();
    });

    it('clears the authenticated flag', () => {
      expect(state.authenticated).toBeFalsy();
    });

    it('clears the user', () => {
      expect(state.user).toBeNull();
    });
  });
});
