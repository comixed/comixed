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

import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Action } from "@ngrx/store";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { of, Observable } from "rxjs";
import * as UserAdminActions from "../actions/user-admin.actions";
import { UserService } from "../services/user.service";
import { AlertService } from "../services/alert.service";
import { User } from "../models/user/user";

@Injectable()
export class UserAdminEffects {
  constructor(
    private actions$: Actions,
    private user_service: UserService,
    private alert_service: AlertService
  ) {}

  @Effect()
  user_admin_list_users$: Observable<Action> = this.actions$.pipe(
    ofType(UserAdminActions.USER_ADMIN_LIST_USERS),
    switchMap(action =>
      this.user_service.get_user_list().pipe(
        map(
          (users: Array<User>) =>
            new UserAdminActions.UserAdminUsersReceived({
              users: users
            })
        )
      )
    )
  );

  @Effect()
  user_admin_save_user$: Observable<Action> = this.actions$.pipe(
    ofType(UserAdminActions.USER_ADMIN_SAVE_USER),
    map((action: UserAdminActions.UserAdminSaveUser) => action.payload),
    switchMap(action =>
      this.user_service
        .save_user(action.id, action.email, action.password, action.is_admin)
        .pipe(
          tap(() =>
            this.alert_service.show_info_message(
              `${action.email} has been created...`
            )
          ),
          catchError((error: Error) =>
            of(
              this.alert_service.show_error_message(
                `Failed to create ${action.email}`,
                error
              )
            )
          ),
          map(
            (user: User) =>
              new UserAdminActions.UserAdminUserSaved({
                user: user
              })
          )
        )
    )
  );

  @Effect()
  user_admin_delete_user$: Observable<Action> = this.actions$.pipe(
    ofType(UserAdminActions.USER_ADMIN_DELETE_USER),
    map((action: UserAdminActions.UserAdminDeleteUser) => action.payload),
    switchMap(action =>
      this.user_service.delete_user(action.user.id).pipe(
        tap(() =>
          this.alert_service.show_info_message(
            `${action.user.email} has been deleted...`
          )
        ),
        catchError((error: Error) =>
          of(
            this.alert_service.show_error_message(
              `Failed to delete ${action.user.email}`,
              error
            )
          )
        ),
        map(
          (success: boolean) =>
            new UserAdminActions.UserAdminUserDeleted({
              user: action.user,
              success: success
            })
        )
      )
    )
  );
}
