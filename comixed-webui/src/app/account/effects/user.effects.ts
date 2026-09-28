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
import { LoggerService } from '@angular-ru/cdk/logger';
import { AccountService } from '@app/account/services/account-service';
import { TokenService } from '@app/account/services/token-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { UserActions } from '@app/account/actions/user.actions';

@Injectable()
export class UserEffects {
  readonly logger = inject(LoggerService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  readonly accountService = inject(AccountService);
  readonly tokenService = inject(TokenService);
  private actions$ = inject(Actions);

  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.login),
      tap(() => this.logger.trace('Logging in')),
      switchMap(action =>
        this.accountService
          .login({ email: action.email, password: action.password })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(response => this.tokenService.setAuthToken(response.token)),
            mergeMap(() => [UserActions.loginSuccess(), UserActions.load()]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'user-effects.login.service-failure'
                )
              );
              return of(UserActions.loginFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(UserActions.loginFailure());
      })
    );
  });

  loadUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.load),
      tap(() => this.logger.trace('Loading user')),
      switchMap(() =>
        this.accountService.loadUser().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response => UserActions.loadSuccess({ user: response })),
          catchError(error => {
            this.logger.debug('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'user-effects.load-user.service-failure'
              )
            );
            return of(UserActions.loadFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.debug('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(UserActions.loadFailure());
      })
    );
  });

  savePreference$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UserActions.savePreference),
      tap(action => this.logger.debug('Saving user preference:', action)),
      switchMap(action =>
        this.accountService
          .saveUserPreference({ name: action.name, value: action.value })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(response =>
              UserActions.savePreferenceSuccess({ user: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'user-effects.save-preference.service-failure',
                  { name: action.name }
                )
              );
              return of(UserActions.savePreferenceFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(UserActions.savePreferenceFailure());
      })
    );
  });
}
