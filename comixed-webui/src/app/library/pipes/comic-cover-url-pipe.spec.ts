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

import { ComicCoverUrlPipe } from './comic-cover-url-pipe';
import { beforeEach } from 'vitest';
import { API_ROOT_URL } from '@app/app-constants';
import { MISSING_COMIC_IMAGE_URL } from '@app/library/library-constants';
import { COMIC_1 } from '@app/library/library-fixtures';

describe('ComicCoverUrlPipe', () => {
  const TEST_COMIC = COMIC_1;

  let pipe: ComicCoverUrlPipe;

  beforeEach(() => {
    pipe = new ComicCoverUrlPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns the URL for the comic cover image', () => {
    expect(pipe.transform(TEST_COMIC)).toEqual(
      `${API_ROOT_URL}/comics/${TEST_COMIC.comicId}/cover/content`
    );
  });

  it('returns the missing image url for null comics', () => {
    expect(pipe.transform(null)).toEqual(MISSING_COMIC_IMAGE_URL);
  });
});
