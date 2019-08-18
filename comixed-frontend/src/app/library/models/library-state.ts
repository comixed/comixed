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

import { ScanType } from 'app/library/models/scan-type';
import { ComicFormat } from 'app/library/models/comic-format';
import { Comic } from 'app/library/models/comic';
import { LastReadDate } from 'app/library/models/last-read-date';

export interface LibraryState {
  fetching_scan_types: boolean;
  scan_types: ScanType[];
  fetching_formats: boolean;
  formats: ComicFormat[];
  fetching_updates: boolean;
  comics: Comic[];
  last_read_dates: LastReadDate[];
  latest_updated_date: number;
  pending_imports: number;
  pending_rescans: number;
  starting_rescan: boolean;
  updating_comic: boolean;
  current_comic: Comic;
  clearing_metadata: boolean;
  blocking_hash: boolean;
  deleting_multiple_comics: boolean;
}
