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

import { VolumeMetadata } from '@app/comic-metadata/models/volume-metadata';
import { IssueMetadata } from '@app/comic-metadata/models/issue-metadata';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { MetadataAuditLogEntry } from '@app/comic-metadata/models/metadata-audit-log-entry';
import { COMIC_BOOK_1 } from '@app/comic-books/comic-books.fixtures';

export const METADATA_SOURCE_1: MetadataSource = {
  id: 1,
  beanName: 'farkleVineScrapingAdaptor',
  name: 'Farkle ComicBook Data',
  properties: [{ name: 'property.name', value: 'property.value' }]
};

export const SCRAPING_VOLUME_1: VolumeMetadata = {
  id: '19352',
  name: 'Scraping Series 1',
  publisher: 'Publisher 1',
  startYear: '2000',
  imageUrl: 'http://sitecom/what',
  issueCount: 17,
  metadataSource: METADATA_SOURCE_1
};

export const SCRAPING_VOLUME_2: VolumeMetadata = {
  id: '12395',
  name: 'Scraping Series 2',
  publisher: 'Publisher 1',
  startYear: '2010',
  imageUrl: 'http://sitecom/what',
  issueCount: 17,
  metadataSource: METADATA_SOURCE_1
};
export const SCRAPING_VOLUME_3: VolumeMetadata = {
  id: '39823',
  name: 'Scraping Series 3',
  publisher: 'Publisher 1',
  startYear: '2020',
  imageUrl: 'http://sitecom/what',
  issueCount: 17,
  metadataSource: METADATA_SOURCE_1
};

export const SCRAPING_ISSUE_1: IssueMetadata = {
  id: '17239',
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  coverUrl: 'http://localhost/scraping-issue-cover',
  volumeName: '2020',
  name: 'Scraping Series 1',
  issueNumber: '27',
  description: 'This is my scraping issue.'
};

export const METADATA_AUDIT_LOG_ENTRY_1: MetadataAuditLogEntry = {
  metadataSource: METADATA_SOURCE_1,
  comic: COMIC_BOOK_1,
  referenceId: '13245',
  createdOn: new Date().getTime()
};
