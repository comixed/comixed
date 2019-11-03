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

import { Volume } from 'app/comics';
import { ScrapingVolume } from 'app/comics/models/scraping-volume';

export const SCRAPING_VOLUME_1000: ScrapingVolume = {
  id: 1001,
  name: 'Not Exact Comic Title',
  issueCount: 23,
  imageUrl: 'http://comixed.org/volumes/1000',
  startYear: '2010',
  publisher: 'Another ComiXed Publications'
};

export const SCRAPING_VOLUME_1001: ScrapingVolume = {
  id: 1001,
  name: 'Not Exact Comic Title',
  issueCount: 23,
  imageUrl: 'http://comixed.org/volumes/1000',
  startYear: '2010',
  publisher: 'Another ComiXed Publications'
};

export const SCRAPING_VOLUME_1002: ScrapingVolume = {
  id: 1002,
  name: '2018',
  issueCount: 23,
  imageUrl: 'http://comixed.org/volumes/1001',
  startYear: '2018',
  publisher: 'ComiXed Publications'
};

export const SCRAPING_VOLUME_1003: ScrapingVolume = {
  id: 1003,
  name: 'Exact Comic Title',
  issueCount: 23,
  imageUrl: 'http://comixed.org/volumes/1002',
  startYear: '2010',
  publisher: 'Open Source Publications'
};

export const SCRAPING_VOLUME_1004: ScrapingVolume = {
  id: 1004,
  name: 'Exact Comic Title',
  issueCount: 23,
  imageUrl: 'http://comixed.org/volumes/1002',
  startYear: '2010',
  publisher: 'Free Publications'
};

export const SCRAPING_VOLUME_1005: ScrapingVolume = {
  id: 1005,
  name: '1983',
  issueCount: 23,
  imageUrl: 'http://comixed.org/volumes/1004',
  startYear: '1983',
  publisher: 'Downloadable Publications'
};
