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
import { ManageUsersEffects } from './manage-users.effects';
import { USER_ADMIN, USER_BLOCKED, USER_READER } from '@app/user/user.fixtures';
import { UserService } from '@app/user/services/user.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import {
  deleteUserAccount,
  deleteUserAccountFailure,
  deleteUserAccountSuccess,
  loadUserAccountList,
  loadUserAccountListFailure,
  loadUserAccountListSuccess,
  saveUserAccount,
  saveUserAccountFailure,
  saveUserAccountSuccess,
  setCurrentUser
} from '@app/user/actions/manage-users.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('ManageUsersEffects', () => {
  const USERS = [USER_ADMIN, USER_BLOCKED, USER_READER];
  const USER = USER_READER;
  const PASSWORD = 'th3!p455w0rD';

  let actions$: Observable<any>;
  let effects: ManageUsersEffects;
  let userService: jasmine.SpyObj<UserService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        ManageUsersEffects,
        provideMockActions(() => actions$),
        {
          provide: UserService,
          useValue: {
            loadUserAccounts: jasmine.createSpy(
              'UserService.loadUserAccounts()'
            ),
            saveUserAccount: jasmine.createSpy('UserService.saveUserAccount()'),
            deleteUserAccount: jasmine.createSpy(
              'UserService.deleteUserAccount()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ManageUsersEffects);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the list of user accounts', () => {
    it('fires an action on success', () => {
      const serviceResponse = USERS;
      const action = loadUserAccountList();
      const outcome = loadUserAccountListSuccess({ users: USERS });

      actions$ = hot('-a', { a: action });
      userService.loadUserAccounts.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadUserAccountList$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadUserAccountList();
      const outcome = loadUserAccountListFailure();

      actions$ = hot('-a', { a: action });
      userService.loadUserAccounts.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadUserAccountList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadUserAccountList();
      const outcome = loadUserAccountListFailure();

      actions$ = hot('-a', { a: action });
      userService.loadUserAccounts.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadUserAccountList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('creating a user account', () => {
    it('fires an action on success', () => {
      const serviceResponse = USERS;
      const action = saveUserAccount({
        id: null,
        email: USER.email,
        password: PASSWORD,
        admin: false
      });
      const outcome = saveUserAccountSuccess({ users: USERS });

      actions$ = hot('-a', { a: action });
      userService.saveUserAccount
        .withArgs({
          id: null,
          email: USER.email,
          password: PASSWORD,
          admin: false
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveUserAccount$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveUserAccount({
        id: null,
        email: USER.email,
        password: PASSWORD,
        admin: false
      });
      const outcome = saveUserAccountFailure();

      actions$ = hot('-a', { a: action });
      userService.saveUserAccount
        .withArgs({
          id: null,
          email: USER.email,
          password: PASSWORD,
          admin: false
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveUserAccount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = saveUserAccount({
        id: null,
        email: USER.email,
        password: PASSWORD,
        admin: false
      });
      const outcome = saveUserAccountFailure();

      actions$ = hot('-a', { a: action });
      userService.saveUserAccount
        .withArgs({
          id: null,
          email: USER.email,
          password: PASSWORD,
          admin: false
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.saveUserAccount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('updating a user account', () => {
    it('fires an action on success', () => {
      const serviceResponse = USERS;
      const action = saveUserAccount({
        id: USER.comixedUserId,
        email: USER.email,
        password: PASSWORD,
        admin: false
      });
      const outcome = saveUserAccountSuccess({ users: USERS });

      actions$ = hot('-a', { a: action });
      userService.saveUserAccount
        .withArgs({
          id: USER.comixedUserId,
          email: USER.email,
          password: PASSWORD,
          admin: false
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveUserAccount$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveUserAccount({
        id: USER.comixedUserId,
        email: USER.email,
        password: PASSWORD,
        admin: false
      });
      const outcome = saveUserAccountFailure();

      actions$ = hot('-a', { a: action });
      userService.saveUserAccount
        .withArgs({
          id: USER.comixedUserId,
          email: USER.email,
          password: PASSWORD,
          admin: false
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveUserAccount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = saveUserAccount({
        id: USER.comixedUserId,
        email: USER.email,
        password: PASSWORD,
        admin: false
      });
      const outcome = saveUserAccountFailure();

      actions$ = hot('-a', { a: action });
      userService.saveUserAccount
        .withArgs({
          id: USER.comixedUserId,
          email: USER.email,
          password: PASSWORD,
          admin: false
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.saveUserAccount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('deleting a user account', () => {
    it('fires an action on success', () => {
      const serviceResponse = USERS;
      const action = deleteUserAccount({
        id: USER.comixedUserId,
        email: USER.email
      });
      const outcome1 = deleteUserAccountSuccess({ users: USERS });
      const outcome2 = loadUserAccountList();
      const outcome3 = setCurrentUser({ user: null });

      actions$ = hot('-a', { a: action });
      userService.deleteUserAccount
        .withArgs({ id: USER.comixedUserId })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-(bcd)', { b: outcome1, c: outcome2, d: outcome3 });
      expect(effects.deleteUserAccount$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = deleteUserAccount({
        id: USER.comixedUserId,
        email: USER.email
      });
      const outcome = deleteUserAccountFailure();

      actions$ = hot('-a', { a: action });
      userService.deleteUserAccount
        .withArgs({ id: USER.comixedUserId })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteUserAccount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = deleteUserAccount({
        id: USER.comixedUserId,
        email: USER.email
      });
      const outcome = deleteUserAccountFailure();

      actions$ = hot('-a', { a: action });
      userService.deleteUserAccount
        .withArgs({ id: USER.comixedUserId })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deleteUserAccount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
