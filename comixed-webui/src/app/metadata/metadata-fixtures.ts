/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { MetadataSource } from '@app/metadata/models/metadata-source';
import { ScrapingVolume } from '@app/metadata/models/scraping-volume';
import { ScrapingIssue } from '@app/metadata/models/scraping-issue';

export const METADATA_SOURCE_1: MetadataSource = {
  metadataSourceId: 3000,
  name: 'The Metadata Source',
  version: '1.0.1',
  available: true,
  homepage: 'http://the-metadata-source',
  preferred: false,
  properties: [{ name: 'metadata-source.property-1', value: 'something' }]
};

export const METADATA_SOURCE_2: MetadataSource = {
  metadataSourceId: 3001,
  name: 'The Other Metadata Source',
  version: '1.0.2',
  available: true,
  homepage: 'http://the-metadata-source',
  preferred: false,
  properties: [{ name: 'metadata-source.property-1', value: 'something else' }]
};

export const SCRAPING_VOLUME_1: ScrapingVolume = {
  id: '9000',
  publisher: 'The Publisher',
  name: 'The Series Name',
  startYear: '2026',
  issueCount: 73,
  imageUrl: 'http://localhost/scraping-volume-1',
  metadataSource: METADATA_SOURCE_1
};

export const SCRAPING_VOLUME_2: ScrapingVolume = {
  id: '9001',
  publisher: 'The Publisher',
  name: 'The Other Series Name',
  startYear: '2026',
  issueCount: 37,
  imageUrl: 'http://localhost/scraping-volume-2',
  metadataSource: METADATA_SOURCE_2
};

export const SCRAPING_ISSUE_1: ScrapingIssue = {
  id: '5000',
  name: 'Scraping Series 1',
  volumeName: '2020',
  issueNumber: '27',
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  coverUrl: 'http://localhost/scraping-issue-cover',
  description: 'This is a test scraping issue.'
};
