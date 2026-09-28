/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
import { InitialUserAccountEffects } from './initial-user-account.effects';
import { UserService } from '@app/user/services/user.service';
import { CheckForAdminResponse } from '@app/user/models/net/check-for-admin-response';
import {
  createAdminAccount,
  createAdminAccountFailure,
  createAdminAccountSuccess,
  loadInitialUserAccount,
  loadInitialUserAccountFailure,
  loadInitialUserAccountSuccess
} from '@app/user/actions/initial-user-account.actions';
import { hot } from 'jasmine-marbles';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { USER_ADMIN } from '@app/user/user.fixtures';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

describe('InitialUserAccountEffects', () => {
  const HAS_EXISTING = Math.random() > 0.5;
  const EMAIL = USER_ADMIN.email;
  const PASSWORD = 'my!password';

  let actions$: Observable<any>;
  let effects: InitialUserAccountEffects;
  let userService: jasmine.SpyObj<UserService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        InitialUserAccountEffects,
        provideMockActions(() => actions$),
        {
          provide: UserService,
          useValue: {
            checkForAdminAccount: jasmine.createSpy(
              'UserService.checkForAdminAccount()'
            ),
            createAdminAccount: jasmine.createSpy(
              'UserService.createAdminAccount()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(InitialUserAccountEffects);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    const serviceResponse = {
      hasExisting: HAS_EXISTING
    } as CheckForAdminResponse;
    const action = loadInitialUserAccount();
    const outcome = loadInitialUserAccountSuccess({
      hasExisting: HAS_EXISTING
    });

    actions$ = hot('-a', { a: action });
    userService.checkForAdminAccount.and.returnValue(of(serviceResponse));

    const expected = hot('-b', { b: outcome });
    expect(effects.checkAdminAccount$).toBeObservable(expected);
  });

  describe('checking for existing admin accounts', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        hasExisting: HAS_EXISTING
      } as CheckForAdminResponse;
      const action = loadInitialUserAccount();
      const outcome = loadInitialUserAccountSuccess({
        hasExisting: HAS_EXISTING
      });

      actions$ = hot('-a', { a: action });
      userService.checkForAdminAccount.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.checkAdminAccount$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = {
        hasExisting: HAS_EXISTING
      } as CheckForAdminResponse;
      const action = loadInitialUserAccount();
      const outcome = loadInitialUserAccountFailure();

      actions$ = hot('-a', { a: action });
      userService.checkForAdminAccount.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.checkAdminAccount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadInitialUserAccount();
      const outcome = loadInitialUserAccountFailure();

      actions$ = hot('-a', { a: action });
      userService.checkForAdminAccount.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.checkAdminAccount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('creating the initial admin account', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = createAdminAccount({ email: EMAIL, password: PASSWORD });
      const outcome1 = createAdminAccountSuccess();
      const outcome2 = loadInitialUserAccount();

      actions$ = hot('-a', { a: action });
      userService.createAdminAccount
        .withArgs({ email: EMAIL, password: PASSWORD })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.createAdminAccount$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = createAdminAccount({ email: EMAIL, password: PASSWORD });
      const outcome = createAdminAccountFailure();

      actions$ = hot('-a', { a: action });
      userService.createAdminAccount
        .withArgs({ email: EMAIL, password: PASSWORD })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.createAdminAccount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = createAdminAccount({ email: EMAIL, password: PASSWORD });
      const outcome = createAdminAccountFailure();

      actions$ = hot('-a', { a: action });
      userService.createAdminAccount
        .withArgs({ email: EMAIL, password: PASSWORD })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.createAdminAccount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
