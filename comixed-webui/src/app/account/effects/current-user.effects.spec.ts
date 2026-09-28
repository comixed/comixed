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
import { CurrentUserEffects } from './current-user.effects';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, tap, throwError } from 'rxjs';
import { AccountService } from '@app/account/services/account-service';
import { TokenService } from '@app/account/services/token-service';
import { AlertService } from '@app/services/alert-service';
import { MessageService } from '@openng/optimus-ui/api';
import { LoginResponse } from '@app/account/models/net/login-response';
import { CurrentUserActions } from '@app/account/actions/current-user.actions';
import { USER_READER } from '@app/account/account-fixtures';
import { hot } from 'vitest-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';

describe.todo('CurrentUserEffects', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = TEST_USER.email;
  const TEST_PASSWORD = 'th3!p455w0Rd';
  const TEST_TOKEN = 'The Auth Token';

  let actions$: Observable<unknown>;
  let effects: CurrentUserEffects;
  let accountService: AccountService;
  let tokenService: TokenService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CurrentUserEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        AccountService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(CurrentUserEffects);
    accountService = TestBed.inject(AccountService);
    tokenService = TestBed.inject(TokenService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('logging into the app', () => {
    it('should fire an account on success', () => {
      const serviceResponse = {
        email: TEST_EMAIL,
        token: TEST_TOKEN
      } as LoginResponse;
      const action = CurrentUserActions.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome1 = CurrentUserActions.loginSuccess();
      const outcome2 = CurrentUserActions.load();

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

    it('should fire an account on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = CurrentUserActions.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = CurrentUserActions.loginFailure();

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

    it('should fire an account on general failure', () => {
      const action = CurrentUserActions.login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = CurrentUserActions.loginFailure();

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
    it('should fire an account on success', () => {
      const serviceResponse = TEST_USER;
      const action = CurrentUserActions.load();
      const outcome = CurrentUserActions.loadSuccess({ user: TEST_USER });

      actions$ = hot('-a', { a: action });
      const loadCurrentUserSpy = vi
        .spyOn(accountService, 'loadCurrentUser')
        .mockReturnValue(of(serviceResponse));
      expect(
        effects.loadCurrentUser$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadCurrentUserSpy).toHaveBeenCalledWith();
      });
    });

    it('should fire an account on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = CurrentUserActions.load();
      const outcome = CurrentUserActions.loadFailure();

      actions$ = hot('-a', { a: action });
      const loadCurrentUserSpy = vi
        .spyOn(accountService, 'loadCurrentUser')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.loadCurrentUser$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadCurrentUserSpy).toHaveBeenCalledWith();
        expect(errorSpy).toHaveBeenCalled();
      });
    });

    it('should fire an account on general failure', () => {
      const action = CurrentUserActions.load();
      const outcome = CurrentUserActions.loadFailure();

      actions$ = hot('-a', { a: action });
      const loadCurrentUserSpy = vi
        .spyOn(accountService, 'loadCurrentUser')
        .mockThrow(new Error());
      const errorSpy = vi.spyOn(alertService, 'error');
      expect(
        effects.loadCurrentUser$.pipe(
          tap(response => expect(response).toStrictEqual(outcome))
        )
      ).toSatisfyOnFlush(() => {
        expect(loadCurrentUserSpy).toHaveBeenCalledWith();
        expect(errorSpy).toHaveBeenCalled();
      });
    });
  });
});
