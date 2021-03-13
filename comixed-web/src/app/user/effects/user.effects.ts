/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { LoggerService } from '@angular-ru/logger';
import {
  currentUserLoaded,
  loadCurrentUser,
  loadCurrentUserFailed,
  loginUser,
  loginUserFailed,
  logoutUser,
  saveUserPreference,
  saveUserPreferenceFailed,
  userLoggedIn,
  userLoggedOut,
  userPreferenceSaved
} from '@app/user/actions/user.actions';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { UserService } from '@app/user/services/user.service';
import { AlertService, TokenService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LoginResponse } from '@app/user/models/net/login-response';
import { SaveUserPreferenceResponse } from '@app/user/models/net/save-user-preference-response';
import { resetDisplayOptions } from '@app/library/actions/display.actions';
import { startMessaging } from '@app/messaging/actions/messaging.actions';
import { User } from '@app/user';

@Injectable()
export class UserEffects {
  loadCurrentUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadCurrentUser),
      tap(action => this.logger.debug('Effect: loading current user:', action)),
      switchMap(action =>
        this.userService.loadCurrentUser().pipe(
          tap(response => this.logger.debug('Received response:', response)),
          mergeMap((response: User) => [
            currentUserLoaded({ user: response }),
            resetDisplayOptions({ user: response })
          ]),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'user.load-current-user.effect-failure'
              )
            );
            return of(loadCurrentUserFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadCurrentUserFailed());
      })
    );
  });

  loginUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loginUser),
      tap(action => this.logger.debug('Effect: logging in user:', action)),
      switchMap(action =>
        this.userService
          .loginUser({ email: action.email, password: action.password })
          .pipe(
            tap(response => this.logger.debug('Received response:', response)),
            tap((response: LoginResponse) =>
              this.tokenService.setAuthToken(response.token)
            ),
            mergeMap((response: LoginResponse) => [
              userLoggedIn(),
              startMessaging()
            ]),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.tokenService.clearAuthToken();
              this.alertService.error(
                this.translateService.instant('user.login-user.effect-failure')
              );
              return of(loginUserFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.tokenService.clearAuthToken();
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loginUserFailed());
      })
    );
  });
  logoutUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(logoutUser),
      tap(action => this.logger.debug('Effect: logout out user:', action)),
      mergeMap(() => {
        this.tokenService.clearAuthToken();
        return [userLoggedOut(), resetDisplayOptions({})];
      })
    );
  });

  saveUserPreference$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(saveUserPreference),
      tap(action => this.logger.debug('Effect: save user preference:', action)),
      mergeMap(action =>
        this.userService
          .saveUserPreference({ name: action.name, value: action.value })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: SaveUserPreferenceResponse) =>
              userPreferenceSaved({ user: response.user })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              return of(saveUserPreferenceFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        return of(saveUserPreferenceFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private userService: UserService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private tokenService: TokenService
  ) {}
}
