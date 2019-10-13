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

import { ScanType } from 'app/comics/models/scan-type';
import { ComicFormat } from 'app/comics/models/comic-format';
import { Comic } from 'app/comics/models/comic';
import { LastReadDate } from 'app/library/models/last-read-date';

export interface LibraryState {
  fetchingScanTypes: boolean;
  scanTypes: ScanType[];
  fetchingFormats: boolean;
  formats: ComicFormat[];
  fetchingUpdates: boolean;
  comics: Comic[];
  lastReadDates: LastReadDate[];
  latestUpdatedDate: number;
  processingCount: number;
  rescanCount: number;
  startingRescan: boolean;
  updatingComic: boolean;
  currentComic: Comic;
  clearingMetadata: boolean;
  blockingHash: boolean;
  deletingComics: boolean;
}
