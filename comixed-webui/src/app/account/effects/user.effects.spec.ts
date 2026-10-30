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

import { TestBed } from '@angular/core/testing';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, tap, throwError } from 'rxjs';
import { AccountService } from '@app/account/services/account-service';
import { TokenService } from '@app/account/services/token-service';
import { AlertService } from '@app/services/alert-service';
import { MessageService } from '@openng/optimus-ui/api';
import { LoginResponse } from '@app/account/models/net/login-response';
import { UserActions } from '@app/account/actions/user.actions';
import { USER_READER } from '@app/account/account-fixtures';
import { hot } from 'vitest-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { UserEffects } from '@app/account/effects/user.effects';

describe.todo('UserEffects', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = TEST_USER.email;
  const TEST_PASSWORD = 'th3!p455w0Rd';
  const TEST_TOKEN = 'The Auth Token';
  const TEST_PREFERENCE_NAME = 'preference.name';
  const TEST_PREFERENCE_VALUE = 'preference.value';

  let actions$: Observable<unknown>;
  let effects: UserEffects;
  let accountService: AccountService;
  let tokenService: TokenService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        AccountService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(UserEffects);
    accountService = TestBed.inject(AccountService);
    tokenService = TestBed.inject(TokenService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('logging into the app', () => {
    it('should dispatch an action on success', () => {
      const serviceResponse = {
        email: TEST_EMAIL,
        token: TEST_TOKEN
      } as LoginResponse;
      const action = UserActions.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome1 = UserActions.loginSuccess();
      const outcome2 = UserActions.load();

      actions$ = hot('-a', { a: action });
      const loginSpy = vi
        .spyOn(accountService, 'login')
        .mockReturnValue(of(serviceResponse));
      const setAuthTokenSpy = vi.spyOn(tokenService, 'setAuthToken');
      expect(
        effects.login$.pipe(
          tap(response => expect(response).toStrictEqual([outcome1, outcome2]))
        )
      ).toSatisfyOnFlush(() => {
        expect(loginSpy).toHaveBeenCalledWith({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });
        expect(setAuthTokenSpy).toHaveBeenCalledWith(TEST_TOKEN);
      });
    });

    it('should dispatch an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = UserActions.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = UserActions.loginFailure();

      actions$ = hot('-a', { a: action });
      const loginSpy = vi
        .spyOn(accountService, 'login')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.login$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loginSpy).toHaveBeenCalledWith({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });
        expect(errorSpy).toHaveBeenCalled();
      });
    });

    it('should dispatch an action on general failure', () => {
      const action = UserActions.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = UserActions.loginFailure();

      actions$ = hot('-a', { a: action });
      const loginSpy = vi.spyOn(accountService, 'login').mockThrow(new Error());
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.login$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loginSpy).toHaveBeenCalledWith({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });
        expect(errorSpy).toHaveBeenCalled();
      });
    });
  });

  describe('loading the current user', () => {
    it('should dispatch an action on success', () => {
      const serviceResponse = TEST_USER;
      const action = UserActions.load();
      const outcome = UserActions.loadSuccess({ user: TEST_USER });

      actions$ = hot('-a', { a: action });
      const loadUserSpy = vi
        .spyOn(accountService, 'loadUser')
        .mockReturnValue(of(serviceResponse));
      expect(
        effects.loadUser$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadUserSpy).toHaveBeenCalledWith();
      });
    });

    it('should dispatch an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = UserActions.load();
      const outcome = UserActions.loadFailure();

      actions$ = hot('-a', { a: action });
      const loadUserSpy = vi
        .spyOn(accountService, 'loadUser')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.loadUser$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadUserSpy).toHaveBeenCalledWith();
        expect(errorSpy).toHaveBeenCalled();
      });
    });

    it('should dispatch an action on general failure', () => {
      const action = UserActions.load();
      const outcome = UserActions.loadFailure();

      actions$ = hot('-a', { a: action });
      const loadUserSpy = vi
        .spyOn(accountService, 'loadUser')
        .mockThrow(new Error());
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.loadUser$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadUserSpy).toHaveBeenCalledWith();
        expect(errorSpy).toHaveBeenCalled();
      });
    });
  });

  describe('saving a user preference', () => {
    it('should dispatch an action on success', () => {
      const serviceResponse = TEST_USER;
      const action = UserActions.savePreference({
        name: TEST_PREFERENCE_NAME,
        value: TEST_PREFERENCE_VALUE
      });
      const outcome = UserActions.savePreferenceSuccess({ user: TEST_USER });

      actions$ = hot('-a', { a: action });
      const savePreferenceSpy = vi
        .spyOn(accountService, 'saveUserPreference')
        .mockReturnValue(of(serviceResponse));
      expect(
        effects.savePreference$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(savePreferenceSpy).toHaveBeenCalledWith();
      });
    });

    it('should dispatch an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = UserActions.savePreference({
        name: TEST_PREFERENCE_NAME,
        value: TEST_PREFERENCE_VALUE
      });
      const outcome = UserActions.savePreferenceFailure();

      actions$ = hot('-a', { a: action });
      const savePreferenceSpy = vi
        .spyOn(accountService, 'saveUserPreference')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.savePreference$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(savePreferenceSpy).toHaveBeenCalledWith();
        expect(errorSpy).toHaveBeenCalled();
      });
    });

    it('should dispatch an action on general failure', () => {
      const action = UserActions.savePreference({
        name: TEST_PREFERENCE_NAME,
        value: TEST_PREFERENCE_VALUE
      });
      const outcome = UserActions.savePreferenceFailure();

      actions$ = hot('-a', { a: action });
      const savePreferenceSpy = vi
        .spyOn(accountService, 'saveUserPreference')
        .mockThrow(new Error());
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.savePreference$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(savePreferenceSpy).toHaveBeenCalledWith();
        expect(errorSpy).toHaveBeenCalled();
      });
    });
  });
});
