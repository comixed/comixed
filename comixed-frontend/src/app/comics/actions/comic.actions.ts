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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Action } from '@ngrx/store';
import { Comic, ComicFormat, Page, PageType, ScanType } from 'app/comics';

export enum ComicActionTypes {
  GetScanTypes = '[COMIC] Get the set of scan types',
  GotScanTypes = '[COMIC] Got the scan types',
  GetScanTypesFailed = '[COMIC] Failed to get the set of scan types',
  GetFormats = '[COMIC] Get the set of formats',
  GotFormats = '[COMIC] Got the set of formats',
  GetFormatsFailed = '[COMIC] Failed to get the set of formats',
  GetPageTypes = '[COMIC] Get the set of page types',
  GotPageTypes = '[COMIC] Got the page types',
  GetPageTypesFailed = '[COMIC] Failed to get the set of page types',
  GetIssue = '[COMIC] Get a single issue',
  GotIssue = '[COMIC] Got a single issue',
  GetIssueFailed = '[COMIC] Failed to get a single issue',
  SavePage = '[COMIC] Save a single page',
  PageSaved = '[COMIC] Page was saved',
  SavePageFailed = '[COMIC] Page was not saved',
  SetPageType = '[COMIC] Set the page type',
  PageTypeSet = '[COMIC] The page type is set',
  SetPageDeleted = '[COMIC] Set the deleted state for a page',
  PageDeletedSet = '[COMIC] The deleted state for a page is set',
  SetPageDeletedFailed = '[COMIC] Failed to set the deleted state for a page',
  SetPageTypeFailed = '[COMIC] Set the page type failed',
  SetPageHashBlocking = '[COMIC] Set the blocking state for a page hash',
  PageHashBlockingSet = '[COMIC] The blocking state is set for a page hash',
  SetPageHashBlockingFailed = '[COMIC] Failed to set the block state for a page hash',
  SaveComic = '[COMIC] Save changes to a comic',
  SaveComicSucceeded = '[COMIC] Changes to a comic were saved',
  SaveComicFailed = '[COMIC] Failed to save changes to a comic',
  ClearMetadata = '[COMIC] Clear the metadata from a comic',
  MetadataCleared = '[COMIC] The metadata was cleared',
  ClearMetadataFailed = '[COMIC] Failed to clear the metadata from a comic',
  DeleteComic = '[COMIC] Delete a comic from the library',
  DeleteComicSucceeded = '[COMIC] Comic deleted from the library',
  DeleteComicFailed = '[COMIC] Failed to delete comic from the library',
  RestoreComic = '[COMIC] Unmark a comic for deletion',
  RestoreComicSucceeded = '[COMIC] Comic unmarked for deletion',
  RestoreComicFailed = '[COMIC] Failed to unmark a comic for deletion',
  MarkAsRead = '[COMIC] Change the read state of a comic',
  MarkedAsRead = '[COMIC} The read state of a comic was changed',
  MarkAsReadFailed = '[COMIC] Changing the read state of a comic failed'
}

export class ComicGetScanTypes implements Action {
  readonly type = ComicActionTypes.GetScanTypes;

  constructor() {}
}

export class ComicGotScanTypes implements Action {
  readonly type = ComicActionTypes.GotScanTypes;

  constructor(public payload: { scanTypes: ScanType[] }) {}
}

export class ComicGetScanTypesFailed implements Action {
  readonly type = ComicActionTypes.GetScanTypesFailed;

  constructor() {}
}

export class ComicGetFormats implements Action {
  readonly type = ComicActionTypes.GetFormats;

  constructor() {}
}

export class ComicGotFormats implements Action {
  readonly type = ComicActionTypes.GotFormats;

  constructor(public payload: { formats: ComicFormat[] }) {}
}

export class ComicGetFormatsFailed implements Action {
  readonly type = ComicActionTypes.GetFormatsFailed;

  constructor() {}
}

export class ComicGetPageTypes implements Action {
  readonly type = ComicActionTypes.GetPageTypes;

  constructor() {}
}

export class ComicGotPageTypes implements Action {
  readonly type = ComicActionTypes.GotPageTypes;

  constructor(public payload: { pageTypes: PageType[] }) {}
}

export class ComicGetPageTypesFailed implements Action {
  readonly type = ComicActionTypes.GetPageTypesFailed;

  constructor() {}
}

export class ComicGetIssue implements Action {
  readonly type = ComicActionTypes.GetIssue;

  constructor(public payload: { id: number }) {}
}

export class ComicGotIssue implements Action {
  readonly type = ComicActionTypes.GotIssue;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicGetIssueFailed implements Action {
  readonly type = ComicActionTypes.GetIssueFailed;

  constructor() {}
}

export class ComicSavePage implements Action {
  readonly type = ComicActionTypes.SavePage;

