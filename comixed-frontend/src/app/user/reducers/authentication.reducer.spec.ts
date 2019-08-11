/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { initial_state, reducer } from './authentication.reducer';
import { AuthenticationState, USER_ADMIN, USER_READER } from 'app/user';
import * as AuthenticationActions from 'app/user/actions/authentication.actions';

describe('Authentication Reducer', () => {
  const USER = USER_ADMIN;
  const AUTH_TOKEN = '1234567890ABCDEF';
  const PREFERENCE_NAME = 'pref.name';
  const PREFERENCE_VALUE = 'pref-value';

  let state: AuthenticationState;

  beforeEach(() => {
    state = { ...initial_state };
  });

  describe('an unknown action', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the initialized state', () => {
      expect(state.initialized).toBeFalsy();
    });

    it('clears the authenticating flag', () => {
      expect(state.authenticating).toBeFalsy();
    });

    it('clears the authenticated flag', () => {
      expect(state.authenticated).toBeFalsy();
    });

    it('clears the setting preference flag', () => {
      expect(state.setting_preference).toBeFalsy();
    });

    it('has no user loaded', () => {
      expect(state.user).toBeNull();
    });

    it('has no auth token', () => {
      expect(state.auth_token).toBeNull();
    });

    it('clears the show login flag', () => {
      expect(state.show_login).toBeFalsy();
    });
  });

  describe('when checking the authentication state', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, authenticating: false },
        new AuthenticationActions.AuthCheckState()
      );
    });

    it('sets the authenticating flag', () => {
      expect(state.authenticating).toBeTruthy();
    });
  });

  describe('when the authenticated user is loaded', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, authenticating: true, show_login: true, user: null },
        new AuthenticationActions.AuthUserLoaded({ user: USER })
      );
    });

    it('sets the initialized flag', () => {
      expect(state.initialized).toBeTruthy();
    });

    it('clears the authenticating flag', () => {
      expect(state.authenticating).toBeFalsy();
    });

    it('hides the login form', () => {
      expect(state.show_login).toBeFalsy();
    });

    it('sets the user', () => {
      expect(state.user).toEqual(USER);
    });

    it('sets the authenticated flag', () => {
      expect(state.authenticated).toBeTruthy();
    });
  });

  describe('when no authenticated user is loaded', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, authenticating: true, authenticated: true, user: USER },
        new AuthenticationActions.AuthNoUserLoaded()
      );
    });

    it('sets the initialized flag', () => {
      expect(state.initialized).toBeTruthy();
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

  describe('when an auth token is received', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, auth_token: null, authenticated: false },
        new AuthenticationActions.AuthSetToken({ token: AUTH_TOKEN })
      );
    });

    it('sets the authentication token', () => {
      expect(state.auth_token).toEqual(AUTH_TOKEN);
    });

    it('sets the authenticated flag', () => {
      expect(state.authenticated).toBeTruthy();
    });
  });

  describe('when clearing the auth token', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, authenticated: true, auth_token: AUTH_TOKEN },
        new AuthenticationActions.AuthClearToken()
      );
    });

    it('clears the authentication token', () => {
      expect(state.auth_token).toBeNull();
    });

    it('clears the authenticated flag', () => {
      expect(state.authenticated).toBeFalsy();
    });
  });

  describe('when showing the login panel', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, show_login: false },
        new AuthenticationActions.AuthShowLogin()
      );
    });

    it('sets the show login flag', () => {
      expect(state.show_login).toBeTruthy();
    });
  });

  describe('when hiding the login panel', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, show_login: true },
        new AuthenticationActions.AuthHideLogin()
      );
    });

    it('clears the show login flag', () => {
      expect(state.show_login).toBeFalsy();
    });
  });

  describe('when logging the user out', () => {
    beforeEach(() => {
      state = reducer(
        {
          ...state,
          authenticated: true,
          auth_token: AUTH_TOKEN,
          user: USER_ADMIN
        },
        new AuthenticationActions.AuthLogout()
      );
    });

    it('clears the authenticated flag', () => {
      expect(state.authenticated).toBeFalsy();
    });

    it('clears the authentication token', () => {
      expect(state.auth_token).toBeNull();
    });

    it('clears the user', () => {
      expect(state.user).toBeNull();
    });
  });

  describe('when setting a user preference', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, setting_preference: false },
        new AuthenticationActions.AuthSetPreference({
          name: PREFERENCE_NAME,
          value: PREFERENCE_VALUE
        })
      );
    });

    it('sets the setting preference flag', () => {
      expect(state.setting_preference).toBeTruthy();
    });
  });

  describe('when a user preference is set', () => {
    const OLD_USER = { ...USER_READER, preferences: [] };
    const NEW_USER = {
      ...USER_READER,
      preferences: [{ name: PREFERENCE_NAME, value: PREFERENCE_VALUE }]
    };

    beforeEach(() => {
      state = reducer(
        { ...state, setting_preference: true, user: OLD_USER },
        new AuthenticationActions.AuthPreferenceSet({ user: NEW_USER })
      );
    });

    it('clears the setting preference flag', () => {
      expect(state.setting_preference).toBeFalsy();
    });

    it('updates the user', () => {
      expect(state.user).toEqual(NEW_USER);
    });
  });

  describe('when setting a preference fails', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, setting_preference: true },
        new AuthenticationActions.AuthSetPreferenceFailed()
      );
    });

    it('clears the setting preference flag', () => {
      expect(state.setting_preference).toBeFalsy();
    });
  });
});
