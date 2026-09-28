/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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

import { createAction, props } from '@ngrx/store';
import { User } from '@app/user/models/user';

export const loadUserAccountList = createAction(
  '[Manage Users] Load the list of user accounts'
);

export const loadUserAccountListSuccess = createAction(
  '[Manage Users] The user account list was loaded',
  props<{
    users: User[];
  }>()
);

export const loadUserAccountListFailure = createAction(
  '[Manage Users] The user account list was not loaded'
);

export const setCurrentUser = createAction(
  '[Manage Users] Set the current user account',
  props<{
    user: User | null;
  }>()
);

export const saveUserAccount = createAction(
  '[Manage Users] Save a user account',
  props<{
    id: number | null;
    email: string;
    password: string;
    admin: boolean;
  }>()
);

export const saveUserAccountSuccess = createAction(
  '[Manager Users] Saved a user account',
  props<{
    users: User[];
  }>()
);

export const saveUserAccountFailure = createAction(
  '[Manager Users] Failed to save a user account'
);

export const deleteUserAccount = createAction(
  '[Manage Users] Delete a user account',
  props<{ id: number; email: string }>()
);

export const deleteUserAccountSuccess = createAction(
  '[Manager Users] Deleted a user account',
  props<{
    users: User[];
  }>()
);

export const deleteUserAccountFailure = createAction(
  '[Manager Users] Failed to delete a user account'
);
