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

import { ComicFile } from 'app/comic-import/models/comic-file';

export const COMIC_FILE_1: ComicFile = {
  id: 1,
  filename: '/Users/comixed/Documents/comics/existing-comic-file.cbz',
  baseFilename: 'existing-comic-file',
  size: 65535
};

export const COMIC_FILE_2: ComicFile = {
  id: 2,
  filename: '/Users/comixed/Documents/comics/another-comic-file.cbz',
  baseFilename: 'another-comic-file',
  size: 32767
};

export const COMIC_FILE_3: ComicFile = {
  id: 3,
  filename: '/Users/comixed/Documents/comics/this-comic-file.cbz',
  baseFilename: 'this-comic-file',
  size: 46787
};

export const COMIC_FILE_4: ComicFile = {
  id: 4,
  filename: '/Users/comixed/Documents/comics/that-comic-file.cbz',
  baseFilename: 'that-comic-file',
  size: 56213
};
