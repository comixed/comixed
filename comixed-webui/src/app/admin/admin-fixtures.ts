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

import { DuplicateComic } from '@app/library/models/duplicate-comic';

export const DUPLICATE_COMIC_1: DuplicateComic = {
  publisher: 'The Publisher',
  series: 'The Series',
  volume: '2026',
  issueNumber: '181',
  coverDate: new Date().getTime(),
  total: 129
};

export const DUPLICATE_COMIC_2: DuplicateComic = {
  publisher: 'The Second Publisher',
  series: 'The Other Series',
  volume: '2026',
  issueNumber: '11',
  coverDate: new Date().getTime(),
  total: 717
};
