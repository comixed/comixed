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

import {
  UserAdminActions,
  UserAdminActionTypes
} from '../actions/user-admin.actions';
import { User } from 'app/user';

export const USER_ADMIN_FEATURE_KEY = 'user_admin_state';

export const NEW_USER: User = {
  email: undefined,
  first_login_date: undefined,
  id: undefined,
  last_login_date: undefined,
  preferences: [],
  roles: []
};

export interface UserAdminState {
  fetchingAll: boolean;
  users: User[];
  current: User;
  saved: boolean;
  saving: boolean;
  deleting: boolean;
}

export const initialState: UserAdminState = {
  fetchingAll: false,
  users: [],
  current: null,
  saved: false,
  saving: false,
  deleting: false
};

export function reducer(
  state = initialState,
  action: UserAdminActions
): UserAdminState {
  switch (action.type) {
    case UserAdminActionTypes.GetAll:
      return { ...state, fetchingAll: true };

    case UserAdminActionTypes.AllReceived:
      return { ...state, fetchingAll: false, users: action.payload.users };

    case UserAdminActionTypes.GetAllFailed:
      return { ...state, fetchingAll: false };

    case UserAdminActionTypes.NewUser:
      return { ...state, current: NEW_USER };

    case UserAdminActionTypes.SetCurrent:
      return { ...state, current: action.payload.user };

    case UserAdminActionTypes.ClearCurrent:
      return { ...state, current: null };

    case UserAdminActionTypes.Save:
      return { ...state, saving: true };

    case UserAdminActionTypes.Saved: {
      const users = state.users.filter(
        user => user.id !== action.payload.user.id
      );
      users.push(action.payload.user);
      return {
        ...state,
        saving: false,
        saved: true,
        current: action.payload.user,
        users: users
      };
    }

    case UserAdminActionTypes.SaveFailed:
      return { ...state, saving: false, saved: false };

    case UserAdminActionTypes.Delete:
      return { ...state, deleting: true };

    case UserAdminActionTypes.Deleted:
      return {
        ...state,
        deleting: false,
        users: state.users.filter(user => user.id !== action.payload.user.id)
      };

    case UserAdminActionTypes.DeleteFailed:
      return { ...state, deleting: false };

    default:
      return state;
  }
}
