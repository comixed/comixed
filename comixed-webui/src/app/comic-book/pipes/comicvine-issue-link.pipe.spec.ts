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

import { ComicvineIssueLinkPipe } from './comicvine-issue-link.pipe';
import { COMICVINE_ISSUE_LINK } from '@app/comic-book/comic-book.constants';
import { COMIC_5 } from '@app/comic-book/comic-book.fixtures';
import { interpolate } from '@app/core';

describe('ComicvineIssueLinkPipe', () => {
  const COMIC = COMIC_5;

  let pipe: ComicvineIssueLinkPipe;

  beforeEach(() => {
    pipe = new ComicvineIssueLinkPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns the correct URL', () => {
    expect(pipe.transform(COMIC)).toEqual(
      interpolate(COMICVINE_ISSUE_LINK, { id: COMIC.comicVineId })
    );
  });
});
