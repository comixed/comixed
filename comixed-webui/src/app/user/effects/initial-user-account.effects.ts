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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import {
  createAdminAccount,
  createAdminAccountFailure,
  createAdminAccountSuccess,
  loadInitialUserAccount,
  loadInitialUserAccountFailure,
  loadInitialUserAccountSuccess
} from '../actions/initial-user-account.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { UserService } from '@app/user/services/user.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { CheckForAdminResponse } from '@app/user/models/net/check-for-admin-response';
import { of } from 'rxjs';

@Injectable()
export class InitialUserAccountEffects {
  checkAdminAccount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadInitialUserAccount),
      tap(() => this.logger.debug('Checking for existing user accounts')),
      switchMap(() =>
        this.userService.checkForAdminAccount().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: CheckForAdminResponse) =>
            loadInitialUserAccountSuccess({ hasExisting: response.hasExisting })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant('initial-account.effect-failure')
            );
            return of(loadInitialUserAccountFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadInitialUserAccountFailure());
      })
    );
  });

  createAdminAccount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createAdminAccount),
      tap(action => this.logger.trace('Creating admin account:', action)),
      switchMap(action =>
        this.userService
          .createAdminAccount({
            email: action.email,
            password: action.password
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'create-admin-account.effect-success',
                  { email: action.email }
                )
              )
            ),
            mergeMap(() => [
              createAdminAccountSuccess(),
              loadInitialUserAccount()
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'create-admin-account.effect-failure',
                  { email: action.email }
                )
              );
              return of(createAdminAccountFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(createAdminAccountFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private userService: UserService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
