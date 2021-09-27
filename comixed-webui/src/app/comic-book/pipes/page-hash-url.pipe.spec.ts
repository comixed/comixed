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

import { PageHashUrlPipe } from './page-hash-url.pipe';
import { PAGE_URL_FROM_HASH } from '@app/comic-book/comic-book.constants';
import { interpolate } from '@app/core';
import { PAGE_2 } from '@app/comic-pages/comic-pages.fixtures';

describe('PageHashUrlPipe', () => {
  const PAGE = PAGE_2;

  let pipe: PageHashUrlPipe;

  beforeEach(() => {
    pipe = new PageHashUrlPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns a url', () => {
    expect(pipe.transform(PAGE.hash)).toEqual(
      interpolate(PAGE_URL_FROM_HASH, {
        hash: PAGE.hash
      })
    );
  });
});
