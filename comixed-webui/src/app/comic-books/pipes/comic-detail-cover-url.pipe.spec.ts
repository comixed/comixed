/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

import { API_ROOT_URL } from '@app/core';
import { COMIC_DETAIL_1 } from '@app/comic-books/comic-books.fixtures';
import { MISSING_COMIC_IMAGE_URL } from '@app/library/library.constants';
import { ComicDetailCoverUrlPipe } from '@app/comic-books/pipes/comic-detail-cover-url.pipe';

describe('ComicDetailCoverUrlPipe', () => {
  const pipe = new ComicDetailCoverUrlPipe();

  it('returns the URL for the comic cover image', () => {
    expect(pipe.transform(COMIC_DETAIL_1)).toEqual(
      `${API_ROOT_URL}/comics/${COMIC_DETAIL_1.comicId}/cover/content`
    );
  });

  it('returns the missing image url for null comics', () => {
    expect(pipe.transform(null)).toEqual(MISSING_COMIC_IMAGE_URL);
  });
});
