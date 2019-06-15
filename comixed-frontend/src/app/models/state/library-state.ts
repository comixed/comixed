/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Comic } from 'app/models/comics/comic';
import { LastReadDate } from 'app/models/comics/last-read-date';
import { ScanType } from 'app/models/comics/scan-type';
import { ComicFormat } from 'app/models/comics/comic-format';
import { LibraryContents } from 'app/models/library-contents';

export interface ComicGrouping {
  name: string;
  comic_count: number;
  latest_comic_date: string;
}

export interface LibraryState {
  busy: boolean;
  library_contents: LibraryContents;
  last_comic_date: string;
  scan_types: Array<ScanType>;
  formats: Array<ComicFormat>;
  comics: Array<Comic>;
  publishers: Array<ComicGrouping>;
  series: Array<ComicGrouping>;
  characters: Array<ComicGrouping>;
  teams: Array<ComicGrouping>;
  locations: Array<ComicGrouping>;
  story_arcs: Array<ComicGrouping>;
  last_read_dates: Array<LastReadDate>;
}
