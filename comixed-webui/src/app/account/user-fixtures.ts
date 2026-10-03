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

import { User } from '@app/account/models/user';

export const USER_ADMIN: User = {
  comixedUserId: 1,
  email: 'admin@comixedproject.org',
  firstLoginDate: new Date().getTime(),
  lastLoginDate: new Date().getTime(),
  roles: [{ name: 'READER' }, { name: 'ADMIN' }],
  readComics: []
};

export const USER_READER: User = {
  comixedUserId: 2,
  email: 'reader@comixedproject.org',
  firstLoginDate: new Date().getTime(),
  lastLoginDate: new Date().getTime(),
  roles: [{ name: 'READER' }],
  readComics: []
};
