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

import { FileDetails } from '@app/comic-books/models/file-details';
import { ComicCredit } from '@app/comic-books/models/comic-credit';
import { ComicBook } from '@app/comic-books/models/comic-book';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import {
  PAGE_1,
  PAGE_2,
  PAGE_3,
  PAGE_4
} from '@app/comic-pages/comic-pages.fixtures';
import { Imprint } from '@app/comic-books/models/imprint';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

export const FILE_DETAILS_1: FileDetails = {
  id: 1,
  hash: '1234567890ABCDEF1234567890ABCDEF'
};

export const COMIC_CREDIT_1: ComicCredit = {
  id: 1,
  name: 'Art Maker',
  role: 'artist'
};

export const COMIC_CREDIT_2: ComicCredit = {
  id: 2,
  name: 'Penn Siller',
  role: 'penciller'
};

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

export const COMIC_DETAIL_1: ComicDetail = {
  comicId: 1,
  archiveType: ArchiveType.CBZ,
  comicState: ComicBookState.STABLE,
  publisher: 'First Publisher',
  imprint: '',
  series: 'First Series',
  volume: '2017',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  yearPublished: 2019,
  addedDate: new Date().getTime()
};

export const COMIC_DETAIL_2: ComicDetail = {
  comicId: 2,
  comicState: ComicBookState.STABLE,
  archiveType: ArchiveType.CBR,
  publisher: 'First Publisher',
  imprint: null,
  series: 'Last Series',
  volume: '2015',
  issueNumber: '2',
  sortableIssueNumber: '00001',
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  yearPublished: 2018,
  addedDate: new Date().getTime()
};

export const COMIC_DETAIL_3: ComicDetail = {
  comicId: 3,
  archiveType: ArchiveType.CB7,
  comicState: ComicBookState.STABLE,
  publisher: 'Second Publisher',
  imprint: null,
  series: 'First Series',
  volume: '2015',
  issueNumber: '3',
  sortableIssueNumber: '00001',
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  yearPublished: 1953,
  addedDate: new Date().getTime()
};

export const COMIC_DETAIL_4: ComicDetail = {
  comicId: 4,
  archiveType: ArchiveType.CBZ,
  comicState: ComicBookState.STABLE,
  publisher: 'Third Publisher',
  imprint: null,
  series: 'Second Series',
  volume: '1972',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  yearPublished: 1972,
  addedDate: new Date().getTime()
};

export const COMIC_DETAIL_5: ComicDetail = {
  archiveType: ArchiveType.CBZ,
  comicId: 5,
  comicState: ComicBookState.STABLE,
  publisher: 'Second Publisher',
  imprint: null,
  series: 'Third Series',
  volume: '1965',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  yearPublished: 2000,
  addedDate: new Date().getTime()
};

export const COMIC_BOOK_1: ComicBook = {
  id: 1,
  filename: '/Users/comixedreader/Documents/library/comicfile1.cbz',
  baseFilename: 'comicfile1.cbz',
  detail: COMIC_DETAIL_1,
  sortName: 'comicfile1',
  title: 'First ComicBook Title',
  stories: ['story1', 'story2', 'story3'],
  description: 'The description of this comic',
  notes: '',
  missing: false,
  characters: ['character1', 'character2', 'character3'],
  teams: ['team1'],
  locations: ['location1', 'location2'],
  pages: [PAGE_1, PAGE_2, PAGE_3, PAGE_4],
  blockedPageCount: 0,
  credits: [],
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  metadata: null
};

export const COMIC_BOOK_2: ComicBook = {
  id: 2,
  filename: '/Users/comixedreader/Documents/library/comicfile2.cbz',
  baseFilename: 'comicfile2.cbz',
  detail: COMIC_DETAIL_2,
  sortName: 'comicfile1',
  title: 'First ComicBook Title',
  stories: ['story1'],
  description: 'The description of this comic',
  notes: '',
  missing: false,
  characters: ['character2', 'character3', 'character4'],
  teams: ['team2'],
  locations: ['location1', 'location2'],
  pages: [PAGE_1],
  blockedPageCount: 0,
  credits: [],
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  metadata: null
};

export const COMIC_BOOK_3: ComicBook = {
  id: 3,
  filename: '/Users/comixedreader/Documents/library/comicfile3.cbz',
  baseFilename: 'comicfile3.cbz',
  detail: COMIC_DETAIL_3,
  sortName: 'comicfile1',
  title: 'First ComicBook Title',
  stories: ['story1'],
  description: 'The description of this comic',
  notes: '',
  missing: false,
  characters: ['character3', 'character4', 'character5'],
  teams: ['team1'],
  locations: ['location1', 'location2'],
  pages: [PAGE_1],
  blockedPageCount: 0,
  credits: [],
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  metadata: null
};

export const COMIC_BOOK_4: ComicBook = {
  id: 4,
  filename: '/Users/comixedreader/Documents/library/comicfile4.cbz',
  baseFilename: 'comicfile4.cbz',
  detail: COMIC_DETAIL_4,
  sortName: 'comicfile1',
  title: 'First ComicBook Title',
  stories: [],
  description: 'The description of this comic',
  notes: '',
  missing: false,
  characters: [],
  teams: [],
  locations: [],
  pages: [PAGE_1],
  blockedPageCount: 0,
  credits: [],
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  metadata: null
};

export const COMIC_BOOK_5: ComicBook = {
  id: 5,
  filename: '/Users/comixedreader/Documents/library/comicfile5.cbz',
  baseFilename: 'comicfile1.cbz',
  detail: COMIC_DETAIL_5,
  sortName: 'comicfile5',
  title: 'First ComicBook Title',
  stories: [],
  description: 'The description of this comic',
  notes: '',
  missing: false,
  characters: [],
  teams: [],
  locations: [],
  pages: [PAGE_1],
  blockedPageCount: 0,
  credits: [COMIC_CREDIT_1, COMIC_CREDIT_2],
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  metadata: null
};
