/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { UnreadComicsPipe } from './unread-comics.pipe';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_2,
  COMIC_DETAIL_3
} from '@app/comic-books/comic-books.fixtures';
import { LastRead } from '@app/last-read/models/last-read';
import { ComicBook } from '@app/comic-books/models/comic-book';

describe('UnreadComicsPipe', () => {
  const UNREAD_COMIC = COMIC_DETAIL_1;
  const READ_COMIC = COMIC_DETAIL_2;
  const OTHER_UNREAD_COMIC = COMIC_DETAIL_3;

  const COMICS = [UNREAD_COMIC, READ_COMIC, OTHER_UNREAD_COMIC];
  const LAST_READ_DATES = [
    {
      id: 1,
      comicBook: { id: READ_COMIC.comicId } as ComicBook,
      lastRead: new Date().getTime()
    } as LastRead
  ];

  let pipe: UnreadComicsPipe;

  beforeEach(() => {
    pipe = new UnreadComicsPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns all comics when disabled', () => {
    expect(pipe.transform(COMICS, false, LAST_READ_DATES)).toEqual(COMICS);
  });

  it('returns only unread comics when enabled', () => {
    expect(pipe.transform(COMICS, true, LAST_READ_DATES)).toEqual([
      UNREAD_COMIC,
      OTHER_UNREAD_COMIC
    ]);
  });
});
