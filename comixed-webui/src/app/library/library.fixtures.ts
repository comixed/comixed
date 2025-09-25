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

import { DuplicatePage } from './models/duplicate-page';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3
} from '../comic-books/comic-books.fixtures';
import { PAGE_1, PAGE_2, PAGE_3 } from '@app/comic-pages/comic-pages.fixtures';
import { DuplicateComic } from '@app/library/models/duplicate-comic';

export const DUPLICATE_PAGE_1: DuplicatePage = {
  hash: PAGE_1.hash,
  comicCount: 5,
  comics: [COMIC_DETAIL_1]
};

export const DUPLICATE_PAGE_2: DuplicatePage = {
  hash: PAGE_2.hash,
  comicCount: 5,
  comics: [COMIC_DETAIL_2]
};

export const DUPLICATE_PAGE_3: DuplicatePage = {
  hash: PAGE_3.hash,
  comicCount: 5,
  comics: [COMIC_DETAIL_3]
};

export const DUPLICATE_COMIC_1: DuplicateComic = {
  publisher: 'Publisher 1',
  series: 'Series 1',
  volume: '2025',
  issueNumber: '23',
  coverDate: new Date().getTime(),
  total: 23
};

export const DUPLICATE_COMIC_2: DuplicateComic = {
  publisher: 'Publisher 1',
  series: 'Series 2',
  volume: '2025',
  issueNumber: '33',
  coverDate: new Date().getTime(),
  total: 23
};

export const DUPLICATE_COMIC_3: DuplicateComic = {
  publisher: 'Publisher 1',
  series: 'Series 3',
  volume: '2025',
  issueNumber: '14',
  coverDate: new Date().getTime(),
  total: 23
};

export const DUPLICATE_COMIC_4: DuplicateComic = {
  publisher: 'Publisher 1',
  series: 'Series 4',
  volume: '2025',
  issueNumber: '8',
  coverDate: new Date().getTime(),
  total: 23
};

export const DUPLICATE_COMIC_5: DuplicateComic = {
  publisher: 'Publisher 1',
  series: 'Series 5',
  volume: '2025',
  issueNumber: '123',
  coverDate: new Date().getTime(),
  total: 28
};
