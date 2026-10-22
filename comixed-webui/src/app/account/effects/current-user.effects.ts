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
import { CurrentUserActions } from '../actions/current-user.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { AccountService } from '@app/account/services/account-service';
import { TokenService } from '@app/account/services/token-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CurrentUserEffects {
  readonly logger = inject(LoggerService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  readonly accountService = inject(AccountService);
  readonly tokenService = inject(TokenService);
  private actions$ = inject(Actions);

  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CurrentUserActions.login),
      tap(() => this.logger.trace('Logging in')),
      switchMap(action =>
        this.accountService
          .login({ email: action.email, password: action.password })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(response => this.tokenService.setAuthToken(response.token)),
            mergeMap(() => [
              CurrentUserActions.loginSuccess(),
              CurrentUserActions.load()
            ]),
            catchError(error => {
              this.logger.error('Service error:', error);
              this.alertService.error(
                this.translateService.instant(
                  'current-user-effect.login.service-failure'
                )
              );
              return of(CurrentUserActions.loginFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General error:', error);
        this.alertService.error(
          this.translateService.instant('app.effect.general-failure')
        );
        return of(CurrentUserActions.loginFailure());
      })
    );
  });

  loadCurrentUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CurrentUserActions.load),
      tap(() => this.logger.trace('Loading current user')),
      switchMap(() =>
        this.accountService.loadCurrentUser().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response => CurrentUserActions.loadSuccess({ user: response })),
          catchError(error => {
            this.logger.debug('Service error:', error);
            this.alertService.error(
              this.translateService.instant(
                'current-user-effect.load-current-user.service-failure'
              )
            );
            return of(CurrentUserActions.loadFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.debug('General error:', error);
        this.alertService.error(
          this.translateService.instant('app.effect.general-failure')
        );
        return of(CurrentUserActions.loadFailure());
      })
    );
  });
}
