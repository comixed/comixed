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

import { DeletedComicsPipe } from './deleted-comics.pipe';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4
} from '@app/comic-book/comic-book.fixtures';
import { Comic } from '@app/comic-book/models/comic';

describe('DeletedComicsPipe', () => {
  const DELETED_COMIC: Comic = {
    ...COMIC_1,
    deletedDate: new Date().getTime()
  };
  const COMICS = [DELETED_COMIC, COMIC_2, COMIC_3, COMIC_4];

  let pipe: DeletedComicsPipe;

  beforeEach(() => {
    pipe = new DeletedComicsPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns only deleted comics', () => {
    expect(pipe.transform(COMICS)).toEqual([DELETED_COMIC]);
  });
});
