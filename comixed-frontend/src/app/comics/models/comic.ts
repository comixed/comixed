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

import { ScanType } from './scan-type';
import { ComicFormat } from './comic-format';
import { Page } from './page';
import { ComicCredit } from './comic-credit';
import { FileDetails } from 'app/comics/models/file-details';
import { ReadingList } from 'app/comics/models/reading-list';
import { ComicFileEntry } from 'app/comics/models/comic-file-entry';

export interface Comic {
  id: number;
  archiveType: string;
  scanType: ScanType;
  format: ComicFormat;
  filename: string;
  baseFilename: string;
  missing: boolean;
  fileDetails: FileDetails;
  fileEntries: ComicFileEntry[];
  addedDate: string;
  deletedDate: number;
  lastUpdatedDate: number;
  publisher: string;
  series: string;
  volume: string;
  issueNumber: string;
  coverDate: string;
  yearPublished: number;
  title: string;
  sortableIssueNumber: string;
  sortName: string;
  imprint: string;
  comicVineId: string;
  pageCount: number;
  characters: string[];
  teams: string[];
  locations: string[];
  storyArcs: string[];
  credits: ComicCredit[];
  nextIssueId: number;
  previousIssueId: number;
  blockedPageCount: number;
  deletedPageCount: number;
  description?: string;
  notes?: string;
  summary?: string;
  comicVineURL?: string;
  pages?: Page[];
  duplicateCount?: number;
  readingLists: ReadingList[];
  lastReadDate?: number;
}
