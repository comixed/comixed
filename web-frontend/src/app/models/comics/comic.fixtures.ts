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

import { Comic } from "./comic";
import { DEFAULT_SCAN_TYPE } from "./scan-type.fixtures";
import { DEFAULT_COMIC_FORMAT } from "./comic-format.fixtures";

export const REGULAR_COMIC: Comic = {
  id: 1000,
  filename: "/home/comixed/library/ultimate-comic-file.cbz",
  base_filename: "ultimate-comic-file",
  publisher: "Donut Comics",
  imprint: "",
  sort_name: "",
  series: "series-name",
  volume: "2019",
  issue_number: "100",
  title: "",
  story_arcs: [],
  description: "",
  notes: "",
  summary: "",
  missing: false,
  archive_type: "CBZ",
  comic_vine_id: "",
  comic_vine_url: "",
  added_date: "0",
  cover_date: "0",
  year_published: 2019,
  page_count: 24,
  characters: [],
  teams: [],
  locations: [],
  pages: [],
  blocked_page_count: 0,
  deleted_page_count: 0,
  credits: [],
  scan_type: DEFAULT_SCAN_TYPE,
  format: DEFAULT_COMIC_FORMAT
};
