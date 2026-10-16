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
import { User } from '@app/account/models/user';

export const loadCurrentUser = createAction(
  '[Current User] Load the current user'
);

export const loadCurrentUserSuccess = createAction(
  '[Current User] Load the current user success',
  props<{ user: User | null }>()
);

export const loadCurrentUserFailure = createAction(
  '[Current User] Load the current user failure'
);

export const login = createAction(
  '[Current User] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction('[Current User] Login success');

export const loginFailure = createAction('[Current User] Login failure');
