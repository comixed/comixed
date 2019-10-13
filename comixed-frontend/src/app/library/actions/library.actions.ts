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
import { Comic } from '../../comics/models/comic';
import { ComicFormat } from '../../comics/models/comic-format';
import { ScanType } from '../../comics/models/scan-type';
import { LastReadDate } from 'app/library/models/last-read-date';

export enum LibraryActionTypes {
  Reset = '[LIBRARY] Reset the library',
  GetScanTypes = '[LIBRARY] Get scan types',
  ScanTypesReceived = '[LIBRARY] Got scan types',
  GetScanTypesFailed = '[LIBRARY] Failed to get scan types',
  GetFormats = '[LIBRARY] Get formats',
  FormatsReceived = '[LIBRARY] Got formats',
  GetFormatsFailed = '[LIBRARY] Failed to get formats',
  GetUpdates = '[LIBRARY] Get updates to the library',
  UpdatesReceived = '[LIBRARY] Library updates received',
  GetUpdatesFailed = '[LIBRARY] Failed to get updates',
  StartRescan = '[LIBRARY] Start rescanning the library',
  RescanStarted = '[LIBRARY] Library rescanning started',
  RescanFailedToStart = '[LIBRARY] Failed to start scanning library',
  UpdateComic = '[LIBRARY] Update a comic',
  ComicUpdated = '[LIBRARY] Comic was updated',
  UpdateComicFailed = '[LIBRARY] Failed to update comic',
  ClearMetadata = '[LIBRARY] Clear the metadata for a comic',
  MetadataCleared = '[LIBRARY] The metadata was successfully cleared',
  ClearMetadataFailed = '[LIBRARY] Failed to clear metadata',
  BlockPageHash = '[LIBRARY] Block pages',
  PageHashBlocked = '[LIBRARY] Pages were blocked',
  BlockPagesFailed = '[LIBRARY] Failed to block pages',
  DeleteMultipleComics = '[LIBRARY] Delete multiple comics',
  MultipleComicsDeleted = '[LIBRARY] Multiple comics deleted',
  DeleteMultipleComicsFailed = '[LIBRARY] Failed to delete multiple comics',
  SetCurrentComic = '[LIBRARY] Set current comic',
  FindCurrentComic = '[LIBRARY] Find the current comic'
}

export class LibraryReset implements Action {
  readonly type = LibraryActionTypes.Reset;

  constructor() {}
}

export class LibraryGetScanTypes implements Action {
  readonly type = LibraryActionTypes.GetScanTypes;

  constructor() {}
}

export class LibraryGotScanTypes implements Action {
  readonly type = LibraryActionTypes.ScanTypesReceived;

  constructor(public payload: { scanTypes: ScanType[] }) {}
}

export class LibraryGetScanTypesFailed implements Action {
  readonly type = LibraryActionTypes.GetScanTypesFailed;

  constructor() {}
}

export class LibraryGetFormats implements Action {
  readonly type = LibraryActionTypes.GetFormats;

  constructor() {}
}

export class LibraryFormatsReceived implements Action {
  readonly type = LibraryActionTypes.FormatsReceived;

  constructor(public payload: { formats: ComicFormat[] }) {}
}

export class LibraryGetFormatsFailed implements Action {
  readonly type = LibraryActionTypes.GetFormatsFailed;

  constructor() {}
}

export class LibraryGetUpdates implements Action {
  readonly type = LibraryActionTypes.GetUpdates;

  constructor(
    public payload: {
      timestamp: number;
      timeout: number;
      maximumResults: number;
    }
  ) {}
}

export class LibraryUpdatesReceived implements Action {
  readonly type = LibraryActionTypes.UpdatesReceived;

  constructor(
    public payload: {
      comics: Comic[];
      lastReadDates: LastReadDate[];
      processingCount: number;
      rescanCount: number;
    }
  ) {}
}

