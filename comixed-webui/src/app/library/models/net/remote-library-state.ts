/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

import { RemoteLibrarySegmentState } from '@app/library/models/net/remote-library-segment-state';
import { ByPublisherAndYearSegment } from '@app/library/models/net/by-publisher-and-year-segment';

export interface RemoteLibraryState {
  totalComics: number;
  unscrapedComics: number;
  deletedComics: number;
  publishers: RemoteLibrarySegmentState[];
  series: RemoteLibrarySegmentState[];
  characters: RemoteLibrarySegmentState[];
  teams: RemoteLibrarySegmentState[];
  locations: RemoteLibrarySegmentState[];
  stories: RemoteLibrarySegmentState[];
  states: RemoteLibrarySegmentState[];
  byPublisherAndYear: ByPublisherAndYearSegment[];
}
