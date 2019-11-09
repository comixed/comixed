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

import { ROLE_ADMIN, ROLE_READER } from './role.fixtures';
import { User } from './user';

export const USER_READER: User = {
  id: 1,
  email: 'comixedreader@localhost',
  first_login_date: new Date(
    new Date().getTime() - 31 * 24 * 60 * 60 * 1000
  ).getTime(),
  last_login_date: new Date().getTime(),
  roles: [ROLE_READER],
  preferences: []
};

export const USER_ADMIN: User = {
  id: 2,
  email: 'comixedadmin@localhost',
  first_login_date: new Date(
    new Date().getTime() - 31 * 24 * 60 * 60 * 1000
  ).getTime(),
  last_login_date: new Date().getTime(),
  roles: [ROLE_ADMIN],
  preferences: []
};

export const USER_BLOCKED: User = {
  id: 3,
  email: 'comixedblocked@localhost',
  first_login_date: new Date(
    new Date().getTime() - 31 * 24 * 60 * 60 * 1000
  ).getTime(),
  last_login_date: new Date().getTime(),
  roles: [],
  preferences: []
};
