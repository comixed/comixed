/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicState } from '@app/comic-books/models/comic-state';
import { ComicType } from '@app/comic-books/models/comic-type';

export interface DisplayableComic {
  comicBookId: number;
  comicDetailId: number;
  archiveType: ArchiveType;
  comicState: ComicState;
  unscraped: boolean;
  comicType: ComicType;
  publisher: string;
  series: string;
  volume: string;
  issueNumber: string;
  sortableIssueNumber: string;
  title: string;
  pageCount: number;
  coverDate: number;
  monthPublished: number;
  yearPublished: number;
  storeDate: number;
  addedDate: number;
}