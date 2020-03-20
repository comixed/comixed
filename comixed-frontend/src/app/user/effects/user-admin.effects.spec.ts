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

import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { TranslateModule } from '@ngx-translate/core';
import { USER_ADMIN, USER_READER } from 'app/user';
import {
  UserAdminAllReceived,
  UserAdminDeletedUser,
  UserAdminDeleteUser,
  UserAdminDeleteUserFailed,
  UserAdminGetAll,
  UserAdminGetAllFailed,
  UserAdminSave,
  UserAdminSaved,
  UserAdminSaveFailed
} from 'app/user/actions/user-admin.actions';
import { SaveUserDetails } from 'app/user/models/save-user-details';
import { UserAdminService } from 'app/user/services/user-admin.service';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';

import { UserAdminEffects } from './user-admin.effects';
import objectContaining = jasmine.objectContaining;

describe('UserAdminEffects', () => {
  const USERS = [USER_READER, USER_ADMIN];
  const USER = USER_READER;

  let actions$: Observable<any>;
  let effects: UserAdminEffects;
  let userAdminService: jasmine.SpyObj<UserAdminService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        UserAdminEffects,
        provideMockActions(() => actions$),
        {
          provide: UserAdminService,
          useValue: {
            getAll: jasmine.createSpy('UserAdminService.getAll'),
            save: jasmine.createSpy('UserAdminService.save'),
            deleteUser: jasmine.createSpy('UserAdminService.deleteUser')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(UserAdminEffects);
    userAdminService = TestBed.get(UserAdminService);
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('when getting all users', () => {
    it('fires an action on success', () => {
      const serviceResponse = USERS;
      const action = new UserAdminGetAll();
      const outcome = new UserAdminAllReceived({ users: USERS });

      actions$ = hot('-a', { a: action });
      userAdminService.getAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getAll$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new UserAdminGetAll();
      const outcome = new UserAdminGetAllFailed();

      actions$ = hot('-a', { a: action });
      userAdminService.getAll.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getAll$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new UserAdminGetAll();
      const outcome = new UserAdminGetAllFailed();

      actions$ = hot('-a', { a: action });
      userAdminService.getAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getAll$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when saving a user', () => {
    const DETAILS: SaveUserDetails = {
      id: USER.id,
      email: USER.email,
      password: '12345678',
      isAdmin: true
    };

    it('fires an action on success', () => {
      const serviceResponse = USER;
      const action = new UserAdminSave({ details: DETAILS });
      const outcome = new UserAdminSaved({ user: USER });

      actions$ = hot('-a', { a: action });
      userAdminService.save.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new UserAdminSave({ details: DETAILS });
      const outcome = new UserAdminSaveFailed();

      actions$ = hot('-a', { a: action });
      userAdminService.save.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new UserAdminSave({ details: DETAILS });
      const outcome = new UserAdminSaveFailed();

      actions$ = hot('-a', { a: action });
      userAdminService.save.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('when deleting a user', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = new UserAdminDeleteUser({ user: USER });
      const outcome = new UserAdminDeletedUser({ user: USER });

      actions$ = hot('-a', { a: action });
      userAdminService.deleteUser.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteUser$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new UserAdminDeleteUser({ user: USER });
      const outcome = new UserAdminDeleteUserFailed();

      actions$ = hot('-a', { a: action });
      userAdminService.deleteUser.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteUser$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new UserAdminDeleteUser({ user: USER });
      const outcome = new UserAdminDeleteUserFailed();

      actions$ = hot('-a', { a: action });
      userAdminService.deleteUser.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deleteUser$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
