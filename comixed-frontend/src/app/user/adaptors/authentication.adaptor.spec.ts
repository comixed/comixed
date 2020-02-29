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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { TestBed } from '@angular/core/testing';
import { AuthenticationAdaptor } from 'app/user';
import { Store, StoreModule } from '@ngrx/store';
import { AppState } from 'app/library';
import * as AuthActions from 'app/user/actions/authentication.actions';
import { USER_ADMIN, USER_READER } from 'app/user/models/user.fixtures';
import { reducer } from 'app/user/reducers/authentication.reducer';

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
      imports: [StoreModule.forRoot({ auth_state: reducer })],
      providers: [AuthenticationAdaptor]
    });

    auth_adaptor = TestBed.get(AuthenticationAdaptor);
    store = TestBed.get(Store);
  });

  it('should create an instance', () => {
    expect(auth_adaptor).toBeTruthy();
  });

  describe('when no user is logged in', () => {
    beforeEach(() => {
      store.dispatch(new AuthActions.AuthNoUserLoaded());
    });

    it('returns false for the authentication check', () => {
      expect(auth_adaptor.authenticated).toBeFalsy();
    });

    it('returns false for the reader role check', () => {
      expect(auth_adaptor.isReader).toBeFalsy();
    });

    it('returns false for the admin role check', () => {
      expect(auth_adaptor.isAdmin).toBeFalsy();
    });
  });

  describe('when a reader is logged in', () => {
    beforeEach(() => {
      store.dispatch(new AuthActions.AuthUserLoaded({ user: USER_READER }));
    });

    it('returns true for the authentication check', () => {
      expect(auth_adaptor.authenticated).toBeTruthy();
    });

    it('returns true for the reader role check', () => {
      expect(auth_adaptor.isReader).toBeTruthy();
    });

    it('returns false for the admin role check', () => {
      expect(auth_adaptor.isAdmin).toBeFalsy();
    });
  });

  describe('when an administrator is logged in', () => {
    beforeEach(() => {
      store.dispatch(new AuthActions.AuthUserLoaded({ user: USER_ADMIN }));
    });

    it('returns true for the authentication check', () => {
      expect(auth_adaptor.authenticated).toBeTruthy();
    });

    it('returns true for the reader role check', () => {
      expect(auth_adaptor.isReader).toBeTruthy();
    });

    it('returns true for the admin role check', () => {
      expect(auth_adaptor.isAdmin).toBeTruthy();
    });
  });

  describe('when getting the current user', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
      auth_adaptor.getCurrentUser();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new AuthActions.AuthCheckState()
      );
    });
  });

  describe('when it has an auth token', () => {
    beforeEach(() => {
      store.dispatch(new AuthActions.AuthSetToken({ token: AUTH_TOKEN }));
    });

    it('returns the authentication token if set', () => {
      expect(auth_adaptor.authToken).toEqual(AUTH_TOKEN);
    });

    it('returns true when checking if the token is set', () => {
      expect(auth_adaptor.hasAuthToken).toBeTruthy();
    });
  });

  describe('when it does not have an auth token', () => {
    beforeEach(() => {
      store.dispatch(new AuthActions.AuthClearToken());
    });

    it('returns null if not set', () => {
      expect(auth_adaptor.authToken).toBeNull();
    });

    it('returns false checking if the token is set', () => {
      expect(auth_adaptor.hasAuthToken).toBeFalsy();
    });
  });

  describe('displaying the login dialog', () => {
    it('returns false when hidden', () => {
      store.dispatch(new AuthActions.AuthHideLogin());
      expect(auth_adaptor.showingLogin).toBeFalsy();
    });

    it('returns true when shown', () => {
      store.dispatch(new AuthActions.AuthShowLogin());
      expect(auth_adaptor.showingLogin).toBeTruthy();
    });
  });

  describe('when starting the login process', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
      auth_adaptor.startLogin();
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
      auth_adaptor.sendLoginData(EMAIL, PASSWORD);
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
      auth_adaptor.cancelLogin();
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
      auth_adaptor.startLogout();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new AuthActions.AuthLogout());
    });
  });

  describe('when setting a user preference', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
      auth_adaptor.setPreference(PREFERENCE_NAME, PREFERENCE_VALUE);
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
      store.dispatch(
        new AuthActions.AuthUserLoaded({
          user: {
            ...USER_READER,
            preferences: [{ name: PREFERENCE_NAME, value: PREFERENCE_VALUE }]
          }
        })
      );
    });

    it('returns the value for a known property', () => {
      expect(auth_adaptor.getPreference(PREFERENCE_NAME)).toEqual(
        PREFERENCE_VALUE
      );
    });

    it('returns null for an unknown property', () => {
      expect(auth_adaptor.getPreference(PREFERENCE_VALUE)).toBeNull();
    });
  });
});
