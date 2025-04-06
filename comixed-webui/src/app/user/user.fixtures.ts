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

import { User } from './models/user';
import { Role } from '@app/user/models/role';
import { ROLE_NAME_ADMIN, ROLE_NAME_READER } from '@app/user/user.constants';
import { Preference } from '@app/user/models/preference';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3,
  COMIC_DETAIL_4,
  COMIC_DETAIL_5
} from '@app/comic-books/comic-books.fixtures';

export const ROLE_READER: Role = {
  name: ROLE_NAME_READER
};

export const ROLE_ADMIN: Role = {
  name: ROLE_NAME_ADMIN
};

export const PREFERENCE_1: Preference = {
  name: 'preference.name',
  value: 'Preference Value'
};

export const USER_READER: User = {
  comixedUserId: 1,
  email: 'comixedreader@localhost',
  firstLoginDate: new Date(
    new Date().getTime() - 31 * 24 * 60 * 60 * 1000
  ).getTime(),
  lastLoginDate: new Date().getTime(),
  roles: [ROLE_READER],
  preferences: [],
  readComicBooks: []
};

export const USER_ADMIN: User = {
  comixedUserId: 2,
  email: 'comixedadmin@localhost',
  firstLoginDate: new Date(
    new Date().getTime() - 31 * 24 * 60 * 60 * 1000
  ).getTime(),
  lastLoginDate: new Date().getTime(),
  roles: [ROLE_READER, ROLE_ADMIN],
  preferences: [],
  readComicBooks: []
};

export const USER_BLOCKED: User = {
  comixedUserId: 3,
  email: 'comixedblocked@localhost',
  firstLoginDate: new Date(
    new Date().getTime() - 31 * 24 * 60 * 60 * 1000
  ).getTime(),
  lastLoginDate: new Date().getTime(),
  roles: [],
  preferences: [],
  readComicBooks: []
};

export const READ_COMIC_BOOK_1 = COMIC_DETAIL_1.comicDetailId;

export const READ_COMIC_BOOK_2 = COMIC_DETAIL_2.comicDetailId;

export const READ_COMIC_BOOK_3 = COMIC_DETAIL_3.comicDetailId;

export const READ_COMIC_BOOK_4 = COMIC_DETAIL_4.comicDetailId;

export const READ_COMIC_BOOK_5 = COMIC_DETAIL_5.comicDetailId;
