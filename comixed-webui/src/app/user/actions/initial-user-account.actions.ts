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

export const loadInitialUserAccount = createAction(
  '[Initial User Account] Check if there are any user accounts'
);

export const loadInitialUserAccountSuccess = createAction(
  '[Initial User Account] Has existing accounts status loaded',
  props<{ hasExisting: boolean }>()
);

export const loadInitialUserAccountFailure = createAction(
  '[Initial User Account] Failed to load if any accounts exist'
);

export const createAdminAccount = createAction(
  '[Initial User Account] Create the initial admin account',
  props<{
    email: string;
    password: string;
  }>()
);

export const createAdminAccountSuccess = createAction(
  '[Initial User Account] Successfully created the initial admin account'
);

export const createAdminAccountFailure = createAction(
  '[Initial User Account] Failed to create the initial admin account'
);
