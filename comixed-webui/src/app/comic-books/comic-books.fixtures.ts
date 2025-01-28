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

import { ComicBook } from '@app/comic-books/models/comic-book';
import { ComicState } from '@app/comic-books/models/comic-state';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import {
  PAGE_1,
  PAGE_2,
  PAGE_3,
  PAGE_4
} from '@app/comic-pages/comic-pages.fixtures';
import { Imprint } from '@app/comic-books/models/imprint';
import { ComicDetail } from '@app/comic-books/models/comic-detail';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';
import { ComicType } from '@app/comic-books/models/comic-type';
import { DisplayableComic } from '@app/comic-books/models/displayable-comic';

export const IMPRINT_1: Imprint = {
  id: 1,
  name: 'Imprint 1',
  publisher: 'Publisher 1'
};

export const IMPRINT_2: Imprint = {
  id: 2,
  name: 'Imprint 2',
  publisher: 'Publisher 2'
};

export const IMPRINT_3: Imprint = {
  id: 3,
  name: 'Imprint 3',
  publisher: 'Publisher 3'
};

export const DISPLAYABLE_COMIC_1: DisplayableComic = {
  comicBookId: 1,
  comicDetailId: 101,
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  comicType: ComicType.ISSUE,
  unscraped: false,
  publisher: 'First Publisher',
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
  addedDate: new Date().getTime()
};

export const DISPLAYABLE_COMIC_2: DisplayableComic = {
  comicBookId: 2,
  comicDetailId: 102,
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  comicType: ComicType.ISSUE,
  unscraped: false,
  publisher: 'First Publisher',
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
  addedDate: new Date().getTime()
};

export const DISPLAYABLE_COMIC_3: DisplayableComic = {
  comicBookId: 3,
  comicDetailId: 103,
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  comicType: ComicType.ISSUE,
  unscraped: false,
  publisher: 'First Publisher',
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
  addedDate: new Date().getTime()
};

export const DISPLAYABLE_COMIC_4: DisplayableComic = {
  comicBookId: 4,
  comicDetailId: 104,
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  comicType: ComicType.ISSUE,
  unscraped: false,
  publisher: 'First Publisher',
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
  addedDate: new Date().getTime()
};

export const DISPLAYABLE_COMIC_5: DisplayableComic = {
  comicBookId: 5,
  comicDetailId: 105,
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  comicType: ComicType.ISSUE,
  unscraped: false,
  publisher: 'First Publisher',
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
  addedDate: new Date().getTime()
};

export const COMIC_DETAIL_1: ComicDetail = {
  id: 101,
  comicId: 1,
  filename: '/Users/comixedreader/Documents/library/comicfile1.cbz',
  baseFilename: 'comicfile1.cbz',
  missing: false,
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  comicType: ComicType.ISSUE,
  unscraped: false,
  publisher: 'First Publisher',
  imprint: '',
  series: 'First Series',
  volume: '2017',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  sortName: 'My First Comic',
  title: 'First ComicBook Title',
  pageCount: 22,
  description: 'The description of this comic',
  webAddress: 'http://www.comixedproject.org/detail/1',
  notes: '',
  tags: [
    { type: ComicTagType.WRITER, value: 'Chris Claremont' },
    { type: ComicTagType.WRITER, value: 'John Burn' },
    { type: ComicTagType.PENCILLER, value: 'John Burn' },
    { type: ComicTagType.CHARACTER, value: 'Captain America' },
    { type: ComicTagType.TEAM, value: 'The Avengers' },
    { type: ComicTagType.LOCATION, value: 'Brooklyn' },
    { type: ComicTagType.STORY, value: 'Secret Invasion' }
  ],
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  publishedYear: 2019,
  publishedMonth: 3,
  addedDate: new Date().getTime()
};

export const COMIC_DETAIL_2: ComicDetail = {
  id: 102,
  comicId: 2,
  comicState: ComicState.STABLE,
  comicType: ComicType.ISSUE,
  archiveType: ArchiveType.CBR,
  filename: '/Users/comixedreader/Documents/library/comicfile2.cbz',
  baseFilename: 'comicfile2.cbz',
  missing: false,
  unscraped: false,
  publisher: 'First Publisher',
  imprint: null,
  series: 'Last Series',
  volume: '2015',
  issueNumber: '2',
  sortableIssueNumber: '00001',
  sortName: '',
  title: 'First ComicBook Title',
  pageCount: 22,
  description: 'The description of this comic',
  webAddress: 'http://www.comixedproject.org/detail/2',
  notes: '',
  tags: [],
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  publishedYear: 2018,
  publishedMonth: 3,
  addedDate: new Date().getTime()
};

