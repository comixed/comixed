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

import { BlockedHash } from './models/blocked-hash';
import { DownloadDocument } from '@app/core/models/download-document';
import { Page } from '@app/comic-book/models/page';

export const BLOCKED_HASH_1: BlockedHash = {
  id: 1,
  label: 'First Blocked Hash',
  hash: '9C5E632CD9F33A991B11B9115FDBDC85',
  comicCount: 5,
  createdOn: new Date().getTime()
};

export const BLOCKED_HASH_2: BlockedHash = {
  id: 2,
  label: 'Second Blocked Hash',
  hash: '9C5E632CD9F33A991B11B9115FDBDC82',
  comicCount: 5,
  createdOn: new Date().getTime()
};

export const BLOCKED_HASH_3: BlockedHash = {
  id: 3,
  label: 'Third Blocked Hash',
  hash: '9C5E632CD9F33A991B11B9115FDBDC83',
  comicCount: 5,
  createdOn: new Date().getTime()
};

export const BLOCKED_HASH_4: BlockedHash = {
  id: 4,
  label: 'Fourth Blocked Hash',
  hash: '9C5E632CD9F33A991B11B9115FDBDC84',
  comicCount: 5,
  createdOn: new Date().getTime()
};

export const BLOCKED_HASH_5: BlockedHash = {
  id: 5,
  label: 'Fifth Blocked Hash',
  hash: '9C5E632CD9F33A991B11B9115FDBDC84',
  comicCount: 5,
  createdOn: new Date().getTime()
};

export const BLOCKED_PAGE_FILE: DownloadDocument = {
  filename: 'Blocked Hashes.csv',
  mediaType: 'text/csv',
  content: 'blahblahblahblahblahblahblahblahblah'
};

export const PAGE_1: Page = {
  id: 1000,
  filename: 'firstpage.png',
  hash: 'abcdef1234567890',
  pageNumber: 1,
  width: 1080,
  height: 1920,
  deleted: false,
  blocked: false,
  index: 0
};

export const PAGE_2: Page = {
  id: 1001,
  filename: 'firstpage.png',
  hash: 'abcdef1234567891',
  pageNumber: 2,
  width: 1080,
  height: 1920,
  deleted: false,
  blocked: false,
  index: 0
};

export const PAGE_3: Page = {
  id: 1002,
  filename: 'firstpage.png',
  hash: 'abcdef1234567892',
  pageNumber: 3,
  width: 1080,
  height: 1920,
  deleted: false,
  blocked: false,
  index: 0
};

export const PAGE_4: Page = {
  id: 1003,
  filename: 'firstpage.png',
  hash: 'abcdef1234567893',
  pageNumber: 4,
  width: 1080,
  height: 1920,
  deleted: false,
  blocked: false,
  index: 0
};
