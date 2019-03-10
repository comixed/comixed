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
import { Page } from '../models/comics/page';

export const DUPLICATE_PAGES_FETCH_PAGES = '[DUPLICATE PAGES] Fetch list of pages';
export const DUPLICATE_PAGES_SET_PAGES = '[DUPLICATE PAGES] Set list of pages';
export const DUPLICATE_PAGES_DELETE_ALL = '[DUPLICATE PAGES] Delete all pages for a hash';
export const DUPLICATE_PAGES_DELETED_FOR_HASH = '[DUPLICATE PAGES] Deletion count for hash';
export const DUPLICATE_PAGES_UNDELETE_ALL = '[DUPLICATE PAGES] Undelete all pages for a hash';
export const DUPLICATE_PAGES_UNDELETED_FOR_HASH = '[DUPLICATE PAGES] Undeletion count for a hash';
export const DUPLICATE_PAGES_BLOCK_HASH = '[DUPLICATE PAGES] Block a hash';
export const DUPLICATE_PAGES_UNBLOCK_HASH = '[DUPLICATES PAGES] Unblock a hash';
export const DUPLICATE_PAGES_BLOCKED_HASH = '[DUPLICATE PAGES] Update hash blocked status';
export const DUPLICATE_PAGES_SHOW_COMICS_WITH_HASH = '[DUPLICATE PAGES] Show comics with a given hash';
export const DUPLICATE_PAGES_SHOW_ALL_PAGES = '[DUPLICATE PAGES] Show all pages';
export const DUPLICATE_PAGES_DELETE_PAGE = '[DUPLICATE PAGES] Delete page';
export const DUPLICATE_PAGES_PAGE_DELETED = '[DUPLICATE PAGES] Page deleted';
export const DUPLICATE_PAGES_UNDELETE_PAGE = '[DUPLICATE PAGES] Undelete page';
export const DUPLICATE_PAGES_PAGE_UNDELETED = '[DUPLICATE PAGES] Page undeleted';

export class DuplicatePagesFetchPages implements Action {
  readonly type = DUPLICATE_PAGES_FETCH_PAGES;

  constructor() { }
}

export class DuplicatePagesSetPages implements Action {
  readonly type = DUPLICATE_PAGES_SET_PAGES;

  constructor(public payload: {
    duplicate_pages: Array<DuplicatePage>,
  }) { }
}

export class DuplicatePagesDeleteAll implements Action {
  readonly type = DUPLICATE_PAGES_DELETE_ALL;

  constructor(public payload: {
    hash: string,
  }) { }
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

  constructor(public payload: {
    hash: string,
  }) { }
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

  constructor(public payload: {
    hash: string,
  }) { }
}

export class DuplicatePagesUnblockHash implements Action {
  readonly type = DUPLICATE_PAGES_UNBLOCK_HASH;

  constructor(public payload: {
    hash: string,
  }) { }
}

export class DuplicatePagesBlockedHash implements Action {
  readonly type = DUPLICATE_PAGES_BLOCKED_HASH;

  constructor(public payload: {
    blocked: boolean,
    hash: string,
  }) { }
}

export class DuplicatePagesShowComicsWithHash implements Action {
  readonly type = DUPLICATE_PAGES_SHOW_COMICS_WITH_HASH;

  constructor(public payload: {
    hash: string,
  }) { }
}

export class DuplicatePagesShowAllPages implements Action {
  readonly type = DUPLICATE_PAGES_SHOW_ALL_PAGES;

  constructor() { }
}

export class DuplicatePagesDeletePage implements Action {
  readonly type = DUPLICATE_PAGES_DELETE_PAGE;

  constructor(public payload: {
    page: Page,
  }) { }
}

export class DuplicatePagesPageDeleted implements Action {
  readonly type = DUPLICATE_PAGES_PAGE_DELETED;

  constructor(public payload: {
    count: number,
    page: Page,
  }) { }
}

export class DuplicatePagesUndeletePage implements Action {
  readonly type = DUPLICATE_PAGES_UNDELETE_PAGE;

  constructor(public payload: {
    page: Page,
  }) { }
}

export class DuplicatePagesPageUndeleted implements Action {
  readonly type = DUPLICATE_PAGES_PAGE_UNDELETED;

  constructor(public payload: {
    count: number,
    page: Page,
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
  DuplicatePagesBlockedHash |
  DuplicatePagesShowComicsWithHash |
  DuplicatePagesShowAllPages |
  DuplicatePagesDeletePage |
  DuplicatePagesUndeletePage |
  DuplicatePagesPageDeleted |
  DuplicatePagesPageUndeleted;
