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
import { SaveUserDetails } from 'app/user/models/save-user-details';

export enum UserAdminActionTypes {
  GetAll = '[USER ADMIN] Get all users',
  AllReceived = '[USER ADMIN] All users received',
  GetAllFailed = '[USER ADMIN] Get all users failed',
  NewUser = '[USER ADMIN] Create a new user',
  SetCurrent = '[USER ADMIN] Set the current user',
  ClearCurrent = '[USER ADMIN] Clears the current user',
  Save = '[USER ADMIN] Save user',
  Saved = '[USER ADMIN] User saved',
  SaveFailed = '[USER ADMIN] Failed to save user',
  Delete = '[USER ADMIN] Delete user',
  Deleted = '[USER ADMIN] User deleted',
  DeleteFailed = '[USER ADMIN] Failed to delete user'
}

export class UserAdminGetAll implements Action {
  readonly type = UserAdminActionTypes.GetAll;

  constructor() {}
}

export class UserAdminAllReceived implements Action {
  readonly type = UserAdminActionTypes.AllReceived;

  constructor(public payload: { users: User[] }) {}
}

export class UserAdminGetAllFailed implements Action {
  readonly type = UserAdminActionTypes.GetAllFailed;

  constructor() {}
}

export class UserAdminCreateNew implements Action {
  readonly type = UserAdminActionTypes.NewUser;

  constructor() {}
}

export class UserAdminSetCurrent implements Action {
  readonly type = UserAdminActionTypes.SetCurrent;

  constructor(public payload: { user: User }) {}
}

export class UserAdminClearCurrent implements Action {
  readonly type = UserAdminActionTypes.ClearCurrent;

  constructor() {}
}

export class UserAdminSave implements Action {
  readonly type = UserAdminActionTypes.Save;

  constructor(public payload: { details: SaveUserDetails }) {}
}

export class UserAdminSaved implements Action {
  readonly type = UserAdminActionTypes.Saved;

  constructor(public payload: { user: User }) {}
}

export class UserAdminSaveFailed implements Action {
  readonly type = UserAdminActionTypes.SaveFailed;

  constructor() {}
}

export class UserAdminDeleteUser implements Action {
  readonly type = UserAdminActionTypes.Delete;

  constructor(public payload: { user: User }) {}
}

export class UserAdminDeletedUser implements Action {
  readonly type = UserAdminActionTypes.Deleted;

  constructor(public payload: { user: User }) {}
}

export class UserAdminDeleteUserFailed implements Action {
  readonly type = UserAdminActionTypes.DeleteFailed;

  constructor() {}
}

export type UserAdminActions =
  | UserAdminGetAll
  | UserAdminAllReceived
  | UserAdminGetAllFailed
  | UserAdminCreateNew
  | UserAdminSetCurrent
  | UserAdminClearCurrent
  | UserAdminSave
  | UserAdminSaved
  | UserAdminSaveFailed
  | UserAdminDeleteUser
  | UserAdminDeletedUser
  | UserAdminDeleteUserFailed;
