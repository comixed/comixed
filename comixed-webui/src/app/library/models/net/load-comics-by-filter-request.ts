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

export interface LoadComicsByFilterRequest {
  pageSize: number;
  pageIndex: number;
  coverYear: number | null;
  coverMonth: number | null;
  archiveType: ArchiveType | null;
  comicType: ComicType | null;
  comicState: ComicState | null;
  missing: boolean;
  unscrapedState: boolean;
  searchText: string | null;
  publisher: string | null;
  series: string | null;
  volume: string | null;
  pageCount: number | null;
  sortBy: string;
  sortDirection: string;
}
