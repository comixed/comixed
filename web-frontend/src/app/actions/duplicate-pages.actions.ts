/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import { Action } from '@ngrx/store';
import { DuplicatePage } from '../models/comics/duplicate-page';

export const DUPLICATE_PAGES_FETCH_PAGES = '[DUPLICATE PAGES] Fetch list of pages';
export const DUPLICATE_PAGES_SET_PAGES = '[DUPLICATE PAGES] Set list of pages';
export const DUPLICATE_PAGES_DELETE_ALL = '[DUPLICATE PAGES] Delete all pages for a hash';
export const DUPLICATE_PAGES_DELETED_FOR_HASH = '[DUPLICATE PAGES] Deletion count for hash';
export const DUPLICATE_PAGES_UNDELETE_ALL = '[DUPLICATE PAGES] Undelete all pages for a hash';
export const DUPLICATE_PAGES_UNDELETED_FOR_HASH = '[DUPLICATE PAGES] Undeletion count for a hash';
export const DUPLICATE_PAGES_BLOCK_HASH = '[DUPLICATE PAGES] Block a hash';
export const DUPLICATE_PAGES_UNBLOCK_HASH = '[DUPLICATES PAGES] Unblock a hash';
export const DUPLICATE_PAGES_BLOCKED_HASH = '[DUPLICATE PAGES] Update hash blocked status';

export class DuplicatePagesFetchPages implements Action {
  readonly type = DUPLICATE_PAGES_FETCH_PAGES;

  constructor() { }
}

export class DuplicatePagesSetPages implements Action {
  readonly type = DUPLICATE_PAGES_SET_PAGES;

  constructor(public payload: Array<DuplicatePage>) { }
}

export class DuplicatePagesDeleteAll implements Action {
  readonly type = DUPLICATE_PAGES_DELETE_ALL;

  constructor(public payload: string) { }
}

export class DuplicatePagesDeletedForHash implements Action {
  readonly type = DUPLICATE_PAGES_DELETED_FOR_HASH;

  constructor(public payload: {
    count: number,
    hash: string,
  }) { }
}

export class DuplicatePagesUndeleteAll implements Action {
  readonly type = DUPLICATE_PAGES_UNDELETE_ALL;

  constructor(public payload: string) { }
}

export class DuplicatePagesUndeletedForHash implements Action {
  readonly type = DUPLICATE_PAGES_UNDELETED_FOR_HASH;

  constructor(public payload: {
    count: number,
    hash: string,
  }) { }
}

export class DuplicatePagesBlockHash implements Action {
  readonly type = DUPLICATE_PAGES_BLOCK_HASH;

  constructor(public payload: string) { }
}

export class DuplicatePagesUnblockHash implements Action {
  readonly type = DUPLICATE_PAGES_UNBLOCK_HASH;

  constructor(public payload: string) { }
}

export class DuplicatePagesBlockedHash implements Action {
  readonly type = DUPLICATE_PAGES_BLOCKED_HASH;

  constructor(public payload: {
    blocked: boolean,
    hash: string,
  }) { }
}

export type Actions =
  DuplicatePagesFetchPages |
  DuplicatePagesSetPages |
  DuplicatePagesDeleteAll |
  DuplicatePagesDeletedForHash |
  DuplicatePagesUndeleteAll |
  DuplicatePagesUndeletedForHash |
  DuplicatePagesBlockHash |
  DuplicatePagesUnblockHash |
  DuplicatePagesBlockedHash;