export const COMIC_DETAIL_3: ComicDetail = {
  id: 103,
  comicId: 3,
  archiveType: ArchiveType.CB7,
  filename: '/Users/comixedreader/Documents/library/comicfile3.cbz',
  baseFilename: 'comicfile3.cbz',
  missing: false,
  comicState: ComicState.STABLE,
  comicType: ComicType.ISSUE,
  unscraped: false,
  publisher: 'Second Publisher',
  imprint: null,
  series: 'First Series',
  volume: '2015',
  issueNumber: '3',
  sortableIssueNumber: '00001',
  sortName: '',
  title: 'First ComicBook Title',
  pageCount: 22,
  description: 'The description of this comic',
  webAddress: 'http://www.comixedproject.org/detail/3',
  notes: '',
  tags: [],
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  publishedYear: 1953,
  publishedMonth: 3,
  addedDate: new Date().getTime()
};

export const COMIC_DETAIL_4: ComicDetail = {
  id: 104,
  comicId: 4,
  filename: '/Users/comixedreader/Documents/library/comicfile4.cbz',
  baseFilename: 'comicfile4.cbz',
  missing: false,
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.STABLE,
  comicType: ComicType.ISSUE,
  unscraped: false,
  publisher: 'Third Publisher',
  imprint: null,
  series: 'Second Series',
  volume: '1972',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  sortName: '',
  title: 'First ComicBook Title',
  pageCount: 22,
  description: 'The description of this comic',
  webAddress: 'http://www.comixedproject.org/detail/4',
  notes: '',
  tags: [],
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  publishedYear: 1972,
  publishedMonth: 3,
  addedDate: new Date().getTime()
};

export const COMIC_DETAIL_5: ComicDetail = {
  id: 15,
  comicId: 5,
  archiveType: ArchiveType.CBZ,
  filename: '/Users/comixedreader/Documents/library/comicfile5.cbz',
  baseFilename: 'comicfile1.cbz',
  missing: false,
  comicState: ComicState.STABLE,
  comicType: ComicType.ISSUE,
  unscraped: false,
  publisher: 'Second Publisher',
  imprint: null,
  series: 'Third Series',
  volume: '1965',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  sortName: '',
  title: 'First ComicBook Title',
  pageCount: 22,
  notes: '',
  description: 'The description of this comic',
  webAddress: 'http://www.comixedproject.org/detail/5',
  tags: [],
  coverDate: new Date(
    new Date().getTime() - 366 * 24 * 60 * 60 * 1000
  ).getTime(),
  storeDate: new Date().getTime(),
  publishedYear: 2000,
  publishedMonth: 3,
  addedDate: new Date().getTime()
};

export const COMIC_BOOK_1: ComicBook = {
  id: 1,
  detail: COMIC_DETAIL_1,
  pages: [PAGE_1, PAGE_2, PAGE_3, PAGE_4],
  duplicatePageCount: 0,
  blockedPageCount: 0,
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  metadata: null
};

export const COMIC_BOOK_2: ComicBook = {
  id: 2,
  detail: COMIC_DETAIL_2,
  pages: [PAGE_1],
  duplicatePageCount: 0,
  blockedPageCount: 0,
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  metadata: null
};

export const COMIC_BOOK_3: ComicBook = {
  id: 3,
  detail: COMIC_DETAIL_3,
  pages: [PAGE_1],
  duplicatePageCount: 0,
  blockedPageCount: 0,
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  metadata: null
};

export const COMIC_BOOK_4: ComicBook = {
  id: 4,
  detail: COMIC_DETAIL_4,
  pages: [PAGE_1],
  duplicatePageCount: 0,
  blockedPageCount: 0,
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  metadata: null
};

export const COMIC_BOOK_5: ComicBook = {
  id: 5,
  detail: COMIC_DETAIL_5,
  pages: [PAGE_1],
  duplicatePageCount: 0,
  blockedPageCount: 0,
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  metadata: null
};
