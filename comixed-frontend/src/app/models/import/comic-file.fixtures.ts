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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { ComicFile } from './comic-file';

export const EXISTING_COMIC_FILE_1: ComicFile = {
  id: 1,
  filename: '/home/comixed/Library/existing-comic-file.cbz',
  base_filename: 'existing-comic-file',
  size: 65535,
  selected: false
};

export const EXISTING_COMIC_FILE_2: ComicFile = {
  id: 2,
  filename: '/home/comixed/Library/another-comic-file.cbz',
  base_filename: 'another-comic-file',
  size: 32767,
  selected: false
};

export const EXISTING_COMIC_FILE_3: ComicFile = {
  id: 3,
  filename: '/home/comixed/Library/this-comic-file.cbz',
  base_filename: 'this-comic-file',
  size: 46787,
  selected: false
};

export const EXISTING_COMIC_FILE_4: ComicFile = {
  id: 4,
  filename: '/home/comixed/Library/that-comic-file.cbz',
  base_filename: 'that-comic-file',
  size: 56213,
  selected: false
};
