/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

export const loadCurrentUser = createAction('[User] Load the current user');
export const currentUserLoaded = createAction(
  '[User] Current user is loaded',
  props<{ user: User }>()
);
export const loadCurrentUserFailed = createAction(
  '[User] No  current user loaded'
);
export const loginUser = createAction(
  '[User] Submit the login credentials',
  props<{ email: string; password: string }>()
);
export const userLoggedIn = createAction(
  '[User] User login successful',
  props<{ token: string }>()
);
export const loginUserFailed = createAction('[User] User login failed');
export const logoutUser = createAction('[User] Log out current user');
export const userLoggedOut = createAction('[User] Current user logged out');
