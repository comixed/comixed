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

import { ScanType } from './scan-type';
import { ComicFormat } from './comic-format';
import { Page } from './page';
import { ComicCredit } from './comic-credit';
import { FileDetails } from 'app/comics/models/file-details';

export interface Comic {
  id: number;
  filename: string;
  lastUpdatedDate: number;
  baseFilename: string;
  publisher: string;
  imprint: string;
  sortName: string;
  series: string;
  volume: string;
  issueNumber: string;
  sortableIssueNumber: string;
  title: string;
  storyArcs: string[];
  description: string;
  notes: string;
  summary: string;
  missing: boolean;
  archiveType: string;
  comicVineId: string;
  comicVineURL: string;
  addedDate: string;
  deletedDate: number;
  coverDate: string;
  yearPublished: number;
  pageCount: number;
  characters: string[];
  teams: string[];
  locations: string[];
  pages: Page[];
  blockedPageCount: number;
  deletedPageCount: number;
  credits: ComicCredit[];
  scanType: ScanType;
  format: ComicFormat;
  nextIssueId: number;
  previousIssueId: number;
  fileDetails: FileDetails;
}
