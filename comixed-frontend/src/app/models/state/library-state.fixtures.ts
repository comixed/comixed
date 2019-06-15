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

import { ComicGrouping, LibraryState } from './library-state';

export const EXISTING_LIBRARY: LibraryState = {
  busy: false,
  library_contents: {
    comics: [],
    rescan_count: 0,
    import_count: 0
  },
  last_comic_date: '0',
  scan_types: [],
  formats: [],
  comics: [],
  publishers: [],
  series: [],
  characters: [],
  teams: [],
  locations: [],
  story_arcs: [],
  last_read_dates: []
};

export const DEFAULT_COMIC_GROUPING: ComicGrouping = {
  name: 'grouping name',
  comic_count: 0,
  latest_comic_date: '0'
};
