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

import { Publisher } from '@app/collections/models/publisher';
import { Series } from '@app/collections/models/series';
import { CollectionEntry } from '@app/collections/models/collection-entry';
import { ComicTagType } from '@app/library/models/comic-tag-type';
import { Issue } from '@app/collections/models/issue';

export const PUBLISHER_1: Publisher = {
  name: 'The First Publisher',
  seriesCount: 5,
  issueCount: 86
};

export const SERIES_1: Series = {
  name: 'The Series Name',
  publisher: 'The Series Publisher',
  volume: '2026',
  inLibrary: 717
};

export const ISSUE_1: Issue = {
  issueId: 417,
  publisher: 'The Issue Publisher',
  series: 'The Series',
  volume: '2026',
  issueNumber: '714',
  title: 'Some cool story or another...',
  storeDate: new Date().getTime(),
  coverDate: new Date().getTime(),
  found: true
};

export const COLLECTION_ENTRY_1: CollectionEntry = {
  tagType: ComicTagType.STORY,
  tagValue: 'The Story Name',
  comicCount: 129
};
