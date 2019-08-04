/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import { Page } from './page';
import { ComicCredit } from './comic-credit';
import { ScanType } from './scan-type';
import { ComicFormat } from './comic-format';

export interface Comic {
  id: number;
  filename: string;
  base_filename: string;
  publisher: string;
  imprint: string;
  sort_name: string;
  series: string;
  volume: string;
  issue_number: string;
  sortable_issue_number: string;
  title: string;
  story_arcs: string[];
  description: string;
  notes: string;
  summary: string;
  missing: boolean;
  archive_type: string;
  comic_vine_id: string;
  comic_vine_url: string;
  added_date: string;
  cover_date: string;
  year_published: number;
  page_count: number;
  characters: string[];
  teams: string[];
  locations: string[];
  pages: Page[];
  blocked_page_count: number;
  deleted_page_count: number;
  credits: ComicCredit[];
  scan_type: ScanType;
  format: ComicFormat;
}
