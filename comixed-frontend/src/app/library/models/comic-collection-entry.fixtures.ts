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

import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5,
  ComicCollectionEntry
} from 'app/library';

export const COMIC_COLLECTION_ENTRY_1: ComicCollectionEntry = {
  comics: [COMIC_1, COMIC_3, COMIC_5],
  count: 3,
  last_comic_added: 0,
  name: 'collection1'
};

export const COMIC_COLLECTION_ENTRY_2: ComicCollectionEntry = {
  comics: [COMIC_2, COMIC_4, COMIC_5],
  count: 3,
  last_comic_added: 0,
  name: 'collection2'
};