  constructor(public payload: { page: Page }) {}
}

export class ComicPageSaved implements Action {
  readonly type = ComicActionTypes.PageSaved;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicSavePageFailed implements Action {
  readonly type = ComicActionTypes.SavePageFailed;

  constructor() {}
}

export class ComicSetPageType implements Action {
  readonly type = ComicActionTypes.SetPageType;

  constructor(public payload: { page: Page; pageType: PageType }) {}
}

export class ComicPageTypeSet implements Action {
  readonly type = ComicActionTypes.PageTypeSet;

  constructor(public payload: { page: Page }) {}
}

export class ComicSetPageTypeFailed implements Action {
  readonly type = ComicActionTypes.SetPageTypeFailed;

  constructor() {}
}

export class ComicSetPageDeleted implements Action {
  readonly type = ComicActionTypes.SetPageDeleted;

  constructor(public payload: { page: Page; deleted: boolean }) {}
}

export class ComicPageDeletedSet implements Action {
  readonly type = ComicActionTypes.PageDeletedSet;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicSetPageDeletedFailed implements Action {
  readonly type = ComicActionTypes.SetPageDeletedFailed;

  constructor() {}
}

export class ComicSetPageHashBlocking implements Action {
  readonly type = ComicActionTypes.SetPageHashBlocking;

  constructor(public payload: { page: Page; state: boolean }) {}
}

export class ComicPageHashBlockingSet implements Action {
  readonly type = ComicActionTypes.PageHashBlockingSet;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicSetPageHashBlockingFailed implements Action {
  readonly type = ComicActionTypes.SetPageHashBlockingFailed;

  constructor() {}
}

export class ComicSave implements Action {
  readonly type = ComicActionTypes.SaveComic;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicSaved implements Action {
  readonly type = ComicActionTypes.SaveComicSucceeded;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicSaveFailed implements Action {
  readonly type = ComicActionTypes.SaveComicFailed;

  constructor() {}
}

export class ComicClearMetadata implements Action {
  readonly type = ComicActionTypes.ClearMetadata;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicMetadataCleared implements Action {
  readonly type = ComicActionTypes.MetadataCleared;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicClearMetadataFailed implements Action {
  readonly type = ComicActionTypes.ClearMetadataFailed;

  constructor() {}
}

export class ComicDelete implements Action {
  readonly type = ComicActionTypes.DeleteComic;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicDeleted implements Action {
  readonly type = ComicActionTypes.DeleteComicSucceeded;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicDeleteFailed implements Action {
  readonly type = ComicActionTypes.DeleteComicFailed;

  constructor() {}
}

export class ComicRestore implements Action {
  readonly type = ComicActionTypes.RestoreComic;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicRestored implements Action {
  readonly type = ComicActionTypes.RestoreComicSucceeded;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicRestoreFailed implements Action {
  readonly type = ComicActionTypes.RestoreComicFailed;

  constructor() {}
}

export class ComicMarkAsRead implements Action {
  readonly type = ComicActionTypes.MarkAsRead;

  constructor(public payload: { comic: Comic; read: boolean }) {}
}

export class ComicMarkedAsRead implements Action {
  readonly type = ComicActionTypes.MarkedAsRead;

  constructor(public payload: { lastRead: number }) {}
}

export class ComicMarkAsReadFailed implements Action {
  readonly type = ComicActionTypes.MarkAsReadFailed;

  constructor() {}
}

export type ComicActions =
  | ComicGetScanTypes
  | ComicGotScanTypes
  | ComicGetScanTypesFailed
  | ComicGetFormats
  | ComicGotFormats
  | ComicGetFormatsFailed
  | ComicGetPageTypes
  | ComicGotPageTypes
  | ComicGetPageTypesFailed
  | ComicGetIssue
  | ComicGotIssue
  | ComicGetIssueFailed
  | ComicSavePage
  | ComicPageSaved
  | ComicSavePageFailed
  | ComicSetPageType
  | ComicPageTypeSet
  | ComicSetPageTypeFailed
  | ComicSetPageDeleted
  | ComicPageDeletedSet
  | ComicSetPageDeletedFailed
  | ComicSetPageHashBlocking
  | ComicPageHashBlockingSet
  | ComicSetPageHashBlockingFailed
  | ComicSave
  | ComicSaved
  | ComicSaveFailed
  | ComicClearMetadata
  | ComicMetadataCleared
  | ComicClearMetadataFailed
  | ComicDelete
  | ComicDeleted
  | ComicDeleteFailed
  | ComicRestore
  | ComicRestored
  | ComicRestoreFailed
  | ComicMarkAsRead
  | ComicMarkedAsRead
  | ComicMarkAsReadFailed;
