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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
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
} from '../actions/manage-users.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { UserService } from '@app/user/services/user.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { User } from '@app/user/models/user';

@Injectable()
export class ManageUsersEffects {
  logger = inject(LoggerService);
  actions$ = inject(Actions);
  userService = inject(UserService);
  alertService = inject(AlertService);
  translateService = inject(TranslateService);

  loadUserAccountList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadUserAccountList),
      tap(() => this.logger.trace('Loading the user account list')),
      switchMap(() =>
        this.userService.loadUserAccounts().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: User[]) =>
            loadUserAccountListSuccess({ users: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'manage-users.load-user-list.effect-failure'
              )
            );
            return of(loadUserAccountListFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadUserAccountListFailure());
      })
    );
  });
  saveUserAccount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(saveUserAccount),
      tap(action => this.logger.trace('Saving user account:', action)),
      switchMap(action =>
        this.userService
          .saveUserAccount({
            id: action.id,
            email: action.email,
            password: action.password,
            admin: action.admin
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'manage-users.save-user-account.effect-success',
                  { email: action.email }
                )
              )
            ),
            map((response: User[]) =>
              saveUserAccountSuccess({ users: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'manage-users.save-user-account.effect-failure',
                  { email: action.email }
                )
              );
              return of(saveUserAccountFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(saveUserAccountFailure());
      })
    );
  });
  deleteUserAccount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteUserAccount),
      tap(action => this.logger.trace('Deleting user account:', action)),
      switchMap(action =>
        this.userService.deleteUserAccount({ id: action.id }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'manage-users.delete-user-account.effect-success',
                { email: action.email }
              )
            )
          ),
          mergeMap((response: User[]) => [
            deleteUserAccountSuccess({ users: response }),
            loadUserAccountList(),
            setCurrentUser({ user: null })
          ]),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'manage-users.delete-user-account.effect-failure',
                { email: action.email }
              )
            );
            return of(deleteUserAccountFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(deleteUserAccountFailure());
      })
    );
  });
}