export class LibraryGetUpdatesFailed implements Action {
  readonly type = LibraryActionTypes.GetUpdatesFailed;

  constructor() {}
}

export class LibraryStartRescan implements Action {
  readonly type = LibraryActionTypes.StartRescan;

  constructor() {}
}

export class LibraryRescanStarted implements Action {
  readonly type = LibraryActionTypes.RescanStarted;

  constructor(public payload: { count: number }) {}
}

export class LibraryStartRescanFailed implements Action {
  readonly type = LibraryActionTypes.RescanFailedToStart;

  constructor() {}
}

export class LibraryUpdateComic implements Action {
  readonly type = LibraryActionTypes.UpdateComic;

  constructor(public payload: { comic: Comic }) {}
}

export class LibraryComicUpdated implements Action {
  readonly type = LibraryActionTypes.ComicUpdated;

  constructor(public payload: { comic: Comic }) {}
}

export class LibraryUpdateComicFailed implements Action {
  readonly type = LibraryActionTypes.UpdateComicFailed;

  constructor() {}
}

export class LibraryClearMetadata implements Action {
  readonly type = LibraryActionTypes.ClearMetadata;

  constructor(public payload: { comic: Comic }) {}
}

export class LibraryMetadataCleared implements Action {
  readonly type = LibraryActionTypes.MetadataCleared;

  constructor(public payload: { comic: Comic }) {}
}

export class LibraryClearMetadataFailed implements Action {
  readonly type = LibraryActionTypes.ClearMetadataFailed;

  constructor() {}
}

export class LibraryBlockPageHash implements Action {
  readonly type = LibraryActionTypes.BlockPageHash;

  constructor(public payload: { hash: string; blocked: boolean }) {}
}

export class LibraryPageHashBlocked implements Action {
  readonly type = LibraryActionTypes.PageHashBlocked;

  constructor(public payload: { hash: string; blocked: boolean }) {}
}

export class LibraryBlockPageHashFailed implements Action {
  readonly type = LibraryActionTypes.BlockPagesFailed;

  constructor() {}
}

export class LibraryDeleteMultipleComics implements Action {
  readonly type = LibraryActionTypes.DeleteMultipleComics;

  constructor(public payload: { ids: number[] }) {}
}

export class LibraryMultipleComicsDeleted implements Action {
  readonly type = LibraryActionTypes.MultipleComicsDeleted;

  constructor(public payload: { count: number }) {}
}

export class LibraryDeleteMultipleComicsFailed implements Action {
  readonly type = LibraryActionTypes.DeleteMultipleComicsFailed;

  constructor() {}
}

export class LibrarySetCurrentComic implements Action {
  readonly type = LibraryActionTypes.SetCurrentComic;

  constructor(public payload: { comic: Comic }) {}
}

export class LibraryFindCurrentComic implements Action {
  readonly type = LibraryActionTypes.FindCurrentComic;

  constructor(public payload: { id: number }) {}
}

export type LibraryActions =
  | LibraryReset
  | LibraryGetScanTypes
  | LibraryGotScanTypes
  | LibraryGetScanTypesFailed
  | LibraryGetFormats
  | LibraryFormatsReceived
  | LibraryGetFormatsFailed
  | LibraryGetUpdates
  | LibraryUpdatesReceived
  | LibraryGetUpdatesFailed
  | LibraryStartRescan
  | LibraryRescanStarted
  | LibraryStartRescanFailed
  | LibraryUpdateComic
  | LibraryComicUpdated
  | LibraryUpdateComicFailed
  | LibraryClearMetadata
  | LibraryMetadataCleared
  | LibraryClearMetadataFailed
  | LibraryBlockPageHash
  | LibraryPageHashBlocked
  | LibraryBlockPageHashFailed
  | LibraryDeleteMultipleComics
  | LibraryMultipleComicsDeleted
  | LibraryDeleteMultipleComicsFailed
  | LibrarySetCurrentComic
  | LibraryFindCurrentComic;
