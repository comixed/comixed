/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { ScrapingVolume } from '@app/comic-metadata/models/scraping-volume';
import { ScrapingIssue } from '@app/comic-metadata/models/scraping-issue';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';

export const METADATA_SOURCE_1: MetadataSource = {
  id: 1,
  beanName: 'farkleVineScrapingAdaptor',
  name: 'Farkle Comic Data',
  properties: []
};

export const SCRAPING_VOLUME_1: ScrapingVolume = {
  id: 1,
  name: 'Scraping Series 1',
  publisher: 'Publisher 1',
  startYear: '2000',
  imageUrl: 'http://sitecom/what',
  issueCount: 17,
  metadataSource: METADATA_SOURCE_1
};
export const SCRAPING_VOLUME_2: ScrapingVolume = {
  id: 2,
  name: 'Scraping Series 2',
  publisher: 'Publisher 1',
  startYear: '2010',
  imageUrl: 'http://sitecom/what',
  issueCount: 17,
  metadataSource: METADATA_SOURCE_1
};
export const SCRAPING_VOLUME_3: ScrapingVolume = {
  id: 3,
  name: 'Scraping Series 3',
  publisher: 'Publisher 1',
  startYear: '2020',
  imageUrl: 'http://sitecom/what',
  issueCount: 17,
  metadataSource: METADATA_SOURCE_1
};
export const SCRAPING_ISSUE_1: ScrapingIssue = {
  id: 1,
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  coverUrl: 'http://localhost/scraping-issue-cover',
  volumeName: '2020',
  name: 'Scraping Series 1',
  issueNumber: '27',
  description: 'This is my scraping issue.'
};
