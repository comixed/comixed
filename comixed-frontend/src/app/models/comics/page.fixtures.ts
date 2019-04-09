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

import { Page } from 'app/models/comics/page';
import { FRONT_COVER } from 'app/models/comics/page-type.fixtures';

export const PAGE_1: Page = {
  id: 1000,
  comic_id: 1000,
  filename: 'firstpage.png',
  width: 1080,
  height: 1920,
  index: 0,
  hash: 'abcdef1234567890',
  deleted: false,
  page_type: FRONT_COVER,
  blocked: false
};
