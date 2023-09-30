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

import { Page } from '@app/comic-books/models/page';
import { ComicMetadataSource } from '@app/comic-books/models/comic-metadata-source';
import { ComicDetail } from '@app/comic-books/models/comic-detail';

export interface ComicBook {
  id: number;
  detail: ComicDetail;
  metadata: ComicMetadataSource;
  pages?: Page[];
  duplicatePageCount: number;
  blockedPageCount: number;
  nextIssueId: number;
  previousIssueId: number;
  lastModifiedOn: number;
}
