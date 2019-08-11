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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { catchError, concatMap, map, switchMap, tap } from 'rxjs/operators';
import { EMPTY, Observable, of } from 'rxjs';
import { AuthenticationActionTypes } from '../actions/authentication.actions';
import * as AuthenticationActions from '../actions/authentication.actions';
import { AuthenticationService } from 'app/user/services/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Action } from '@ngrx/store';
import { LoginResponse } from 'app/models/net/login-response';
import { TokenService } from 'app/user/services/token.service';
import { User } from 'app/user';

@Injectable()
export class AuthenticationEffects {
  constructor(
    private actions$: Actions,
    private auth_service: AuthenticationService,
    private token_service: TokenService,
    private translate_service: TranslateService,
    private message_service: MessageService,
    private router: Router
  ) {}

  @Effect()
  get_authenticated_user$: Observable<Action> = this.actions$.pipe(
    ofType(AuthenticationActionTypes.AUTH_CHECK_STATE),
    switchMap(action =>
      this.auth_service.get_authenticated_user().pipe(
        map((response: User) => {
          if (!!response) {
            return new AuthenticationActions.AuthUserLoaded({
              user: response
            });
          } else {
            this.router.navigate(['home']);
            return new AuthenticationActions.AuthNoUserLoaded();
          }
        }),
        catchError(error => of(new AuthenticationActions.AuthNoUserLoaded()))
      )
    ),
    catchError(error => of(new AuthenticationActions.AuthNoUserLoaded()))
  );

  @Effect()
  submit_login_data$: Observable<Action> = this.actions$.pipe(
    ofType(AuthenticationActionTypes.AUTH_SUBMIT_LOGIN),
    map((action: AuthenticationActions.AuthSubmitLogin) => action.payload),
    switchMap(action =>
      this.auth_service.submit_login_data(action.email, action.password).pipe(
        tap(data => this.token_service.save_token(data.token)),
        tap(() =>
          this.message_service.add({
            severity: 'info',
            detail: this.translate_service.instant(
              'authentication-effects.submit-login-data.success.detail'
            )
          })
        ),
        switchMap((response: LoginResponse) => [
          new AuthenticationActions.AuthCheckState(),
          new AuthenticationActions.AuthSetToken({ token: response.token }),
          new AuthenticationActions.AuthHideLogin()
        ]),
        catchError(error => {
          this.message_service.add({
            severity: 'error',
            detail: this.translate_service.instant(
              'authentication-effects.submit-login-data.failure.detail'
            )
          });
          return of(new AuthenticationActions.AuthNoUserLoaded());
        })
      )
    ),
    catchError((error: Error) => {
      this.message_service.add({
        severity: 'error',
        detail: this.translate_service.instant(
          'authentication-effects.submit-login-data.failure.detail'
        )
      });
      return of(new AuthenticationActions.AuthNoUserLoaded());
    })
  );

  @Effect()
  logout$: Observable<Action> = this.actions$.pipe(
    ofType(AuthenticationActionTypes.AUTH_LOGOUT),
    tap(() => this.token_service.sign_out()),
    tap(() =>
      this.message_service.add({
        severity: 'info',
        detail: this.translate_service.instant(
          'authentication-effects.logout.detail'
        )
      })
    ),
    map(() => new AuthenticationActions.AuthCheckState())
  );

  @Effect()
  set_preference$: Observable<Action> = this.actions$.pipe(
    ofType(AuthenticationActionTypes.AUTH_SET_PREFERENCE),
    map((action: AuthenticationActions.AuthSetPreference) => action.payload),
    switchMap(action =>
      this.auth_service.set_preference(action.name, action.value).pipe(
        map(
          (response: User) =>
            new AuthenticationActions.AuthPreferenceSet({ user: response })
        ),
        catchError(error =>
          of(new AuthenticationActions.AuthSetPreferenceFailed())
        )
      )
    ),
    catchError(error => of(new AuthenticationActions.AuthSetPreferenceFailed()))
  );
}
