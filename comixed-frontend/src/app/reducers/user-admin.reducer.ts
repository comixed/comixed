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

import { UserAdmin } from 'app/models/actions/user-admin';
import * as UserAdminActions from 'app/actions/user-admin.actions';
import { User } from 'app/models/user/user';

const initial_state: UserAdmin = {
  busy: false,
  users: [],
  current_user: null
};

export function userAdminReducer(
  state: UserAdmin = initial_state,
  action: UserAdminActions.Actions
) {
  switch (action.type) {
    case UserAdminActions.USER_ADMIN_LIST_USERS:
      return {
        ...state,
        busy: true
      };

    case UserAdminActions.USER_ADMIN_USERS_RECEIVED:
      return {
        ...state,
        busy: false,
        users: action.payload.users
      };

    case UserAdminActions.USER_ADMIN_CREATE_USER:
      return {
        ...state,
        current_user: {}
      };

    case UserAdminActions.USER_ADMIN_EDIT_USER:
      return {
        ...state,
        current_user: action.payload.user
      };

    case UserAdminActions.USER_ADMIN_SAVE_USER:
      return {
        ...state,
        busy: true
      };

    case UserAdminActions.USER_ADMIN_USER_SAVED: {
      const users = state.users.filter((user: User) => {
        return user.id !== action.payload.user.id;
      });
      users.push(action.payload.user);
      return {
        ...state,
        busy: false,
        users: users,
        current_user: null
      };
    }

    case UserAdminActions.USER_ADMIN_DELETE_USER:
      return {
        ...state,
        busy: true
      };

    case UserAdminActions.USER_ADMIN_USER_DELETED: {
      if (action.payload.success) {
        state.users = state.users.filter((user: User) => {
          return user.id !== action.payload.user.id;
        });
      }
      return {
        ...state,
        busy: false
      };
    }

    default:
      return state;
  }
}
