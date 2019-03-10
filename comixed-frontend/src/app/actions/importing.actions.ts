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

import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Importing } from '../models/import/importing';
import { ComicFile } from '../models/import/comic-file';

export const IMPORTING_GET_PENDING_IMPORTS = '[IMPORTING] Get the number of pending imports';
export const IMPORTING_SET_DIRECTORY = '[IMPORTING] Set the directory';
export const IMPORTING_FETCH_FILES = '[IMPORTING] Fetch files in the specified directory';
export const IMPORTING_FILES_FETCHED = '[IMPORTING] Files fetched from server';
export const IMPORTING_SELECT_FILES = '[IMPORTING] Add files to selection list';
export const IMPORTING_UNSELECT_FILES = '[IMPORTING] Remove files from selection list';
export const IMPORTING_IMPORT_FILES = '[IMPORTING] Import files';
export const IMPORTING_FILES_ARE_IMPORTING = '[IMPORTING] Files have been queued for import';

export class ImportingGetPendingImports implements Action {
  readonly type = IMPORTING_GET_PENDING_IMPORTS;

  constructor() { }
}

export class ImportingSetDirectory implements Action {
  readonly type = IMPORTING_SET_DIRECTORY;

  constructor(public payload: {
    directory: string,
  }) { }
}

export class ImportingFetchFiles implements Action {
  readonly type = IMPORTING_FETCH_FILES;

  constructor(public payload: {
    directory: string,
  }) { }
}

export class ImportingFilesFetched implements Action {
  readonly type = IMPORTING_FILES_FETCHED;

  constructor(public payload: {
    files: Array<ComicFile>,
  }) { }
}

export class ImportingSelectFiles implements Action {
  readonly type = IMPORTING_SELECT_FILES;

  constructor(public payload: {
    files: Array<ComicFile>,
  }) { }
}

export class ImportingUnselectFiles implements Action {
  readonly type = IMPORTING_UNSELECT_FILES;

  constructor(public payload: {
    files: Array<ComicFile>,
  }) { }
}

export class ImportingImportFiles implements Action {
  readonly type = IMPORTING_IMPORT_FILES;

  constructor(public payload: {
    files: Array<string>,
  }) { }
}

export class ImportingFilesAreImporting implements Action {
  readonly type = IMPORTING_FILES_ARE_IMPORTING;

  constructor() { }
}

export type Actions =
  ImportingGetPendingImports |
  ImportingSetDirectory |
  ImportingFetchFiles |
  ImportingFilesFetched |
  ImportingSelectFiles |
  ImportingUnselectFiles |
  ImportingImportFiles |
  ImportingFilesAreImporting;
