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

import { FileDetails } from '@app/comic-book/models/file-details';
import { ComicCredit } from '@app/comic-book/models/comic-credit';
import { Comic } from '@app/comic-book/models/comic';
import { ScrapingVolume } from '@app/comic-book/models/scraping-volume';
import { ScrapingIssue } from '@app/comic-book/models/scraping-issue';
import { ComicBookState } from '@app/comic-book/models/comic-book-state';
import { ArchiveType } from '@app/comic-book/models/archive-type.enum';
import {
  PAGE_1,
  PAGE_2,
  PAGE_3,
  PAGE_4
} from '@app/comic-pages/comic-pages.fixtures';
import { Imprint } from '@app/comic-book/models/imprint';

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

export const COMIC_1: Comic = {
  id: 1,
  filename: '/Users/comixedreader/Documents/library/comicfile4.cbz',
  baseFilename: 'comicfile1.cbz',
  comicState: ComicBookState.STABLE,
  publisher: 'First Publisher',
  imprint: '',
  sortName: 'comicfile1',
  series: 'First Series',
  volume: '2017',
  issueNumber: '1',
  sortableIssueNumber: '00001',
  title: 'First Comic Title',
  storyArcs: ['story1', 'story2', 'story3'],
  description: 'The description of this comic',
  notes: '',
  missing: false,
  archiveType: ArchiveType.CBZ,
  comicVineId: '71765',
  addedDate: new Date().getTime(),
  deletedDate: null,
  coverDate: new Date().getTime(),
  yearPublished: 2019,
  pageCount: 32,
  characters: ['character1', 'character2', 'character3'],
  teams: ['team1'],
  locations: ['location1', 'location2'],
  pages: [PAGE_1, PAGE_2, PAGE_3, PAGE_4],
  blockedPageCount: 0,
  deletedPageCount: 0,
  credits: [],
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  fileEntries: []
};

export const COMIC_2: Comic = {
  id: 2,
  filename: '/Users/comixedreader/Documents/library/comicfile3.cbz',
  baseFilename: 'comicfile1.cbz',
  comicState: ComicBookState.STABLE,
  publisher: 'First Publisher',
  imprint: null,
  sortName: 'comicfile1',
  series: 'Last Series',
  volume: '2015',
  issueNumber: '2',
  sortableIssueNumber: '00001',
  title: 'First Comic Title',
  storyArcs: ['story1'],
  description: 'The description of this comic',
  notes: '',
  missing: false,
  archiveType: ArchiveType.CBZ,
  comicVineId: '',
  addedDate: new Date().getTime(),
  deletedDate: null,
  coverDate: new Date().getTime(),
  yearPublished: 2018,
  pageCount: 32,
  characters: ['character2', 'character3', 'character4'],
  teams: ['team2'],
  locations: ['location1', 'location2'],
  pages: [PAGE_1],
  blockedPageCount: 0,
  deletedPageCount: 0,
  credits: [],
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  fileEntries: []
};

export const COMIC_3: Comic = {
  id: 3,
  filename: '/Users/comixedreader/Documents/library/comicfile2.cbz',
  baseFilename: 'comicfile1.cbz',
  comicState: ComicBookState.STABLE,
  publisher: 'Second Publisher',
  imprint: null,
  sortName: 'comicfile1',
  series: 'First Series',
  volume: '2015',
  issueNumber: '3',
  sortableIssueNumber: '00001',
  title: 'First Comic Title',
  storyArcs: ['story1'],
  description: 'The description of this comic',
  notes: '',
  missing: false,
  archiveType: ArchiveType.CBZ,
  comicVineId: '',
  addedDate: new Date().getTime(),
  deletedDate: null,
  coverDate: new Date().getTime(),
  yearPublished: 1953,
  pageCount: 32,
  characters: ['character3', 'character4', 'character5'],
  teams: ['team1'],
  locations: ['location1', 'location2'],
  pages: [PAGE_1],
  blockedPageCount: 0,
  deletedPageCount: 0,
  credits: [],
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  fileEntries: []
};

export const COMIC_4: Comic = {
  id: 4,
  filename: '/Users/comixedreader/Documents/library/comicfile1.cbz',
  baseFilename: 'comicfile1.cbz',
  comicState: ComicBookState.STABLE,
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
  missing: false,
  archiveType: ArchiveType.CBZ,
  comicVineId: '',
  addedDate: new Date().getTime(),
  deletedDate: null,
  coverDate: new Date().getTime(),
  yearPublished: 1972,
  pageCount: 32,
  characters: [],
  teams: [],
  locations: [],
  pages: [PAGE_1],
  blockedPageCount: 0,
  deletedPageCount: 0,
  credits: [],
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  fileEntries: []
};

export const COMIC_5: Comic = {
  id: 5,
  filename: '/Users/comixedreader/Documents/library/comicfile5.cbz',
  baseFilename: 'comicfile1.cbz',
  comicState: ComicBookState.STABLE,
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
  missing: false,
  archiveType: ArchiveType.CBZ,
  comicVineId: '24601',
  addedDate: new Date().getTime(),
  deletedDate: null,
  coverDate: new Date().getTime(),
  yearPublished: 2000,
  pageCount: 32,
  characters: [],
  teams: [],
  locations: [],
  pages: [PAGE_1],
  blockedPageCount: 0,
  deletedPageCount: 0,
  credits: [COMIC_CREDIT_1, COMIC_CREDIT_2],
  lastModifiedOn: 0,
  nextIssueId: null,
  previousIssueId: null,
  fileDetails: FILE_DETAILS_1,
  fileEntries: []
};

export const SCRAPING_VOLUME_1: ScrapingVolume = {
  id: 1,
  name: 'Scraping Series 1',
  publisher: 'Publisher 1',
  startYear: '2000',
  imageUrl: 'http://sitecom/what',
  issueCount: 17
};

export const SCRAPING_VOLUME_2: ScrapingVolume = {
  id: 2,
  name: 'Scraping Series 2',
  publisher: 'Publisher 1',
  startYear: '2010',
  imageUrl: 'http://sitecom/what',
  issueCount: 17
};

export const SCRAPING_VOLUME_3: ScrapingVolume = {
  id: 3,
  name: 'Scraping Series 3',
  publisher: 'Publisher 1',
  startYear: '2020',
  imageUrl: 'http://sitecom/what',
  issueCount: 17
};

export const SCRAPING_ISSUE_1: ScrapingIssue = {
  id: 1,
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  coverUrl: 'http://localhost/scraping-issue-cover',
  volumeName: '2020',
  name: 'Scraping Series 1',
  issueNumber: '27',
  description: 'This is my scraping issue.'
};
