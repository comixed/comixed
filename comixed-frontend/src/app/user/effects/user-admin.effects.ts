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

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'app/user';
import { UserAdminService } from 'app/user/services/user-admin.service';
import { NGXLogger } from 'ngx-logger';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';

import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  UserAdminActions,
  UserAdminActionTypes,
  UserAdminAllReceived,
  UserAdminDeletedUser,
  UserAdminDeleteUserFailed,
  UserAdminGetAllFailed,
  UserAdminSaved,
  UserAdminSaveFailed
} from '../actions/user-admin.actions';

@Injectable()
export class UserAdminEffects {
  constructor(
    private logger: NGXLogger,
    private actions$: Actions<UserAdminActions>,
    private userAdminService: UserAdminService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  @Effect()
  getAll$: Observable<Action> = this.actions$.pipe(
    ofType(UserAdminActionTypes.GetAll),
    tap(() => this.logger.debug('effect: get all users')),
    switchMap(action =>
      this.userAdminService.getAll().pipe(
        tap(response => this.logger.debug('received response:', response)),
        map(
          (response: User[]) => new UserAdminAllReceived({ users: response })
        ),
        catchError(error => {
          this.logger.error('service failure error getting all users:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'user-admin-effects.get-all.error.detail'
            )
          });
          return of(new UserAdminGetAllFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('general failure error getting all users:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failed'
        )
      });
      return of(new UserAdminGetAllFailed());
    })
  );

  @Effect()
  save$: Observable<Action> = this.actions$.pipe(
    ofType(UserAdminActionTypes.Save),
    map(action => action.payload),
    tap(action => this.logger.debug('effect: saving user:', action)),
    switchMap(action =>
      this.userAdminService.save(action.details).pipe(
        tap(response => this.logger.debug('received response:', response)),
        tap((response: User) =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'user-admin-effects.save.success.detail',
              { email: response.email }
            )
          })
        ),
        map((response: User) => new UserAdminSaved({ user: response })),
        catchError(error => {
          this.logger.error('service failure error saving user:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'user-admin-effects.save.error.detail',
              { update: !!action.details.id }
            )
          });
          return of(new UserAdminSaveFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('general failure error saving user:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failed'
        )
      });
      return of(new UserAdminSaveFailed());
    })
  );

  @Effect()
  deleteUser$: Observable<Action> = this.actions$.pipe(
    ofType(UserAdminActionTypes.Delete),
    map(action => action.payload),
    tap(action => this.logger.debug('effect: delete user:', action)),
    switchMap(action =>
      this.userAdminService.deleteUser(action.user).pipe(
        tap(response => this.logger.debug('received response:', response)),
        tap(() =>
          this.messageService.add({
            severity: 'info',
            detail: this.translateService.instant(
              'user-admin-effects.delete-user.success.detail',
              { email: action.user.email }
            )
          })
        ),
        map(() => new UserAdminDeletedUser({ user: action.user })),
        catchError(error => {
          this.logger.error('service failure error deleting user:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'user-admin-effects.delete-user.error.detail'
            )
          });
          return of(new UserAdminDeleteUserFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('general failure error deleting user:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failed'
        )
      });
      return of(new UserAdminDeleteUserFailed());
    })
  );
}
