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

import { ComicPageUrlPipe } from './comic-page-url.pipe';
import { PAGE_1 } from '@app/comic-pages/comic-pages.fixtures';
import { MISSING_COMIC_IMAGE_URL } from '@app/library/library.constants';

describe('ComicPageUrlPipe', () => {
  const PAGE = PAGE_1;

  let pipe: ComicPageUrlPipe;

  beforeEach(() => {
    pipe = new ComicPageUrlPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns a URL for a page', () => {
    expect(pipe.transform(PAGE)).not.toEqual('');
  });

  it('returns a default URL when the page is null', () => {
    expect(pipe.transform(null)).toEqual(MISSING_COMIC_IMAGE_URL);
  });
});
