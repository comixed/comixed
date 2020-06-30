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
import { LoginResponse } from 'app/models/net/login-response';
import { User } from 'app/user';
import { AuthenticationService } from 'app/user/services/authentication.service';
import { TokenService } from 'app/user/services/token.service';
import { LoggerService } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';

import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import * as AuthenticationActions from '../actions/authentication.actions';
import {
  AuthCheckState,
  AuthenticationActionTypes,
  AuthHideLogin,
  AuthNoUserLoaded,
  AuthPreferenceSet,
  AuthSetPreference,
  AuthSetPreferenceFailed,
  AuthSetToken,
  AuthSubmitLogin
} from '../actions/authentication.actions';
import { Router } from '@angular/router';

@Injectable()
export class AuthenticationEffects {
  constructor(
    private actions$: Actions,
    private logger: LoggerService,
    private authenticationService: AuthenticationService,
    private tokenService: TokenService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private router: Router
  ) {}

  @Effect()
  getAuthenticatedUser$: Observable<Action> = this.actions$.pipe(
    ofType(AuthenticationActionTypes.AUTH_CHECK_STATE),
    tap(action =>
      this.logger.debug('effect: getting authenticated user:', action)
    ),
    switchMap(action =>
      this.authenticationService.getAuthenticatedUser().pipe(
        tap(response =>
          this.logger.debug('getting authenticated user response:', response)
        ),
        map((response: User) =>
          !!response
            ? new AuthenticationActions.AuthUserLoaded({ user: response })
            : new AuthNoUserLoaded()
        ),
        catchError(error => {
          this.logger.error(
            'service failure getting authenticated user:',
            error
          );
          return of(new AuthNoUserLoaded());
        })
      )
    ),
    catchError(error => {
      this.logger.error('general failure getting authenticated user:', error);
      return of(new AuthNoUserLoaded());
    })
  );

  @Effect()
  submitLoginData$: Observable<Action> = this.actions$.pipe(
    ofType(AuthenticationActionTypes.AUTH_SUBMIT_LOGIN),
    map((action: AuthSubmitLogin) => action.payload),
    tap(action => this.logger.debug('effect: submit login data:', action)),
    switchMap(action =>
      this.authenticationService
        .submitLoginData(action.email, action.password)
        .pipe(
          tap(data => this.tokenService.saveToken(data.token)),
          tap(response =>
            this.logger.debug('submit login data response:', response)
          ),
          tap(() =>
            this.messageService.add({
              severity: 'info',
              detail: this.translateService.instant(
                'authentication-effects.submit-login-data.success.detail'
              )
            })
          ),
          switchMap((response: LoginResponse) => [
            new AuthCheckState(),
            new AuthSetToken({ token: response.token }),
            new AuthHideLogin()
          ]),
          catchError(error => {
            this.logger.error('service failure submitting login data:', error);
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(
                'authentication-effects.submit-login-data.failure.detail'
              )
            });
            return of(new AuthNoUserLoaded());
          })
        )
    ),
    catchError((error: Error) => {
      this.logger.error('general failure submitting login data:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'authentication-effects.submit-login-data.failure.detail'
        )
      });
      return of(new AuthNoUserLoaded());
    })
  );

  @Effect()
  logout$: Observable<Action> = this.actions$.pipe(
    ofType(AuthenticationActionTypes.AUTH_LOGOUT),
    tap(action => this.logger.debug('effect: logging out:', action)),
    tap(() => this.tokenService.signout()),
    tap(() => this.router.navigateByUrl('/')),
    tap(() =>
      this.messageService.add({
        severity: 'info',
        detail: this.translateService.instant(
          'authentication-effects.logout.detail'
        )
      })
    ),
    map(() => new AuthCheckState())
  );

  @Effect()
  authenticationFailed$: Observable<Action> = this.actions$.pipe(
    ofType(AuthenticationActionTypes.AUTH_LOGIN_FAILED),
    tap(action => this.logger.debug('effect: logging failed:', action)),
    tap(() => this.tokenService.signout()),
    tap(() =>
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'authentication-effects.submit-login-data.failure.detail'
        )
      })
    ),
    map(() => new AuthCheckState())
  );

  @Effect()
  setPreference$: Observable<Action> = this.actions$.pipe(
    ofType(AuthenticationActionTypes.AUTH_SET_PREFERENCE),
    map((action: AuthSetPreference) => action.payload),
    tap(action =>
      this.logger.debug('effect: setting user preference:', action)
    ),
    mergeMap(action =>
      this.authenticationService.setPreference(action.name, action.value).pipe(
        tap(response =>
          this.logger.debug('setting user preference response:', response)
        ),
        map((response: User) => new AuthPreferenceSet({ user: response })),
        catchError(error => {
          this.logger.error('service failure setting user preference:', error);
          return of(new AuthSetPreferenceFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('service failure setting user preference:', error);
      return of(new AuthSetPreferenceFailed());
    })
  );
}
