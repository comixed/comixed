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
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import {
  loadCurrentUser,
  loadCurrentUserFailure,
  loadCurrentUserSuccess,
  login,
  loginFailure,
  loginSuccess
} from '../actions/current-user.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AccountService } from '@app/account/services/account-service';
import { TokenService } from '@app/account/services/token-service';

@Injectable()
export class CurrentUserEffects {
  readonly logger = inject(LoggerService);
  readonly accountService = inject(AccountService);
  readonly tokenService = inject(TokenService);
  private actions$ = inject(Actions);

  loadCurrentUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadCurrentUser),
      tap(() => this.logger.trace('Loading current user')),
      switchMap(() =>
        this.accountService.loadCurrentUser().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response => loadCurrentUserSuccess({ user: response })),
          catchError(error => {
            this.logger.debug('Service error:', error);
            return of(loadCurrentUserFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.debug('General error:', error);
        return of(loadCurrentUserFailure());
      })
    );
  });

  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(login),
      tap(() => this.logger.trace('Logging in')),
      switchMap(action =>
        this.accountService
          .login({ email: action.email, password: action.password })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(response => this.tokenService.setAuthToken(response.token)),
            mergeMap(() => [loginSuccess(), loadCurrentUser()]),
            catchError(error => {
              this.logger.error('Service error:', error);
              return of(loginFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General error:', error);
        return of(loginFailure());
      })
    );
  });
}
