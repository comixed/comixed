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

import { Comic } from "../comics/comic";
import { LibraryState } from "../library-state";
import { LastReadDate } from "../comics/last-read-date";
import { ScanType } from "../comics/scan-type";
import { ComicFormat } from "../comics/comic-format";

export interface ComicGrouping {
  name: string;
  comic_count: number;
  latest_comic_date: string;
}

export interface Library {
  busy: boolean;
  library_state: LibraryState;
  last_comic_date: string;
  scan_types: Array<ScanType>;
  formats: Array<ComicFormat>;
  comics: Array<Comic>;
  publishers: Array<ComicGrouping>;
  series: Array<ComicGrouping>;
  last_read_dates: Array<LastReadDate>;
}
