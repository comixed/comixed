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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { Action } from '@ngrx/store';
import { ComicFile } from 'app/comic-import/models/comic-file';

export enum ComicImportActionTypes {
  SetDirectory = '[IMPORT] Set the root import directory',
  GetFiles = '[IMPORT] Get all files under a directory tree',
  FilesReceived = '[IMPORT] Received all files under a directory',
  GetFilesFailed = '[IMPORT] Failed to get all files under a directory',
  SelectFiles = '[IMPORT] Adds the provided files to the selection list',
  DeselectFiles = '[IMPORT] Removes the provided files from the selection list',
  Reset = '[IMPORT] Removes all files from the selection list',
  Start = '[IMPORT] Starts importing the selected comics',
  Started = '[IMPORT] Importing has started',
  StartFailed = '[IMPORT] Starting the import failed'
}

export class ComicImportSetDirectory implements Action {
  readonly type = ComicImportActionTypes.SetDirectory;

  constructor(public payload: { directory: string }) {}
}

export class ComicImportGetFiles implements Action {
  readonly type = ComicImportActionTypes.GetFiles;

  constructor(public payload: { directory: string }) {}
}

export class ComicImportFilesReceived implements Action {
  readonly type = ComicImportActionTypes.FilesReceived;

  constructor(public payload: { comicFiles: ComicFile[] }) {}
}

export class ComicImportGetFilesFailed implements Action {
  readonly type = ComicImportActionTypes.GetFilesFailed;

  constructor() {}
}

export class ComicImportSelectFiles implements Action {
  readonly type = ComicImportActionTypes.SelectFiles;

  constructor(public payload: { comicFiles: ComicFile[] }) {}
}

export class ComicImportDeselectFiles implements Action {
  readonly type = ComicImportActionTypes.DeselectFiles;

  constructor(public payload: { comicFiles: ComicFile[] }) {}
}

export class ComicImportReset implements Action {
  readonly type = ComicImportActionTypes.Reset;

  constructor() {}
}

export class ComicImportStart implements Action {
  readonly type = ComicImportActionTypes.Start;

  constructor(
    public payload: {
      comicFiles: ComicFile[];
      ignoreMetadata: boolean;
      deleteBlockedPages: boolean;
    }
  ) {}
}

export class ComicImportStarted implements Action {
  readonly type = ComicImportActionTypes.Started;

  constructor() {}
}

export class ComicImportStartFailed implements Action {
  readonly type = ComicImportActionTypes.StartFailed;

  constructor() {}
}

export type ComicImportActions =
  | ComicImportSetDirectory
  | ComicImportGetFiles
  | ComicImportFilesReceived
  | ComicImportGetFilesFailed
  | ComicImportSelectFiles
  | ComicImportDeselectFiles
  | ComicImportReset
  | ComicImportStart
  | ComicImportStarted
  | ComicImportStartFailed;
