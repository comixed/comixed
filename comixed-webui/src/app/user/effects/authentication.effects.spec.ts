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
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { AuthenticationService } from '@app/user/services/authentication-service';
import {
  loadCurrentUser,
  loadCurrentUserFailure,
  loadCurrentUserSuccess,
  login,
  loginFailure,
  loginSuccess
} from '@app/user/actions/authentication.actions';
import { USER_READER } from '@app/user/user-fixtures';
import { hot } from 'vitest-marbles';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { LoginResponse } from '@app/user/models/net/login-response';
import { TokenService } from '@app/user/services/token-service';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationEffects } from '@app/user/effects/authentication.effects';

describe('AuthenticationEffects', () => {
  const TEST_USER = USER_READER;
  const TEST_EMAIL = TEST_USER.email;
  const TEST_PASSWORD = 'the3!p455w0Rd';
  const TEST_TOKEN = 'the!returned!token';

  let actions$: Observable<unknown>;
  let effects: AuthenticationEffects;
  let authenticationService: AuthenticationService;
  let tokenService: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideLogger({ minLevel: LoggerLevel.OFF }),
        AuthenticationEffects,
        provideMockActions(() => actions$),
        AuthenticationService,
        TokenService
      ]
    });

    effects = TestBed.inject(AuthenticationEffects);
    authenticationService = vi.mocked(TestBed.inject(AuthenticationService));
    tokenService = vi.mocked(TestBed.inject(TokenService));
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the current user', () => {
    it('fires an action on success', () => {
      const serviceResponse = TEST_USER;
      const action = loadCurrentUser();
      const outcome = loadCurrentUserSuccess({ user: TEST_USER });

      const loadSpy = vi
        .spyOn(authenticationService, 'loadCurrentUser')
        .mockReturnValue(of(serviceResponse));
      actions$ = hot('-a', { a: action });
      expect(effects.loadCurrentUser$).toSatisfyOnFlush(() => {
        expect(effects.loadCurrentUser$).toBeObservable(
          hot('-o', { o: outcome })
        );
        expect(loadSpy).toHaveBeenCalled();
      });
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadCurrentUser();
      const outcome = loadCurrentUserFailure();

      const loadSpy = vi
        .spyOn(authenticationService, 'loadCurrentUser')
        .mockReturnValue(throwError(() => serviceResponse));
      actions$ = hot('-a', { a: action });
      expect(effects.loadCurrentUser$).toSatisfyOnFlush(() => {
        expect(effects.loadCurrentUser$).toBeObservable(
          hot('-o', { o: outcome })
        );
        expect(loadSpy).toHaveBeenCalled();
      });
    });

    it('fires an action on general failure', () => {
      const action = loadCurrentUser();
      const outcome = loadCurrentUserFailure();

      const loadSpy = vi
        .spyOn(authenticationService, 'loadCurrentUser')
        .mockThrow(() => new Error('expected'));
      actions$ = hot('-a', { a: action });
      expect(effects.loadCurrentUser$).toSatisfyOnFlush(() => {
        expect(effects.loadCurrentUser$).toBeObservable(
          hot('-(o|)', { o: outcome })
        );
        expect(loadSpy).toHaveBeenCalled();
      });
    });
  });

  describe('authenticating a user', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        email: TEST_EMAIL,
        token: TEST_TOKEN
      } as LoginResponse;
      const action = login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome1 = loginSuccess();
      const outcome2 = loadCurrentUser();

      const loginSpy = vi
        .spyOn(authenticationService, 'login')
        .mockReturnValue(of(serviceResponse));
      const setAuthTokenSpy = vi.spyOn(tokenService, 'setAuthToken');
      actions$ = hot('-a', { a: action });
      expect(effects.login$).toSatisfyOnFlush(() => {
        expect(effects.login$).toBeObservable(
          hot('-(op)', { o: outcome1, p: outcome2 })
        );
        expect(loginSpy).toHaveBeenCalledWith({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });
        expect(setAuthTokenSpy).toHaveBeenCalledWith(TEST_TOKEN);
      });
    });

    it('fires an action on server error', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = loginFailure();

      const loginSpy = vi
        .spyOn(authenticationService, 'login')
        .mockReturnValue(throwError(() => serviceResponse));
      const setAuthTokenSpy = vi.spyOn(tokenService, 'setAuthToken');
      actions$ = hot('-a', { a: action });
      expect(effects.login$).toSatisfyOnFlush(() => {
        expect(effects.login$).toBeObservable(hot('-o', { o: outcome }));
        expect(loginSpy).toHaveBeenCalledWith({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });
        expect(setAuthTokenSpy).not.toHaveBeenCalled();
      });
    });

    it('fires an action on general error', () => {
      const action = login({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      const outcome = loginFailure();

      const loginSpy = vi
        .spyOn(authenticationService, 'login')
        .mockThrow(() => new Error('expected'));
      const setAuthTokenSpy = vi.spyOn(tokenService, 'setAuthToken');
      actions$ = hot('-a', { a: action });
      expect(effects.login$).toSatisfyOnFlush(() => {
        expect(effects.login$).toBeObservable(hot('-(o|)', { o: outcome }));
        expect(loginSpy).toHaveBeenCalledWith({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        });
        expect(setAuthTokenSpy).not.toHaveBeenCalled();
      });
    });
  });
});
