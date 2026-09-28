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

import { RemoteLibraryState } from '@app/library/models/net/remote-library-state';
import { Comic } from '@app/library/models/comic';
import { ComicState } from '@app/library/models/comic-state';
import { ComicFile } from '@app/library/models/comic-file';

export const REMOTE_LIBRARY_STATE: RemoteLibraryState = {
  totalComics: 71765,
  unscrapedComics: 15,
  deletedComics: 3,
  duplicateComics: 52,
  publishers: [],
  series: [],
  characters: [],
  teams: [],
  locations: [],
  stories: [],
  states: [],
  archiveTypes: [],
  byPublisherAndYear: []
};

export const COMIC_FILE_1: ComicFile = {
  id: 1,
  filename: '/Users/comixed/Documents/comics/existing-comic-file.cbz',
  baseFilename: 'existing-comic-file',
  size: 65535,
  selected: false
};

export const COMIC_1: Comic = {
  comicId: 1,
  comicState: ComicState.STABLE,
  publisher: 'The Publisher',
  series: 'The Series',
  volume: '2026',
  issueNumber: '17',
  pageCount: 28,
  addedDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  coverDate: new Date().getTime(),
  baseFilename: 'the series v2026 #17.cbz'
};
