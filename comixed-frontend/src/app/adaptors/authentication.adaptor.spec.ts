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

import { TestBed } from '@angular/core/testing';
import { AuthenticationAdaptor } from 'app/adaptors/authentication.adaptor';
import { Store, StoreModule } from '@ngrx/store';
import { REDUCERS } from 'app/app.reducers';
import { AppState } from 'app/app.state';
import * as AuthActions from 'app/actions/authentication.actions';
import { USER_ADMIN, USER_READER } from 'app/models/user.fixtures';
import { initial_state } from 'app/reducers/authentication.reducer';

describe('AuthenticationAdaptor', () => {
  const USER = USER_ADMIN;
  const AUTH_TOKEN = '1234567890ABCDEF';
  const EMAIL = USER.email;
  const PASSWORD = 'abc!123';
  const PREFERENCE_NAME = 'pref.name';
  const PREFERENCE_VALUE = 'pref-value';

  let auth_adaptor: AuthenticationAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot(REDUCERS)],
      providers: [AuthenticationAdaptor]
    });

    auth_adaptor = TestBed.get(AuthenticationAdaptor);
    store = TestBed.get(Store);
  });

  it('should create an instance', () => {
    expect(auth_adaptor).toBeTruthy();
  });

  describe('when checking if authentication has been initialized', () => {
    it('returns false', () => {
      auth_adaptor.auth_state = {
        ...auth_adaptor.auth_state,
        initialized: false
      };
      expect(auth_adaptor.initialized).toBeFalsy();
    });

    it('returns true', () => {
      auth_adaptor.auth_state = {
        ...auth_adaptor.auth_state,
        initialized: true
      };
      expect(auth_adaptor.initialized).toBeTruthy();
    });
  });

  describe('when no user is logged in', () => {
    beforeEach(() => {
      auth_adaptor.auth_state = { ...initial_state };
    });

    it('returns false for the authentication check', () => {
      expect(auth_adaptor.authenticated).toBeFalsy();
    });

    it('returns false for the reader role check', () => {
      expect(auth_adaptor.is_reader).toBeFalsy();
    });

    it('returns false for the admin role check', () => {
      expect(auth_adaptor.is_admin).toBeFalsy();
    });
  });

  describe('when a reader is logged in', () => {
    beforeEach(() => {
      auth_adaptor.auth_state = {
        ...initial_state,
        authenticated: true,
        user: USER_READER
      };
    });

    it('returns true for the authentication check', () => {
      expect(auth_adaptor.authenticated).toBeTruthy();
    });

    it('returns true for the reader role check', () => {
      expect(auth_adaptor.is_reader).toBeTruthy();
    });

    it('returns false for the admin role check', () => {
      expect(auth_adaptor.is_admin).toBeFalsy();
    });
  });

  describe('when an administrator is logged in', () => {
    beforeEach(() => {
      auth_adaptor.auth_state = {
        ...initial_state,
        authenticated: true,
        user: USER_ADMIN
      };
    });

    it('returns true for the authentication check', () => {
      expect(auth_adaptor.authenticated).toBeTruthy();
    });

    it('returns true for the reader role check', () => {
      expect(auth_adaptor.is_reader).toBeTruthy();
    });

    it('returns true for the admin role check', () => {
      expect(auth_adaptor.is_admin).toBeTruthy();
    });
  });

  describe('when getting the current user', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
      auth_adaptor.get_current_user();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new AuthActions.AuthCheckState()
      );
    });
  });

  describe('when it has an auth token', () => {
    beforeEach(() => {
      auth_adaptor.auth_state = {
        ...auth_adaptor.auth_state,
        authenticated: true,
        auth_token: AUTH_TOKEN
      };
    });

    it('returns the authentication token if set', () => {
      expect(auth_adaptor.auth_token).toEqual(AUTH_TOKEN);
    });

    it('returns true when checking if the token is set', () => {
      expect(auth_adaptor.has_auth_token).toBeTruthy();
    });
  });

  describe('when it does not have an auth token', () => {
    beforeEach(() => {
      auth_adaptor.auth_state = {
        ...auth_adaptor.auth_state,
        authenticated: false,
        auth_token: AUTH_TOKEN
      };
    });

    it('returns null if not set', () => {
      expect(auth_adaptor.auth_token).toBeNull();
    });

    it('returns false checking if the token is set', () => {
      expect(auth_adaptor.has_auth_token).toBeFalsy();
    });
  });

  describe('displaying the login dialog', () => {
    it('returns false when hidden', () => {
      auth_adaptor.auth_state = {
        ...auth_adaptor.auth_state,
        show_login: false
      };
      expect(auth_adaptor.showing_login).toBeFalsy();
    });

    it('returns true when shown', () => {
      auth_adaptor.auth_state = {
        ...auth_adaptor.auth_state,
        show_login: true
      };
      expect(auth_adaptor.showing_login).toBeTruthy();
    });
  });

  describe('when starting the login process', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
      auth_adaptor.start_login();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new AuthActions.AuthShowLogin()
      );
    });
  });

  describe('when sending the login data', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
      auth_adaptor.send_login_data(EMAIL, PASSWORD);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new AuthActions.AuthSubmitLogin({ email: EMAIL, password: PASSWORD })
      );
    });
  });

  describe('when canceling the login process', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
      auth_adaptor.cancel_login();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new AuthActions.AuthHideLogin()
      );
    });
  });

  describe('when starting the logout process', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
      auth_adaptor.start_logout();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new AuthActions.AuthLogout());
    });
  });

  describe('when setting a user preference', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
      auth_adaptor.set_preference(PREFERENCE_NAME, PREFERENCE_VALUE);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new AuthActions.AuthSetPreference({
          name: PREFERENCE_NAME,
          value: PREFERENCE_VALUE
        })
      );
    });
  });

  describe('when getting a user preference', () => {
    beforeEach(() => {
      auth_adaptor.auth_state = {
        ...auth_adaptor.auth_state,
        user: {
          ...USER_READER,
          preferences: [{ name: PREFERENCE_NAME, value: PREFERENCE_VALUE }]
        }
      };
    });

    it('returns the value for a known property', () => {
      expect(auth_adaptor.get_preference(PREFERENCE_NAME)).toEqual(
        PREFERENCE_VALUE
      );
    });

    it('returns null for an unknown property', () => {
      expect(auth_adaptor.get_preference(PREFERENCE_VALUE)).toBeNull();
    });
  });
});
