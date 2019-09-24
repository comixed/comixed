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

import { SingleComicScraping } from './single-comic-scraping';
import { COMIC_1 } from 'app/library';

export const SINGLE_COMIC_SCRAPING_STATE: SingleComicScraping = {
  busy: false,
  api_key: 'abc123',
  comic: COMIC_1,
  series: COMIC_1.series,
  volume: COMIC_1.volume,
  issue_number: COMIC_1.issueNumber,
  volumes: [],
  current_volume: null,
  current_issue: null,
  data_scraped: false
};
