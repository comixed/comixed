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
import { COMIC_1000 } from 'app/models/comics/comic.fixtures';

export const SINGLE_COMIC_SCRAPING_STATE: SingleComicScraping = {
  busy: false,
  api_key: 'abc123',
  comic: COMIC_1000,
  series: COMIC_1000.series,
  volume: COMIC_1000.volume,
  issue_number: COMIC_1000.issue_number,
  volumes: [],
  current_volume: null,
  current_issue: null,
  data_scraped: false
};
