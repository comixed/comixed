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

import { ComicFormat } from 'app/comics/models/comic-format';
import { Comic } from 'app/comics/models/comic';
import {
  PAGE_1,
  PAGE_2,
  PAGE_3,
  PAGE_4
} from 'app/comics/models/page.fixtures';
import { SCAN_TYPE_1 } from 'app/comics/models/scan-type.fixtures';
import { FILE_DETAILS_1 } from 'app/comics/models/file-details.fixtures';
import {
  COMIC_CREDIT_1,
  COMIC_CREDIT_2
} from 'app/comics/models/comic-credit.fixtures';

export { COMIC_CREDIT_1, COMIC_CREDIT_2 } from './models/comic-credit.fixtures';
export {
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3,
  SCAN_TYPE_4,
  SCAN_TYPE_5,
  SCAN_TYPE_6,
  SCAN_TYPE_7
} from './models/scan-type.fixtures';
export { FILE_DETAILS_1 } from './models/file-details.fixtures';
export { PAGE_1, PAGE_2 } from './models/page.fixtures';
export { FRONT_COVER, STORY, BACK_COVER } from './models/page-type.fixtures';
export { SCRAPING_ISSUE_1000 } from './models/scraping-issue.fixtures';
export {
  SCRAPING_VOLUME_1000,
  SCRAPING_VOLUME_1001,
  SCRAPING_VOLUME_1002,
  SCRAPING_VOLUME_1003,
  SCRAPING_VOLUME_1004,
  SCRAPING_VOLUME_1005
} from './models/scraping-volume.fixtures';
export {
  VOLUME_1000,
  VOLUME_1001,
  VOLUME_1002,
  VOLUME_1003,
  VOLUME_1004
} from './models/volume.fixtures';

export const FORMAT_1: ComicFormat = {
  id: 1,
  name: 'standard'
};

export const FORMAT_2: ComicFormat = {
  id: 2,
  name: 'trade-paperback'
};

export const FORMAT_3: ComicFormat = {
  id: 3,
  name: 'graphic-novel'
};

export const FORMAT_4: ComicFormat = {
  id: 4,
  name: 'deluxe-edition'
};

export const FORMAT_5: ComicFormat = {
  id: 5,
  name: 'treasury'
};
export const COMIC_1: Comic = {
  id: 1,
  filename: '/Users/comixedreader/Documents/library/comicfile4.cbz',
  baseFilename: 'comicfile1.cbz',
  publisher: 'First Publisher',
  imprint: '',
  sortName: 'comicfile1',
  series: 'First Series',
  volume: '2017',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  title: 'First Comic Title',
  storyArcs: [],
  description: 'The description of this comic',
  notes: '',
  summary: '',
  missing: false,
  archiveType: 'CBZ',
  comicVineId: '',
  comicVineURL: '',
  addedDate: '2019-08-14 12:00:00',
  deletedDate: null,
  coverDate: '2019-08-01',
  yearPublished: 2019,
  pageCount: 32,
  characters: [],
  teams: [],
  locations: [],
  pages: [PAGE_1, PAGE_2, PAGE_3, PAGE_4],
  blockedPageCount: 0,
  deletedPageCount: 0,
  credits: [],
  scanType: SCAN_TYPE_1,
  format: FORMAT_1,
  lastUpdatedDate: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  fileEntries: [],
  readingLists: []
};

export const COMIC_2: Comic = {
  id: 2,
  filename: '/Users/comixedreader/Documents/library/comicfile3.cbz',
  baseFilename: 'comicfile1.cbz',
  publisher: 'First Publisher',
  imprint: null,
  sortName: 'comicfile1',
  series: 'First Series',
  volume: '2015',
  issueNumber: '2',
  sortableIssueNumber: '00001',
  title: 'First Comic Title',
  storyArcs: [],
  description: 'The description of this comic',
  notes: '',
  summary: '',
  missing: false,
  archiveType: 'CBZ',
  comicVineId: '',
  comicVineURL: '',
  addedDate: '2019-08-14 12:00:00',
  deletedDate: null,
  coverDate: '2018-08-01',
  yearPublished: 2018,
  pageCount: 32,
  characters: [],
  teams: [],
  locations: [],
  pages: [PAGE_1],
  blockedPageCount: 0,
  deletedPageCount: 0,
  credits: [],
  scanType: null,
  format: null,
  lastUpdatedDate: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  fileEntries: [],
  readingLists: []
};

export const COMIC_3: Comic = {
  id: 3,
  filename: '/Users/comixedreader/Documents/library/comicfile2.cbz',
  baseFilename: 'comicfile1.cbz',
  publisher: 'Second Publisher',
  imprint: null,
  sortName: 'comicfile1',
  series: 'First Series',
  volume: '2015',
  issueNumber: '3',
  sortableIssueNumber: '00001',
  title: 'First Comic Title',
  storyArcs: [],
  description: 'The description of this comic',
  notes: '',
  summary: '',
  missing: false,
  archiveType: 'CBZ',
  comicVineId: '',
  comicVineURL: '',
  addedDate: '2019-08-14 12:00:00',
  deletedDate: null,
  coverDate: '1953-08-01',
  yearPublished: 1953,
  pageCount: 32,
  characters: [],
  teams: [],
  locations: [],
  pages: [PAGE_1],
  blockedPageCount: 0,
  deletedPageCount: 0,
  credits: [],
  scanType: null,
  format: null,
  lastUpdatedDate: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  fileEntries: [],
  readingLists: []
};

export const COMIC_4: Comic = {
  id: 4,
  filename: '/Users/comixedreader/Documents/library/comicfile1.cbz',
  baseFilename: 'comicfile1.cbz',
  publisher: 'Third Publisher',
  imprint: null,
  sortName: 'comicfile1',
  series: 'Second Series',
  volume: '1972',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  title: 'First Comic Title',
  storyArcs: [],
  description: 'The description of this comic',
  notes: '',
  summary: '',
  missing: false,
  archiveType: 'CBZ',
  comicVineId: '',
  comicVineURL: '',
  addedDate: '2019-08-14 12:00:00',
  deletedDate: null,
  coverDate: '1972-08-01',
  yearPublished: 1972,
  pageCount: 32,
  characters: [],
  teams: [],
  locations: [],
  pages: [PAGE_1],
  blockedPageCount: 0,
  deletedPageCount: 0,
  credits: [],
  scanType: null,
  format: null,
  lastUpdatedDate: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  fileEntries: [],
  readingLists: []
};

export const COMIC_5: Comic = {
  id: 5,
  filename: '/Users/comixedreader/Documents/library/comicfile5.cbz',
  baseFilename: 'comicfile1.cbz',
  publisher: 'Second Publisher',
  imprint: null,
  sortName: 'comicfile1',
  series: 'Third Series',
  volume: '1965',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  title: 'First Comic Title',
  storyArcs: [],
  description: 'The description of this comic',
  notes: '',
  summary: '',
  missing: false,
  archiveType: 'CBZ',
  comicVineId: '',
  comicVineURL: '',
  addedDate: '2019-08-14 12:00:00',
  deletedDate: null,
  coverDate: '2000-08-01',
  yearPublished: 2000,
  pageCount: 32,
  characters: [],
  teams: [],
  locations: [],
  pages: [PAGE_1],
  blockedPageCount: 0,
  deletedPageCount: 0,
  credits: [COMIC_CREDIT_1, COMIC_CREDIT_2],
  scanType: null,
  format: null,
  lastUpdatedDate: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  fileEntries: [],
  readingLists: []
};
