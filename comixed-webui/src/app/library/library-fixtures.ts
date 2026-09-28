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
import { ComicPage } from '@app/library/models/comic-page';
import { PageType } from '@app/library/models/page-type';
import { ComicTag } from '@app/library/models/comic-tag';
import { ComicTagType } from '@app/library/models/comic-tag-type';
import { ComicMetadataSource } from '@app/library/models/comic-metadata-source';
import { MetadataSource } from '@app/library/models/metadata-source';
import { ArchiveType } from '@app/library/models/archive-type';
import { ComicType } from '@app/library/models/comic-type';

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
  comicId: 1000,
  filename: '/Library/The Series V2026 #17.cbz',
  baseFilename: 'The Series V2026 #17.cbz',
  missing: false,
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  comicType: ComicType.ISSUE,
  publisher: 'The Publisher',
  imprint: 'The Imprint',
  series: 'The Series',
  volume: '2026',
  issueNumber: '17',
  sortableIssueNumber: '0000000017',
  sortName: 'The Sort Name',
  title: 'The Comic Title',
  nextIssueId: 1001,
  previousIssueId: 1002,
  description: 'This is the first issue in our test library',
  pageCount: 28,
  storeDate: new Date().getTime(),
  coverDate: new Date().getTime(),
  monthPublished: 10,
  yearPublished: 2026,
  addedDate: new Date().getTime(),
  referenceId: '1001001',
  unscraped: false,
  lastModifiedDate: new Date().getTime()
};

export const COMIC_PAGE_1: ComicPage = {
  comicPageId: 2000,
  filename: 'page1.png',
  index: 0,
  pageNumber: 0,
  pageType: PageType.FRONT_COVER,
  hash: 'thepagehash',
  width: 640,
  height: 480,
  blocked: false,
  deleted: false
};

export const COMIC_TAG_1: ComicTag = {
  type: ComicTagType.CHARACTER,
  value: 'The Hero'
};

export const METADATA_SOURCE_1: MetadataSource = {
  metadataSourceId: 3000,
  name: 'The Metadata Source',
  version: '1.0.1',
  available: true,
  homepage: 'http://the-metadat-source',
  preferred: true,
  properties: []
};

export const METADATA_1: ComicMetadataSource = {
  metadataSource: METADATA_SOURCE_1,
  referenceId: '71765',
  lastScrapedDate: new Date().getTime()
};
