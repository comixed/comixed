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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Action } from '@ngrx/store';
import { Comic, ComicFormat, Page, PageType, ScanType } from 'app/comics';
import { Actions } from '@ngrx/effects';

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
  SetPageHashBlocking = '[COMIC] Set the blocking state for a page hash',
  PageHashBlockingSet = '[COMIC] The blocking state is set for a page hash',
  SetPageHashBlockingFailed = '[COMIC] Failed to set the block state for a page hash',
  SaveComic = '[COMIC] Save changes to a comic',
  ComicSaved = '[COMIC] Changes to a comic were saved',
  SaveComicFailed = '[COMIC] Failed to save changes to a comic',
  ClearMetadata = '[COMIC] Clear the metadata from a comic',
  MetadataCleared = '[COMIC] The metadata was cleared',
  ClearMetadataFailed = '[COMIC] Failed to clear the metadata from a comic',
  DeleteComic = '[COMIC] Delete a comic from the library',
  ComicDeleted = '[COMIC] Comic deleted from the library',
  DeleteComicFailed = '[COMIC] Failed to delete comic from the library',
  ScrapeComic = '[COMIC] Scrape a single comic',
  ComicScraped = '[COMIC] Scraped a single comic',
  ScrapeComicFailed = '[COMIC] Failed to scrape a single comic'
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
  readonly type = ComicActionTypes.ComicSaved;

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
  readonly type = ComicActionTypes.ComicDeleted;

  constructor() {}
}

export class ComicDeleteFailed implements Action {
  readonly type = ComicActionTypes.DeleteComicFailed;

  constructor() {}
}

export class ComicScrape implements Action {
  readonly type = ComicActionTypes.ScrapeComic;

  constructor(
    public payload: {
      comic: Comic;
      apiKey: string;
      issueId: number;
      skipCache: boolean;
    }
  ) {}
}

export class ComicScraped implements Action {
  readonly type = ComicActionTypes.ComicScraped;

  constructor(public payload: { comic: Comic }) {}
}

export class ComicScrapeFailed implements Action {
  readonly type = ComicActionTypes.ScrapeComicFailed;

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
  | ComicScrape
  | ComicScraped
  | ComicScrapeFailed;
