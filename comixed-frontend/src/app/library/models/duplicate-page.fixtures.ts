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

import { DuplicatePage } from 'app/library/models/duplicate-page';
import { PAGE_1, PAGE_2 } from 'app/comics/comics.fixtures';
import { PAGE_3, PAGE_4 } from 'app/comics/models/page.fixtures';

export const DUPLICATE_PAGE_1: DuplicatePage = {
  hash: PAGE_1.hash,
  blocked: true,
  pages: [PAGE_1, PAGE_2]
};

export const DUPLICATE_PAGE_2: DuplicatePage = {
  hash: PAGE_1.hash,
  blocked: true,
  pages: [PAGE_3, PAGE_4]
};
