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
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AuthenticationService } from '@app/user/services/authentication-service';
import { TokenService } from '@app/user/services/token-service';
import { LoginResponse } from '@app/user/models/net/login-response';
import { catchError, of } from 'rxjs';
import {
  loadCurrentUser,
  loadCurrentUserFailure,
  loadCurrentUserSuccess,
  login,
  loginFailure,
  loginSuccess
} from '@app/user/actions/authentication.actions';
import { User } from '@app/user/models/user';

@Injectable()
export class AuthenticationEffects {
  logger = inject(LoggerService);
  actions$ = inject(Actions);
  authenticationService = inject(AuthenticationService);
  tokenService = inject(TokenService);

  loadCurrentUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadCurrentUser),
      tap(() => this.logger.trace('Loading current user')),
      switchMap(() =>
        this.authenticationService.loadCurrentUser().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: User) => loadCurrentUserSuccess({ user: response })),
          catchError(error => {
            this.logger.error('Service failure', error);
            return of(loadCurrentUserFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure', error);
        return of(loadCurrentUserFailure());
      })
    );
  });

  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(login),
      tap(() => this.logger.trace('Authenticating user')),
      switchMap(action =>
        this.authenticationService
          .login({ email: action.email, password: action.password })
          .pipe(
            tap(response => this.logger.trace('Response received:', response)),
            tap((response: LoginResponse) =>
              this.tokenService.setAuthToken(response.token)
            ),
            mergeMap(() => [loginSuccess(), loadCurrentUser()]),
            catchError(error => {
              this.logger.error('Service failure', error);
              return of(loginFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure', error);
        return of(loginFailure());
      })
    );
  });
}
