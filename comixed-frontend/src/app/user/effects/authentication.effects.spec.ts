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
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import * as AuthActions from 'app/user/actions/authentication.actions';
import { AuthenticationEffects } from './authentication.effects';
import { AuthenticationService } from 'app/user/services/authentication.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cold, hot } from 'jasmine-marbles';
import objectContaining = jasmine.objectContaining;
import { USER_READER } from 'app/user';
import { TokenService } from 'app/user/services/token.service';

describe('AuthenticationEffects', () => {
  const USER = USER_READER;
  const EMAIL = USER.email;
  const PASSWORD = 'comixedadmin';
  const AUTH_TOKEN = 'abcdef0123456789';
  const PREFERENCE_NAME = 'pref.name';
  const PREFERENCE_VALUE = 'pref-value';

  let auth_effects: AuthenticationEffects;
  let auth_service: jasmine.SpyObj<AuthenticationService>;
  let router: Router;
  let token_service: TokenService;
  let translate_service: TranslateService;
  let message_service: MessageService;
  let actions: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'home', redirectTo: '' }]),
        TranslateModule.forRoot()
      ],
      providers: [
        AuthenticationEffects,
        provideMockActions(() => actions),
        {
          provide: AuthenticationService,
          useValue: {
            submit_login_data: jasmine.createSpy(
              'AuthenticationService.submit_login_data'
            ),
            get_authenticated_user: jasmine.createSpy(
              'AuthenticationService.get_authenticated_user'
            ),
            set_preference: jasmine.createSpy(
              'AuthenticationService.setPreference'
            )
          }
        },
        TokenService,
        MessageService
      ]
    });

    auth_effects = TestBed.get(AuthenticationEffects);
    auth_service = TestBed.get(AuthenticationService);
    token_service = TestBed.get(TokenService);
    spyOn(token_service, 'save_token');
    spyOn(token_service, 'sign_out');
    translate_service = TestBed.get(TranslateService);
    message_service = TestBed.get(MessageService);
    spyOn(message_service, 'add');
    router = TestBed.get(Router);
    spyOn(router, 'navigate');
  });

  it('should be created', () => {
    expect(auth_effects).toBeTruthy();
  });

  describe('when the user logs in', () => {
    it('fires an actions on success', () => {
      const service_response = { email: USER_READER.email, token: AUTH_TOKEN };
      const action = new AuthActions.AuthSubmitLogin({
        email: EMAIL,
        password: PASSWORD
      });
      const outcome1 = new AuthActions.AuthCheckState();
      const outcome2 = new AuthActions.AuthSetToken({ token: AUTH_TOKEN });
      const outcome3 = new AuthActions.AuthHideLogin();

      actions = hot('-a', { a: action });
      const response = cold('-a|', { a: [service_response] });
      auth_service.submit_login_data.and.returnValue(of(service_response));

      const expected = hot('-(bcd)', { b: outcome1, c: outcome2, d: outcome3 });
      expect(auth_effects.submit_login_data$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new Error('expected');
      const action = new AuthActions.AuthSubmitLogin({
        email: EMAIL,
        password: PASSWORD
      });
      const outcome = new AuthActions.AuthNoUserLoaded();

      actions = hot('-a', { a: action });
      const response = cold('-a|', { a: [service_response] });
      auth_service.submit_login_data.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(auth_effects.submit_login_data$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const service_response = new Error('expected');
      const action = new AuthActions.AuthSubmitLogin({
        email: EMAIL,
        password: PASSWORD
      });
      const outcome = new AuthActions.AuthNoUserLoaded();

      actions = hot('-a', { a: action });
      const response = cold('-#|', {}, service_response);
      auth_service.submit_login_data.and.throwError(service_response.message);

      const expected = cold('-(b|)', { b: outcome });
      expect(auth_effects.submit_login_data$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when performing an authentication check', () => {
    it('fires an action when a user is retrieved', () => {
      const service_response = USER;
      const action = new AuthActions.AuthCheckState();
      const outcome = new AuthActions.AuthUserLoaded({
        user: service_response
      });

      actions = hot('-a', { a: action });
      const response = cold('-a|', { a: [service_response] });
      auth_service.get_authenticated_user.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(auth_effects.get_authenticated_user$).toBeObservable(expected);
    });

    it('fires an action when no user is retrieved', () => {
      const service_response = null;
      const action = new AuthActions.AuthCheckState();
      const outcome = new AuthActions.AuthNoUserLoaded();

      actions = hot('-a', { a: action });
      const response = cold('-a|', { a: [service_response] });
      auth_service.get_authenticated_user.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(auth_effects.get_authenticated_user$).toBeObservable(expected);
      expect(router.navigate).toHaveBeenCalledWith(['home']);
    });

    it('fires an action on service failure', () => {
      const service_response = new Error('expected');
      const action = new AuthActions.AuthCheckState();
      const outcome = new AuthActions.AuthNoUserLoaded();

      actions = hot('-a', { a: action });
      const response = cold('-a|', { a: [service_response] });
      auth_service.get_authenticated_user.and.returnValue(
        throwError(service_response)
      );

      const expected = cold('-b', { b: outcome });
      expect(auth_effects.get_authenticated_user$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const service_response = new Error('expected');
      const action = new AuthActions.AuthCheckState();
      const outcome = new AuthActions.AuthNoUserLoaded();

      actions = hot('-a', { a: action });
      const response = cold('-#|', {}, service_response);
      auth_service.get_authenticated_user.and.throwError(
        service_response.message
      );

      const expected = cold('-(b|)', { b: outcome });
      expect(auth_effects.get_authenticated_user$).toBeObservable(expected);
    });
  });

  describe('when the user logs out', () => {
    it('fires an action', () => {
      const action = new AuthActions.AuthLogout();
      const outcome = new AuthActions.AuthCheckState();

      actions = hot('-a', { a: action });
      const response = cold('-a|', { a: of(() => {}) });

      const expected = cold('-b', { b: outcome });
      expect(auth_effects.logout$).toBeObservable(expected);
      expect(message_service.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });
  });

  describe('when setting a preference', () => {
    it('fires an action one success', () => {
      const service_response = USER;
      const action = new AuthActions.AuthSetPreference({
        name: PREFERENCE_NAME,
        value: PREFERENCE_VALUE
      });
      const outcome = new AuthActions.AuthPreferenceSet({ user: USER });

      actions = hot('-a', { a: action });
      const response = cold('-a|', { a: [service_response] });
      auth_service.set_preference.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(auth_effects.set_preference$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const service_response = new Error('expected');
      const action = new AuthActions.AuthSetPreference({
        name: PREFERENCE_NAME,
        value: PREFERENCE_VALUE
      });
      const outcome = new AuthActions.AuthSetPreferenceFailed();

      actions = hot('-a', { a: action });
      const response = cold('-a|', { a: [service_response] });
      auth_service.set_preference.and.returnValue(throwError(service_response));

      const expected = cold('-b', { b: outcome });
      expect(auth_effects.set_preference$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const service_response = new Error('expected');
      const action = new AuthActions.AuthSetPreference({
        name: PREFERENCE_NAME,
        value: PREFERENCE_VALUE
      });
      const outcome = new AuthActions.AuthSetPreferenceFailed();

      actions = hot('-a', { a: action });
      const response = cold('-#|', {}, service_response);
      auth_service.set_preference.and.throwError(service_response.message);

      const expected = cold('-(b|)', { b: outcome });
      expect(auth_effects.set_preference$).toBeObservable(expected);
    });
  });
});
