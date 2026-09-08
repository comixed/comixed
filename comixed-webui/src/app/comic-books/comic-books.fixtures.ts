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

import { ComicState } from '@app/comic-books/models/comic-state';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { Imprint } from '@app/comic-books/models/imprint';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';
import { ComicType } from '@app/comic-books/models/comic-type';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';
import { ComicMetadataSource } from '@app/comic-books/models/comic-metadata-source';
import { METADATA_SOURCE_1 } from '@app/comic-metadata/comic-metadata.fixtures';
import { ComicTag } from '@app/comic-books/models/comic-tag';

export const IMPRINT_1: Imprint = {
  imprintId: 1,
  name: 'Imprint 1',
  publisher: 'Publisher 1'
};

export const IMPRINT_2: Imprint = {
  imprintId: 2,
  name: 'Imprint 2',
  publisher: 'Publisher 2'
};

export const IMPRINT_3: Imprint = {
  imprintId: 3,
  name: 'Imprint 3',
  publisher: 'Publisher 3'
};

export const COMIC_TAG_1: ComicTag = {
  type: ComicTagType.LOCATION,
  value: 'New York City'
};

export const COMIC_TAG_2: ComicTag = {
  type: ComicTagType.STORY,
  value: 'Age Of Ultron'
};

export const COMIC_TAG_3: ComicTag = {
  type: ComicTagType.CHARACTER,
  value: 'Alfred Pennyworth'
};

export const COMIC_TAG_4: ComicTag = {
  type: ComicTagType.PENCILLER,
  value: 'Joey Pencils'
};

export const COMIC_TAG_5: ComicTag = {
  type: ComicTagType.TEAM,
  value: 'The Avengers'
};

export const DISPLAYABLE_COMIC_1: DisplayableComic = {
  comicBookId: 1,
  comicDetailId: 101,
  referenceId: '01234',
  filename: '/library/comicbook1.cbz',
  baseFilename: 'comicbook1.cbz',
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  missing: false,
  comicType: ComicType.ISSUE,
  sortName: null,
  unscraped: false,
  publisher: 'First Publisher',
  imprint: null,
  series: 'First Series',
  volume: '2017',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  title: 'First ComicBook Title',
  pageCount: 22,
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  yearPublished: new Date().getFullYear(),
  monthPublished: new Date().getMonth(),
  addedDate: new Date().getTime(),
  lastModifiedDate: new Date().getTime(),
  notes: '',
  description: ''
};

export const DISPLAYABLE_COMIC_2: DisplayableComic = {
  comicBookId: 2,
  comicDetailId: 102,
  referenceId: '12345',
  filename: '/library/comicbook2.cbz',
  baseFilename: 'comicbook2.cbz',
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  missing: false,
  comicType: ComicType.ISSUE,
  sortName: null,
  unscraped: false,
  publisher: 'First Publisher',
  imprint: 'First Imprint',
  series: 'First Series',
  volume: '2017',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  title: 'First ComicBook Title',
  pageCount: 22,
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  yearPublished: new Date().getFullYear(),
  monthPublished: new Date().getMonth(),
  addedDate: new Date().getTime(),
  lastModifiedDate: new Date().getTime(),
  notes: '',
  description: ''
};

export const DISPLAYABLE_COMIC_3: DisplayableComic = {
  comicBookId: 3,
  comicDetailId: 103,
  referenceId: '23456',
  filename: '/library/comicbook3.cbz',
  baseFilename: 'comicbook3.cbz',
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  missing: false,
  comicType: ComicType.ISSUE,
  sortName: null,
  unscraped: false,
  publisher: 'First Publisher',
  imprint: 'First Imprint',
  series: 'First Series',
  volume: '2017',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  title: 'First ComicBook Title',
  pageCount: 22,
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  yearPublished: new Date().getFullYear(),
  monthPublished: new Date().getMonth(),
  addedDate: new Date().getTime(),
  lastModifiedDate: new Date().getTime(),
  notes: '',
  description: ''
};

export const DISPLAYABLE_COMIC_4: DisplayableComic = {
  comicBookId: 4,
  comicDetailId: 104,
  referenceId: '34567',
  filename: '/library/comicbook4.cbz',
  baseFilename: 'comicbook4.cbz',
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  missing: false,
  comicType: ComicType.ISSUE,
  sortName: null,
  unscraped: false,
  publisher: 'First Publisher',
  imprint: 'First Imprint',
  series: 'First Series',
  volume: '2017',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  title: 'First ComicBook Title',
  pageCount: 22,
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  yearPublished: new Date().getFullYear(),
  monthPublished: new Date().getMonth(),
  addedDate: new Date().getTime(),
  lastModifiedDate: new Date().getTime(),
  notes: '',
  description: ''
};

export const DISPLAYABLE_COMIC_5: DisplayableComic = {
  comicBookId: 5,
  comicDetailId: 105,
  referenceId: '45678',
  filename: '/library/comicbook5.cbz',
  baseFilename: 'comicbook5.cbz',
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  missing: false,
  comicType: ComicType.ISSUE,
  sortName: null,
  unscraped: false,
  publisher: 'First Publisher',
  imprint: 'First Imprint',
  series: 'First Series',
  volume: '2017',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  title: 'First ComicBook Title',
  pageCount: 22,
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  yearPublished: new Date().getFullYear(),
  monthPublished: new Date().getMonth(),
  addedDate: new Date().getTime(),
  lastModifiedDate: new Date().getTime(),
  notes: '',
  description: ''
};

export const COMIC_METADATA_SOURCE_1: ComicMetadataSource = {
  metadataSource: METADATA_SOURCE_1,
  referenceId: '71765',
  lastScrapedDate: new Date().getTime()
};
