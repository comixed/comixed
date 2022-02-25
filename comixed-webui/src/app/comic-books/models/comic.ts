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

import { FileDetails } from '@app/comic-books/models/file-details';
import { ComicCredit } from '@app/comic-books/models/comic-credit';
import { Page } from '@app/comic-books/models/page';
import { ComicBookState } from '@app/comic-books/models/comic-book-state';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicMetadataSource } from '@app/comic-books/models/comic-metadata-source';

export interface Comic {
  id: number;
  archiveType: ArchiveType;
  filename: string;
  baseFilename: string;
  comicState: ComicBookState;
  missing: boolean;
  fileDetails: FileDetails;
  addedDate: number;
  lastModifiedOn: number;
  publisher: string;
  series: string;
  volume: string;
  issueNumber: string;
  coverDate: number;
  storeDate: number;
  yearPublished: number;
  title: string;
  sortableIssueNumber: string;
  sortName: string;
  imprint: string;
  pageCount: number;
  characters: string[];
  teams: string[];
  locations: string[];
  stories: string[];
  credits: ComicCredit[];
  nextIssueId: number;
  previousIssueId: number;
  blockedPageCount: number;
  deletedPageCount: number;
  description?: string;
  notes: string;
  pages?: Page[];
  duplicateCount?: number;
  metadata: ComicMetadataSource;
}
