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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ExistingAdminAccountActions } from '../actions/existing-admin-account.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AccountService } from '@app/account/services/account-service';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class ExistingAdminAccountEffects {
  readonly logger = inject(LoggerService);
  readonly accountService = inject(AccountService);
  private actions$ = inject(Actions);
  loadExistingAdminAccounts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExistingAdminAccountActions.check),
      tap(() => this.logger.trace('Checking for existing admin accounts')),
      switchMap(() =>
        this.accountService.checkForAdminAccount().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            ExistingAdminAccountActions.checkSuccess({
              exists: response.hasExisting
            })
          ),
          catchError(error => {
            this.logger.error('Service error:', error);
            return of(ExistingAdminAccountActions.checkFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General error:', error);
        return of(ExistingAdminAccountActions.checkFailure());
      })
    );
  });

  createAdminAccount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExistingAdminAccountActions.create),
      tap(() => this.logger.trace('Creating the initial admin account')),
      switchMap(action =>
        this.accountService
          .createAdminAccount({
            email: action.email,
            password: action.password
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => ExistingAdminAccountActions.createSuccess()),
            catchError(error => {
              this.logger.error('Service error:', error);
              return of(ExistingAdminAccountActions.createFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General error:', error);
        return of(ExistingAdminAccountActions.createFailure());
      })
    );
  });
}
