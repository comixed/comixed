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

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { UserEffects } from './user.effects';
import { UserService } from '@app/user/services/user.service';
import { User } from '@app/user/models/user';
import { USER_READER } from '@app/user/user.fixtures';
import {
  currentUserLoaded,
  loadCurrentUser,
  loadCurrentUserFailed,
  loginUser,
  loginUserFailed, logoutUser,
  userLoggedIn, userLoggedOut
} from '@app/user/actions/user.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { AlertService, ApiResponse, TokenService } from '@app/core';
import { CoreModule } from '@app/core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginResponse } from '@app/user/models/net/login-response';

describe('UserEffects', () => {
  const USER = USER_READER;
  const PASSWORD = 'this!is!my!password';
  const AUTH_TOKEN = 'my!token';

  let actions$: Observable<any>;
  let effects: UserEffects;
  let userService: jasmine.SpyObj<UserService>;
  let alertService: AlertService;
  let tokenService: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        UserEffects,
        provideMockActions(() => actions$),
        {
          provide: UserService,
          useValue: {
            loadCurrentUser: jasmine.createSpy('UserService.loadCurrentUser()'),
            loginUser: jasmine.createSpy('userService.loginUser()')
          }
        }
      ]
    });

    effects = TestBed.inject(UserEffects);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
    tokenService = TestBed.inject(TokenService);
    spyOn(tokenService, 'setAuthToken');
    spyOn(tokenService, 'clearAuthToken');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the current user', () => {
    it('fires an action on success', () => {
      const serviceResponse: ApiResponse<User> = {
        success: true,
        result: USER
      };
      const action = loadCurrentUser();
      const outcome = currentUserLoaded({ user: USER });

      actions$ = hot('-a', { a: action });
      userService.loadCurrentUser.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadCurrentUser$).toBeObservable(expected);
    });

    it('fires an action on failure', () => {
      const serviceResponse: ApiResponse<User> = {
        success: false
      };
      const action = loadCurrentUser();
      const outcome = loadCurrentUserFailed();

      actions$ = hot('-a', { a: action });
      userService.loadCurrentUser.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadCurrentUser$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadCurrentUser();
      const outcome = loadCurrentUserFailed();

      actions$ = hot('-a', { a: action });
      userService.loadCurrentUser.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadCurrentUser$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadCurrentUser();
      const outcome = loadCurrentUserFailed();

      actions$ = hot('-a', { a: action });
      userService.loadCurrentUser.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadCurrentUser$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('user login', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        success: true,
        result: { email: USER.email, token: AUTH_TOKEN }
      } as ApiResponse<LoginResponse>;
      const action = loginUser({ email: USER.email, password: PASSWORD });
      const outcome1 = userLoggedIn({ token: AUTH_TOKEN });
      const outcome2 = loadCurrentUser();

      actions$ = hot('-a', { a: action });
      userService.loginUser.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.loginUser$).toBeObservable(expected);
      expect(tokenService.setAuthToken).toHaveBeenCalledWith(AUTH_TOKEN);
    });

    it('fires an action on failure', () => {
      const serviceResponse = { success: false } as ApiResponse<LoginResponse>;
      const action = loginUser({ email: USER.email, password: PASSWORD });
      const outcome = loginUserFailed();

      actions$ = hot('-a', { a: action });
      userService.loginUser.and.returnValue(of(serviceResponse));

      const expected = hot('-(b)', { b: outcome });
      expect(effects.loginUser$).toBeObservable(expected);
      expect(tokenService.clearAuthToken).toHaveBeenCalled();
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loginUser({ email: USER.email, password: PASSWORD });
      const outcome = loginUserFailed();

      actions$ = hot('-a', { a: action });
      userService.loginUser.and.returnValue(throwError(serviceResponse));

      const expected = hot('-(b)', { b: outcome });
      expect(effects.loginUser$).toBeObservable(expected);
      expect(tokenService.clearAuthToken).toHaveBeenCalled();
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loginUser({ email: USER.email, password: PASSWORD });
      const outcome = loginUserFailed();

      actions$ = hot('-a', { a: action });
      userService.loginUser.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loginUser$).toBeObservable(expected);
      expect(tokenService.clearAuthToken).toHaveBeenCalled();
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('user logout', () => {
    it('fires an action on success', () => {
      const action = logoutUser();
      const outcome = userLoggedOut();

      actions$ = hot('-a', {a: action});

      const expected = hot('-b', {b: outcome});
      expect(effects.logoutUser$).toBeObservable(expected);
      expect(tokenService.clearAuthToken).toHaveBeenCalled();
    });
  });
});
