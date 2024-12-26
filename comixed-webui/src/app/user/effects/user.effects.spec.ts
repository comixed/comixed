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
import {
  READ_COMIC_BOOK_1,
  READ_COMIC_BOOK_2,
  READ_COMIC_BOOK_3,
  USER_READER
} from '@app/user/user.fixtures';
import {
  loadCurrentUser,
  loadCurrentUserFailure,
  loadCurrentUserSuccess,
  loginUser,
  loginUserFailure,
  loginUserSuccess,
  logoutUser,
  logoutUserFailure,
  logoutUserSuccess,
  saveCurrentUser,
  saveCurrentUserFailure,
  saveUserPreference,
  saveUserPreferenceFailure,
  saveUserPreferenceSuccess
} from '@app/user/actions/user.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { LoginResponse } from '@app/user/models/net/login-response';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TokenService } from '@app/core/services/token.service';
import { AlertService } from '@app/core/services/alert.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { setReadComicBooks } from '@app/user/actions/read-comic-books.actions';

describe('UserEffects', () => {
  const LAST_READ_ENTRIES = [
    READ_COMIC_BOOK_1,
    READ_COMIC_BOOK_2,
    READ_COMIC_BOOK_3
  ];
  const USER = { ...USER_READER, readComicBooks: LAST_READ_ENTRIES };
  const PASSWORD = 'this!is!my!password';
  const AUTH_TOKEN = 'my!token';
  const PREFERENCE_NAME = 'user.preference';
  const PREFERENCE_VALUE = 'preference.value';

  let actions$: Observable<any>;
  let effects: UserEffects;
  let userService: jasmine.SpyObj<UserService>;
  let alertService: AlertService;
  let tokenService: TokenService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: '*', redirectTo: '' }]),
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        UserEffects,
        provideMockActions(() => actions$),
        {
          provide: UserService,
          useValue: {
            loadCurrentUser: jasmine.createSpy('UserService.loadCurrentUser()'),
            loginUser: jasmine.createSpy('UserService.loginUser()'),
            logoutUser: jasmine.createSpy('UserService.logoutUser()'),
            saveUserPreference: jasmine.createSpy(
              'UserService.saveUserPreference()'
            ),
            saveUser: jasmine.createSpy('UserService.saveUser()')
          }
        }
      ]
    });

    effects = TestBed.inject(UserEffects);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
    tokenService = TestBed.inject(TokenService);
    spyOn(tokenService, 'setAuthToken');
    spyOn(tokenService, 'clearAuthToken');
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the current user', () => {
    it('fires an action on success', () => {
      const serviceResponse = USER;
      const action = loadCurrentUser();
      const outcome1 = loadCurrentUserSuccess({ user: USER });
      const outcome2 = setReadComicBooks({ entries: LAST_READ_ENTRIES });

      actions$ = hot('-a', { a: action });
      userService.loadCurrentUser.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.loadCurrentUser$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadCurrentUser();
      const outcome = loadCurrentUserFailure();

      actions$ = hot('-a', { a: action });
      userService.loadCurrentUser.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadCurrentUser$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const action = loadCurrentUser();
      const outcome = loadCurrentUserFailure();

      actions$ = hot('-a', { a: action });
      userService.loadCurrentUser.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadCurrentUser$).toBeObservable(expected);
    });
  });

  describe('user login', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        email: USER.email,
        token: AUTH_TOKEN
      } as LoginResponse;
      const action = loginUser({ email: USER.email, password: PASSWORD });
      const outcome1 = loginUserSuccess();
      const outcome2 = loadCurrentUser();

      actions$ = hot('-a', { a: action });
      userService.loginUser.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.loginUser$).toBeObservable(expected);
      expect(tokenService.setAuthToken).toHaveBeenCalledWith(AUTH_TOKEN);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loginUser({ email: USER.email, password: PASSWORD });
      const outcome = loginUserFailure();

      actions$ = hot('-a', { a: action });
      userService.loginUser.and.returnValue(throwError(serviceResponse));

      const expected = hot('-(b)', { b: outcome });
      expect(effects.loginUser$).toBeObservable(expected);
      expect(tokenService.clearAuthToken).toHaveBeenCalled();
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loginUser({ email: USER.email, password: PASSWORD });
      const outcome = loginUserFailure();

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
      const serverResponse = new HttpResponse({ status: 200 });
      const action = logoutUser();
      const outcome = logoutUserSuccess();

      actions$ = hot('-a', { a: action });
      userService.logoutUser.and.returnValue(of(serverResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.logoutUser$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
      expect(tokenService.clearAuthToken).toHaveBeenCalled();
    });

    it('fires an action on general failure', () => {
      const action = logoutUser();
      const outcome = logoutUserFailure();

      actions$ = hot('-a', { a: action });
      userService.logoutUser.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.logoutUser$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
      expect(tokenService.clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('saving a user preference', () => {
    it('fires an action on success', () => {
      const serviceResponse = USER;
      const action = saveUserPreference({
        name: PREFERENCE_NAME,
        value: PREFERENCE_VALUE
      });
      const outcome = saveUserPreferenceSuccess({ user: USER });

      actions$ = hot('-a', { a: action });
      userService.saveUserPreference.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveUserPreference$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveUserPreference({
        name: PREFERENCE_NAME,
        value: PREFERENCE_VALUE
      });
      const outcome = saveUserPreferenceFailure();

      actions$ = hot('-a', { a: action });
      userService.saveUserPreference.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.saveUserPreference$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const action = saveUserPreference({
        name: PREFERENCE_NAME,
        value: PREFERENCE_VALUE
      });
      const outcome = saveUserPreferenceFailure();

      actions$ = hot('-a', { a: action });
      userService.saveUserPreference.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.saveUserPreference$).toBeObservable(expected);
    });
  });

  describe('saving a user account', () => {
    it('fires an action on success', () => {
      const serviceResponse = USER;
      const action = saveCurrentUser({ user: USER, password: PASSWORD });
      const outcome = loadCurrentUserSuccess({ user: USER });

      actions$ = hot('-a', { a: action });
      userService.saveUser.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveCurrentUser$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveCurrentUser({ user: USER, password: PASSWORD });
      const outcome = saveCurrentUserFailure();

      actions$ = hot('-a', { a: action });
      userService.saveUser.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveCurrentUser$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = saveCurrentUser({ user: USER, password: PASSWORD });
      const outcome = saveCurrentUserFailure();

      actions$ = hot('-a', { a: action });
      userService.saveUser.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.saveCurrentUser$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
