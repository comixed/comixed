/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

export const loadCurrentUser = createAction(
  '[Authentication] Load the current user'
);

export const loadCurrentUserSuccess = createAction(
  '[Authentication] The current user was loaded',
  props<{
    user: User;
  }>()
);

export const loadCurrentUserFailure = createAction(
  '[Authentication] Failed to load the current user'
);

export const login = createAction(
  '[Authentication] Authenticate user',
  props<{
    email: string;
    password: string;
  }>()
);

export const loginSuccess = createAction(
  '[Authentication] User authentication successful'
);

export const loginFailure = createAction(
  '[Authentication] User authentication failed'
);
