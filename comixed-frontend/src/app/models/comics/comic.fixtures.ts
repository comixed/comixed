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

import { Comic } from './comic';
import { FIRST_SCAN_TYPE } from './scan-type.fixtures';
import { DEFAULT_COMIC_FORMAT_1 } from './comic-format.fixtures';

export const COMIC_1000: Comic = {
  id: 1000,
  filename: '/home/comixed/library/filename-comic-1000.cbz',
  base_filename: 'filename-comic-1000',
  publisher: 'Open Source Publications',
  imprint: '',
  sort_name: 'Exact Comic Title',
  series: 'series-name',
  volume: '2019',
  issue_number: '100',
  sortable_issue_number: '00100',
  title: '',
  story_arcs: [],
  description: '',
  notes: '',
  summary: '',
  missing: false,
  archive_type: 'CBZ',
  comic_vine_id: '',
  comic_vine_url: '',
  added_date: '0',
  cover_date: '2018-01-01',
  year_published: 2019,
  page_count: 24,
  characters: ['CHARACTER1'],
  teams: [],
  locations: ['LOCATION1', 'LOCATION2'],
  pages: [],
  blocked_page_count: 0,
  deleted_page_count: 0,
  credits: [],
  scan_type: FIRST_SCAN_TYPE,
  format: DEFAULT_COMIC_FORMAT_1
};

export const COMIC_1001: Comic = {
  id: 1001,
  filename: '/home/comixed/library/filename-comic-1001.cbz',
  base_filename: 'filename-comic-1001',
  publisher: 'publisher-1001',
  imprint: '',
  sort_name: '',
  series: 'series-name',
  volume: '2019',
  issue_number: '100',
  sortable_issue_number: '00100',
  title: '',
  story_arcs: [],
  description: '',
  notes: '',
  summary: '',
  missing: false,
  archive_type: 'CBZ',
  comic_vine_id: '',
  comic_vine_url: '',
  added_date: '0',
  cover_date: '2013-10-01',
  year_published: 2019,
  page_count: 24,
  characters: ['CHARACTER1', 'CHARACTER2'],
  teams: [],
  locations: ['LOCATION3'],
  pages: [],
  blocked_page_count: 0,
  deleted_page_count: 0,
  credits: [],
  scan_type: FIRST_SCAN_TYPE,
  format: DEFAULT_COMIC_FORMAT_1
};

export const COMIC_1002: Comic = {
  id: 1002,
  filename: '/home/comixed/library/filename-comic-1002.cbz',
  base_filename: 'filename-comic-1002',
  publisher: 'Open Source Publications',
  imprint: '',
  sort_name: '',
  series: 'Exact Comic Title',
  volume: '2010',
  issue_number: '100',
  sortable_issue_number: '00100',
  title: '',
  story_arcs: [],
  description: '',
  notes: '',
  summary: '',
  missing: false,
  archive_type: 'CBZ',
  comic_vine_id: '',
  comic_vine_url: '',
  added_date: '0',
  cover_date: '2015-11-01',
  year_published: 2019,
  page_count: 24,
  characters: ['CHARACTER2', 'CHARACTER3'],
  teams: [],
  locations: ['LOCATION4', 'LOCATION2'],
  pages: [],
  blocked_page_count: 0,
  deleted_page_count: 0,
  credits: [],
  scan_type: FIRST_SCAN_TYPE,
  format: DEFAULT_COMIC_FORMAT_1
};

export const COMIC_1003: Comic = {
  id: 1003,
  filename: '/home/comixed/library/filename-comic-1003.cbz',
  base_filename: 'filename-comic-1003',
  publisher: 'publisher-1002',
  imprint: '',
  sort_name: '',
  series: 'Exact Comic Title',
  volume: '2010',
  issue_number: '100',
  sortable_issue_number: '00100',
  title: '',
  story_arcs: [],
  description: '',
  notes: '',
  summary: '',
  missing: true,
  archive_type: 'CBZ',
  comic_vine_id: '',
  comic_vine_url: '',
  added_date: '0',
  cover_date: '2018-09-01',
  year_published: 2019,
  page_count: 24,
  characters: ['CHARACTER2', 'CHARACTER3'],
  teams: [],
  locations: [],
  pages: [],
  blocked_page_count: 0,
  deleted_page_count: 0,
  credits: [],
  scan_type: FIRST_SCAN_TYPE,
  format: DEFAULT_COMIC_FORMAT_1
};

export const COMIC_1004: Comic = {
  id: 1003,
  filename: '/home/comixed/library/filename-comic-1004.cbz',
  base_filename: 'filename-comic-1004',
  publisher: 'publisher-1002',
  imprint: '',
  sort_name: '',
  series: 'series-name',
  volume: '2019',
  issue_number: '100',
  sortable_issue_number: '00100',
  title: '',
  story_arcs: [],
  description: '',
  notes: '',
  summary: '',
  missing: true,
  archive_type: 'CBZ',
  comic_vine_id: '',
  comic_vine_url: '',
  added_date: '0',
  cover_date: '2018-09-01',
  year_published: 2019,
  page_count: 24,
  characters: ['CHARACTER2', 'CHARACTER3'],
  teams: [],
  locations: [],
  pages: [],
  blocked_page_count: 0,
  deleted_page_count: 0,
  credits: [],
  scan_type: FIRST_SCAN_TYPE,
  format: DEFAULT_COMIC_FORMAT_1
};
