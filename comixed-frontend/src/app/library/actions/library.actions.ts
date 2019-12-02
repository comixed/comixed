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
import { Comic } from '../../comics/models/comic';
import { LastReadDate } from 'app/library/models/last-read-date';

export enum LibraryActionTypes {
  Reset = '[LIBRARY] Reset the library',
  GetComics = '[LIBRARY] Get one page of comics',
  ComicsReceived = '[LIBRARY] Received one page of comics',
  GetComicsFailed = '[LIBRARY] Failed to get one page of comics',
  GetUpdates = '[LIBRARY] Get updates to the library',
  UpdatesReceived = '[LIBRARY] Library updates received',
  GetUpdatesFailed = '[LIBRARY] Failed to get updates',
  StartRescan = '[LIBRARY] Start rescanning the library',
  RescanStarted = '[LIBRARY] Library rescanning started',
  RescanFailedToStart = '[LIBRARY] Failed to start scanning library',
  DeleteMultipleComics = '[LIBRARY] Delete multiple comics',
  MultipleComicsDeleted = '[LIBRARY] Multiple comics deleted',
  DeleteMultipleComicsFailed = '[LIBRARY] Failed to delete multiple comics'
}

export class LibraryReset implements Action {
  readonly type = LibraryActionTypes.Reset;

  constructor() {}
}

export class LibraryGetComics implements Action {
  readonly type = LibraryActionTypes.GetComics;

  constructor(
    public payload: {
      page: number;
      count: number;
      sortField: string;
      ascending: boolean;
    }
  ) {}
}

export class LibraryComicsReceived implements Action {
  readonly type = LibraryActionTypes.ComicsReceived;

  constructor(
    public payload: {
      comics: Comic[];
      lastReadDates: LastReadDate[];
      lastUpdatedDate: Date;
      comicCount: number;
    }
  ) {}
}

export class LibraryGetComicsFailed implements Action {
  readonly type = LibraryActionTypes.GetComicsFailed;

  constructor() {}
}

export class LibraryGetUpdates implements Action {
  readonly type = LibraryActionTypes.GetUpdates;

  constructor(
    public payload: {
      timestamp: number;
      timeout: number;
      maximumResults: number;
      lastProcessingCount: number;
      lastRescanCount: number;
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

export type LibraryActions =
  | LibraryReset
  | LibraryGetComics
  | LibraryComicsReceived
  | LibraryGetComicsFailed
  | LibraryGetUpdates
  | LibraryUpdatesReceived
  | LibraryGetUpdatesFailed
  | LibraryStartRescan
  | LibraryRescanStarted
  | LibraryStartRescanFailed
  | LibraryDeleteMultipleComics
  | LibraryMultipleComicsDeleted
  | LibraryDeleteMultipleComicsFailed;
