/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import { map, switchMap, tap } from "rxjs/operators";
import { Observable, of as observableOf } from "rxjs";
import * as UserActions from "../actions/user.actions";
import { UserService } from "../services/user.service";
import { User } from "../models/user/user";
import { TokenStorage } from "../storage/token.storage";

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private user_service: UserService,
    private token_storage: TokenStorage
  ) {}

  @Effect()
  user_auth_check$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.USER_AUTH_CHECK),
    switchMap((action: UserActions.UserAuthCheck) =>
      this.user_service.get_user().pipe(
        map(
          (user: User) =>
            new UserActions.UserLoaded({
              user: user
            })
        )
      )
    )
  );

  @Effect()
  user_logging_in$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.USER_LOGGING_IN),
    map((action: UserActions.UserLoggingIn) => action.payload),
    switchMap(action =>
      this.user_service.login(action.email, action.password).pipe(
        tap(data => this.token_storage.save_token(data.token)),
        map(
          data =>
            new UserActions.UserSetAuthToken({
              token: data.token
            })
        )
      )
    )
  );

  @Effect()
  user_logout$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.USER_LOGOUT),
    switchMap((action: UserActions.UserLogout) =>
      observableOf(this.token_storage.sign_out()).pipe(
        map(() => new UserActions.UserAuthCheck())
      )
    )
  );

  @Effect()
  user_set_preference$: Observable<Action> = this.actions$.pipe(
    ofType(UserActions.USER_SET_PREFERENCE),
    map((action: UserActions.UserSetPreference) => action.payload),
    switchMap(action =>
      this.user_service.set_user_preference(action.name, action.value).pipe(
        map(
          () =>
            new UserActions.UserPreferenceSaved({
              name: action.name,
              value: action.value
            })
        )
      )
    )
  );
}
