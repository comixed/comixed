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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Action } from '@ngrx/store';
import { ComicFile } from 'app/library/models/comic-file';

export enum ImportActionTypes {
  SetDirectory = '[IMPORT] Sets the directory to search',
  GetFiles = '[IMPORT] Fetch files for import',
  FilesReceived = '[IMPORT] Files fetched for import',
  GetFilesFailed = '[IMPORT] Failed to get files for import',
  Start = '[IMPORT] Begin importing files',
  Started = '[IMPORT] Files are importing',
  FailedToStart = '[IMPORT] Failed to start importing files',
  AddComicFiles = '[IMPORT] Add comic files to the selections',
  RemoveComicFiles = '[IMPORT] Remove comic files from the selection',
  ClearSelections = '[IMPORT] Remove all selected comic files'
}

export class ImportSetDirectory implements Action {
  readonly type = ImportActionTypes.SetDirectory;

  constructor(public payload: { directory: string }) {}
}

export class ImportGetFiles implements Action {
  readonly type = ImportActionTypes.GetFiles;

  constructor(public payload: { directory: string }) {}
}

export class ImportFilesReceived implements Action {
  readonly type = ImportActionTypes.FilesReceived;

  constructor(public payload: { comic_files: ComicFile[] }) {}
}

export class ImportGetFilesFailed implements Action {
  readonly type = ImportActionTypes.GetFilesFailed;

  constructor() {}
}

export class ImportStart implements Action {
  readonly type = ImportActionTypes.Start;

  constructor(
    public payload: {
      comic_files: ComicFile[];
      delete_blocked_pages: boolean;
      ignore_metadata: boolean;
    }
  ) {}
}

export class ImportStarted implements Action {
  readonly type = ImportActionTypes.Started;

  constructor() {}
}

export class ImportFailedToStart implements Action {
  readonly type = ImportActionTypes.FailedToStart;

  constructor() {}
}

export class ImportAddComicFiles implements Action {
  readonly type = ImportActionTypes.AddComicFiles;

  constructor(public payload: { comic_files: ComicFile[] }) {}
}

export class ImportRemoveComicFiles implements Action {
  readonly type = ImportActionTypes.RemoveComicFiles;

  constructor(public payload: { comic_files: ComicFile[] }) {}
}

export class ImportClearSelections implements Action {
  readonly type = ImportActionTypes.ClearSelections;

  constructor() {}
}

export type ImportActions =
  | ImportSetDirectory
  | ImportGetFiles
  | ImportFilesReceived
  | ImportGetFilesFailed
  | ImportStart
  | ImportStarted
  | ImportFailedToStart
  | ImportAddComicFiles
  | ImportRemoveComicFiles
  | ImportClearSelections;
