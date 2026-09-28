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

import { ComicState } from '@app/library/models/comic-state';
import { ArchiveType } from '@app/library/models/archive-type';
import { ComicType } from '@app/library/models/comic-type';

export interface Comic {
  comicId: number;
  filename: string;
  baseFilename: string;
  missing: boolean;
  archiveType: ArchiveType;
  comicState: ComicState;
  comicType: ComicType;
  publisher: string;
  imprint: string;
  series: string;
  volume: string;
  issueNumber: string;
  sortableIssueNumber: string;
  sortName: string;
  title: string;
  nextIssueId?: number;
  previousIssueId?: number;
  description: string;
  pageCount: number;
  storeDate: number | null;
  coverDate: number | null;
  monthPublished?: number;
  yearPublished?: number;
  addedDate: number;
  referenceId: string;
  unscraped: boolean;
  lastModifiedDate: number;
}

export const NO_COMIC: Comic = {
  comicId: -1,
  filename: '',
  baseFilename: '',
  missing: false,
  archiveType: ArchiveType.CBZ,
  comicState: ComicState.UNPROCESSED,
  comicType: ComicType.ISSUE,
  publisher: '',
  imprint: '',
  series: '',
  volume: '',
  issueNumber: '',
  sortableIssueNumber: '',
  sortName: '',
  title: '',
  description: '',
  pageCount: 0,
  coverDate: null,
  storeDate: null,
  addedDate: new Date().getTime(),
  referenceId: '',
  unscraped: true,
  lastModifiedDate: new Date().getTime()
};
