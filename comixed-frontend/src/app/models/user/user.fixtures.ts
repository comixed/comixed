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

import { User } from './user';
import { Preference } from './preference';
import { ADMIN_ROLE, READER_ROLE } from './role.fixtures';

export const ADMIN_USER: User = {
  initialized: true,
  id: 1000,
  fetching: false,
  token: 'abc123',
  authenticating: false,
  busy: false,
  email: 'comixedadmin@somedomain.com',
  authenticated: true,
  is_admin: true,
  is_reader: true,
  first_login_date: 0,
  last_login_date: 0,
  roles: [
    READER_ROLE,
    ADMIN_ROLE
  ],
  preferences: [{ name: 'api_key', value: '1234567890' }]
};

export const READER_USER: User = {
    initialized: true,
    id: 1001,
    fetching: false,
    token: '123abc',
    authenticating: false,
    busy: false,
    email: 'comixedreader@somedomain.com',
    authenticated: true,
    is_admin: false,
    is_reader: true,
    first_login_date: 0,
    last_login_date: 0,
    roles: [READER_ROLE],
    preferences: [
      { name: 'library_display_layout', value: 'list' },
      { name: 'library_display_sort_field', value: 'issue_number' },
      { name: 'library_display_comic_file_sort_field', value: 'size' },
      { name: 'library_display_rows', value: '50' },
      { name: 'library_display_cover_size', value: '300' },
      { name: 'library_display_same_height', value: '0' }
    ]
  }
;

export const BLOCKED_USER: User = {
  initialized: true,
  id: 1002,
  fetching: false,
  token: '123abc',
  authenticating: false,
  busy: false,
  email: 'comixedblocked@somedomain.com',
  authenticated: true,
  is_admin: false,
  is_reader: false,
  first_login_date: 0,
  last_login_date: 0,
  roles: [],
  preferences: []
};
