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

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { TranslateModule } from '@ngx-translate/core';
import { USER_READER } from 'app/user';
import * as AuthActions from 'app/user/actions/authentication.actions';
import { AuthenticationService } from 'app/user/services/authentication.service';
import { TokenService } from 'app/user/services/token.service';
import { cold, hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';
import { AuthenticationEffects } from './authentication.effects';
import objectContaining = jasmine.objectContaining;

describe('AuthenticationEffects', () => {
  const USER = USER_READER;
  const EMAIL = USER.email;
  const PASSWORD = 'comixedadmin';
  const AUTH_TOKEN = 'abcdef0123456789';
  const PREFERENCE_NAME = 'pref.name';
  const PREFERENCE_VALUE = 'pref-value';

  let effects: AuthenticationEffects;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;
  let tokenService: TokenService;
  let messageService: MessageService;
  let actions: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'home', redirectTo: '' }]),
        TranslateModule.forRoot(),
        LoggerModule.forRoot()
      ],
      providers: [
        AuthenticationEffects,
        provideMockActions(() => actions),
        {
          provide: AuthenticationService,
          useValue: {
            submitLoginData: jasmine.createSpy(
              'AuthenticationService.submitLoginData'
            ),
            getAuthenticatedUser: jasmine.createSpy(
              'AuthenticationService.getAuthenticatedUser'
            ),
            setPreference: jasmine.createSpy(
              'AuthenticationService.setPreference'
            )
          }
        },
        TokenService,
        MessageService
      ]
    });

    effects = TestBed.get(AuthenticationEffects);
    authenticationService = TestBed.get(AuthenticationService);
    tokenService = TestBed.get(TokenService);
    spyOn(tokenService, 'saveToken');
    spyOn(tokenService, 'signout');
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('when the user logs in', () => {
    it('fires an actions on success', () => {
      const serviceResponse = { email: USER_READER.email, token: AUTH_TOKEN };
      const action = new AuthActions.AuthSubmitLogin({
        email: EMAIL,
        password: PASSWORD
      });
      const outcome1 = new AuthActions.AuthCheckState();
      const outcome2 = new AuthActions.AuthSetToken({ token: AUTH_TOKEN });
      const outcome3 = new AuthActions.AuthHideLogin();

      actions = hot('-a', { a: action });
      authenticationService.submitLoginData.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-(bcd)', { b: outcome1, c: outcome2, d: outcome3 });
      expect(effects.submitLoginData$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new AuthActions.AuthSubmitLogin({
        email: EMAIL,
        password: PASSWORD
      });
      const outcome = new AuthActions.AuthNoUserLoaded();

      actions = hot('-a', { a: action });
      authenticationService.submitLoginData.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.submitLoginData$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new AuthActions.AuthSubmitLogin({
        email: EMAIL,
        password: PASSWORD
      });
      const outcome = new AuthActions.AuthNoUserLoaded();

      actions = hot('-a', { a: action });
      authenticationService.submitLoginData.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.submitLoginData$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when performing an authentication check', () => {
    it('fires an action when a user is retrieved', () => {
      const serviceResponse = USER;
      const action = new AuthActions.AuthCheckState();
      const outcome = new AuthActions.AuthUserLoaded({
        user: serviceResponse
      });

      actions = hot('-a', { a: action });
      authenticationService.getAuthenticatedUser.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.getAuthenticatedUser$).toBeObservable(expected);
    });

    it('fires an action when no user is retrieved', () => {
      const serviceResponse = null;
      const action = new AuthActions.AuthCheckState();
      const outcome = new AuthActions.AuthNoUserLoaded();

      actions = hot('-a', { a: action });
      authenticationService.getAuthenticatedUser.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.getAuthenticatedUser$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new AuthActions.AuthCheckState();
      const outcome = new AuthActions.AuthNoUserLoaded();

      actions = hot('-a', { a: action });
      authenticationService.getAuthenticatedUser.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.getAuthenticatedUser$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const action = new AuthActions.AuthCheckState();
      const outcome = new AuthActions.AuthNoUserLoaded();

      actions = hot('-a', { a: action });
      authenticationService.getAuthenticatedUser.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.getAuthenticatedUser$).toBeObservable(expected);
    });
  });

  describe('when the user logs out', () => {
    it('fires an action', () => {
      const action = new AuthActions.AuthLogout();
      const outcome = new AuthActions.AuthCheckState();

      actions = hot('-a', { a: action });

      const expected = cold('-b', { b: outcome });
      expect(effects.logout$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });
  });

  describe('when the login failed', () => {
    it('fires an action', () => {
      const action = new AuthActions.AuthLoginFailed();
      const outcome = new AuthActions.AuthCheckState();

      actions = hot('-a', { a: action });

      const expected = cold('-b', { b: outcome });
      expect(effects.authenticationFailed$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when setting a preference', () => {
    it('fires an action one success', () => {
      const serviceResponse = USER;
      const action = new AuthActions.AuthSetPreference({
        name: PREFERENCE_NAME,
        value: PREFERENCE_VALUE
      });
      const outcome = new AuthActions.AuthPreferenceSet({ user: USER });

      actions = hot('-a', { a: action });
      authenticationService.setPreference.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setPreference$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new AuthActions.AuthSetPreference({
        name: PREFERENCE_NAME,
        value: PREFERENCE_VALUE
      });
      const outcome = new AuthActions.AuthSetPreferenceFailed();

      actions = hot('-a', { a: action });
      authenticationService.setPreference.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = cold('-b', { b: outcome });
      expect(effects.setPreference$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const action = new AuthActions.AuthSetPreference({
        name: PREFERENCE_NAME,
        value: PREFERENCE_VALUE
      });
      const outcome = new AuthActions.AuthSetPreferenceFailed();

      actions = hot('-a', { a: action });
      authenticationService.setPreference.and.throwError('expected');

      const expected = cold('-(b|)', { b: outcome });
      expect(effects.setPreference$).toBeObservable(expected);
    });
  });
});
