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

import { BlockedPage } from './models/blocked-page';
import { DownloadDocument } from '@app/core/models/download-document';

export const BLOCKED_PAGE_1: BlockedPage = {
  id: 1,
  label: 'First Blocked Page',
  hash: '9C5E632CD9F33A991B11B9115FDBDC85',
  comicCount: 5,
  createdOn: new Date().getTime()
};

export const BLOCKED_PAGE_2: BlockedPage = {
  id: 2,
  label: 'Second Blocked Page',
  hash: '9C5E632CD9F33A991B11B9115FDBDC82',
  comicCount: 5,
  createdOn: new Date().getTime()
};

export const BLOCKED_PAGE_3: BlockedPage = {
  id: 3,
  label: 'Third Blocked Page',
  hash: '9C5E632CD9F33A991B11B9115FDBDC83',
  comicCount: 5,
  createdOn: new Date().getTime()
};

export const BLOCKED_PAGE_4: BlockedPage = {
  id: 4,
  label: 'Fourth Blocked Page',
  hash: '9C5E632CD9F33A991B11B9115FDBDC84',
  comicCount: 5,
  createdOn: new Date().getTime()
};

export const BLOCKED_PAGE_5: BlockedPage = {
  id: 5,
  label: 'Fifth Blocked Page',
  hash: '9C5E632CD9F33A991B11B9115FDBDC84',
  comicCount: 5,
  createdOn: new Date().getTime()
};

export const BLOCKED_PAGE_FILE: DownloadDocument = {
  filename: 'Blocked pages.csv',
  mediaType: 'text/csv',
  content: 'blahblahblahblahblahblahblahblahblah'
};
