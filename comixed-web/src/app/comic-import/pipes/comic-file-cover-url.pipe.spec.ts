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

import { ComicFileCoverUrlPipe } from './comic-file-cover-url.pipe';
import { COMIC_FILE_1 } from '@app/comic-import/comic-import.fixtures';
import { API_ROOT_URL } from '@app/core';

describe('ComicFileCoverUrlPipe', () => {
  let pipe = new ComicFileCoverUrlPipe();

  it('returns the url for given page', () => {
    expect(pipe.transform(COMIC_FILE_1)).toEqual(
      `${API_ROOT_URL}/files/import/cover?filename=${encodeURIComponent(
        COMIC_FILE_1.filename
      )}`
    );
  });
});
