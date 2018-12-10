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
import { Library } from '../models/library';
import { Comic } from '../models/comics/comic';
import { ScanType } from '../models/comics/scan-type';

export const LIBRARY_GET_SCAN_TYPES = '[LIBRARY] Fetch the scan types';
export const LIBRARY_SET_SCAN_TYPES = '[LIBRARY] Set the scan types';
export const LIBRARY_SET_SCAN_TYPE = '[LIBRARY] Set the scan type for a comic';
export const LIBRARY_SCAN_TYPE_SET = '[LIBRARY] The scan type is set';
export const LIBRARY_FETCH_LIBRARY_CHANGES = '[LIBRARY] Fetch changes to the library';
export const LIBRARY_MERGE_NEW_COMICS = '[LIBRARY] Merge newly retrieved comics';
export const LIBRARY_UPDATE_COMIC = '[LIBRARY] Update a single comic';
export const LIBRARY_REMOVE_COMIC = '[LIBRARY] Remove comic';
export const LIBRARY_UPDATE_COMICS_REMOVE_COMIC = '[LIBRARY] Update comics by removing a comic';
export const LIBRARY_RESET = '[LIBRARY] Reset the library settings';

export class LibraryGetScanTypes implements Action {
  readonly type = LIBRARY_GET_SCAN_TYPES;

  constructor() { }
}

export class LibrarySetScanTypes implements Action {
  readonly type = LIBRARY_SET_SCAN_TYPES;

  constructor(public payload: {
    scan_types: Array<ScanType>,
  }) { }
}

export class LibrarySetScanType implements Action {
  readonly type = LIBRARY_SET_SCAN_TYPE;

  constructor(public payload: {
    comic: Comic,
    scan_type: ScanType,
  }) { }
}

export class LibraryFetchLibraryChanges implements Action {
  readonly type = LIBRARY_FETCH_LIBRARY_CHANGES;

  constructor(public payload: {
    last_comic_date: string,
  }) { }
}

export class LibraryMergeNewComics implements Action {
  readonly type = LIBRARY_MERGE_NEW_COMICS;

  constructor(public payload: {
    comics: Array<Comic>,
  }) { }
}

export class LibraryUpdateComic implements Action {
  readonly type = LIBRARY_UPDATE_COMIC;

  constructor(public payload: Comic) { }
}

export class LibraryRemoveComic implements Action {
  readonly type = LIBRARY_REMOVE_COMIC;

  constructor(public payload: {
    comic: Comic,
  }) { }
}

export class LibraryUpdateComicsRemoveComic implements Action {
  readonly type = LIBRARY_UPDATE_COMICS_REMOVE_COMIC;

  constructor(public payload: {
    comic: Comic,
  }) { }
}

export class LibraryReset implements Action {
  readonly type = LIBRARY_RESET;

  constructor() { }
}

export type Actions =
  LibraryGetScanTypes |
  LibrarySetScanTypes |
  LibrarySetScanType |
  LibraryScanTypeSet |
  LibraryFetchLibraryChanges |
  LibraryMergeNewComics |
  LibraryUpdateComic |
  LibraryRemoveComic |
  LibraryUpdateComicsRemoveComic |
  LibraryReset;
