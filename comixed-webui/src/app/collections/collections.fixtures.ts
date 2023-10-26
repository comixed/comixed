/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { Series } from '@app/collections/models/series';
import { Issue } from '@app/collections/models/issue';
import { Publisher } from '@app/collections/models/publisher';
import { CollectionEntry } from '@app/collections/models/collection-entry';

export const PUBLISHER_1: Publisher = { name: 'Publisher 1', issueCount: 717 };

export const PUBLISHER_2: Publisher = { name: 'Publisher 2', issueCount: 129 };

export const PUBLISHER_3: Publisher = { name: 'Publisher 3', issueCount: 320 };

export const SERIES_1: Series = {
  publisher: 'Publisher 1',
  name: 'Series 1',
  volume: '2022',
  totalIssues: 717,
  inLibrary: 129
};

export const SERIES_2: Series = {
  publisher: 'Publisher 1',
  name: 'Series 2',
  volume: '2022',
  totalIssues: 717,
  inLibrary: 129
};

export const SERIES_3: Series = {
  publisher: 'Publisher 1',
  name: 'Series 3',
  volume: '2022',
  totalIssues: 717,
  inLibrary: 129
};

export const SERIES_4: Series = {
  publisher: 'Publisher 2',
  name: 'Series 4',
  volume: '2022',
  totalIssues: 717,
  inLibrary: 129
};

export const SERIES_5: Series = {
  publisher: 'Publisher 2',
  name: 'Series 5',
  volume: '2022',
  totalIssues: 717,
  inLibrary: 129
};

export const ISSUE_1: Issue = {
  id: 1,
  publisher: 'Publisher 1',
  series: 'Series 1',
  volume: '2022',
  issueNumber: '1',
  title: null,
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  found: true
};

export const ISSUE_2: Issue = {
  id: 2,
  publisher: 'Publisher 1',
  series: 'Series 1',
  volume: '2022',
  issueNumber: '2',
  title: 'The second issue',
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  found: false
};

export const ISSUE_3: Issue = {
  id: 3,
  publisher: 'Publisher 1',
  series: 'Series 1',
  volume: '2022',
  issueNumber: '3',
  title: 'The third issue',
  coverDate: new Date().getTime(),
  storeDate: new Date().getTime(),
  found: false
};

export const COLLECTION_ENTRY_1: CollectionEntry = {
  tagValue: 'tag 1',
  comicCount: Math.floor(Math.random() * 1000)
};

export const COLLECTION_ENTRY_2: CollectionEntry = {
  tagValue: 'tag 2',
  comicCount: Math.floor(Math.random() * 1000)
};

export const COLLECTION_ENTRY_3: CollectionEntry = {
  tagValue: 'tag 3',
  comicCount: Math.floor(Math.random() * 1000)
};

export const COLLECTION_ENTRY_4: CollectionEntry = {
  tagValue: 'tag 4',
  comicCount: Math.floor(Math.random() * 1000)
};

export const COLLECTION_ENTRY_5: CollectionEntry = {
  tagValue: 'tag 5',
  comicCount: Math.floor(Math.random() * 1000)
};
