/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { ScanType } from '@app/comic-book/models/scan-type';
import { ComicFormat } from '@app/comic-book/models/comic-format';
import { FileDetails } from '@app/comic-book/models/file-details';
import { ComicFileEntry } from '@app/comic-book/models/comic-file-entry';
import { ComicCredit } from '@app/comic-book/models/comic-credit';
import { Page } from '@app/comic-book/models/page';
import { ComicBookState } from '@app/comic-book/models/comic-book-state';
import { ArchiveType } from '@app/comic-book/models/archive-type.enum';

export interface Comic {
  id: number;
  archiveType: ArchiveType;
  scanType: ScanType;
  format: ComicFormat;
  filename: string;
  baseFilename: string;
  comicState: ComicBookState;
  missing: boolean;
  fileDetails: FileDetails;
  fileEntries: ComicFileEntry[];
  addedDate: string;
  deletedDate: number;
  lastModifiedOn: number;
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
  notes: string;
  pages?: Page[];
  duplicateCount?: number;
  lastRead?: number;
}
