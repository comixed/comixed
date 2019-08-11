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

import { Action } from '@ngrx/store';
import { User } from 'app/user';

export const USER_ADMIN_LIST_USERS = '[USER ADMIN] Get a list of all users';
export const USER_USER_ADMINS_RECEIVED =
  '[USER ADMIN] Received list of all users';
export const USER_ADMIN_CREATE_USER = '[USER ADMIN] Create a new user';
export const USER_ADMIN_EDIT_USER = '[USER ADMIN] Begin editing user';
export const USER_ADMIN_SAVE_USER = '[USER ADMIN] Save the user';
export const USER_USER_ADMIN_SAVED = '[USER ADMIN] User saved';
export const USER_ADMIN_DELETE_USER = '[USER ADMIN] Delete user';
export const USER_USER_ADMIN_DELETED = '[USER ADMIN] User deleted';

export class UserAdminListUsers implements Action {
  readonly type = USER_ADMIN_LIST_USERS;

  constructor() {}
}

export class UserAdminUsersReceived implements Action {
  readonly type = USER_USER_ADMINS_RECEIVED;

  constructor(
    public payload: {
      users: User[];
    }
  ) {}
}

export class UserAdminCreateUser implements Action {
  readonly type = USER_ADMIN_CREATE_USER;

  constructor() {}
}

export class UserAdminEditUser implements Action {
  readonly type = USER_ADMIN_EDIT_USER;

  constructor(
    public payload: {
      user: User;
    }
  ) {}
}

export class UserAdminSaveUser implements Action {
  readonly type = USER_ADMIN_SAVE_USER;

  constructor(
    public payload: {
      id: number;
      email: string;
      password: string;
      is_admin: boolean;
    }
  ) {}
}

export class UserAdminUserSaved implements Action {
  readonly type = USER_USER_ADMIN_SAVED;

  constructor(public payload: { user: User }) {}
}

export class UserAdminDeleteUser implements Action {
  readonly type = USER_ADMIN_DELETE_USER;

  constructor(public payload: { user: User }) {}
}

export class UserAdminUserDeleted implements Action {
  readonly type = USER_USER_ADMIN_DELETED;

  constructor(public payload: { user: User; success: boolean }) {}
}

export type Actions =
  | UserAdminListUsers
  | UserAdminUsersReceived
  | UserAdminCreateUser
  | UserAdminEditUser
  | UserAdminSaveUser
  | UserAdminUserSaved
  | UserAdminDeleteUser
  | UserAdminUserDeleted;
