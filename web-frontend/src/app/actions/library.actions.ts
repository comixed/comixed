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
import { ComicFormat } from '../models/comics/comic-format';

export const LIBRARY_GET_SCAN_TYPES = '[LIBRARY] Fetch the scan types';
export const LIBRARY_SET_SCAN_TYPES = '[LIBRARY] Set the scan types';
export const LIBRARY_SET_SCAN_TYPE = '[LIBRARY] Set the scan type for a comic';
export const LIBRARY_SCAN_TYPE_SET = '[LIBRARY] The scan type is set';
export const LIBRARY_GET_FORMATS = '[LIBRARY] Fetch the comic formats';
export const LIBRARY_SET_FORMATS = '[LIBRARY] Set the comic formats';
export const LIBRARY_SET_FORMAT = '[LIBRARY] Set the format for a comic';
export const LIBRARY_FORMAT_SET = '[LIBRARY] The format is set';
export const LIBRARY_SET_SORT_NAME = '[LIBRARY] Sets the sort name for a comic';
export const LIBRARY_SORT_NAME_SET = '[LIBRARY] The sort name is set';
export const LIBRARY_FETCH_LIBRARY_CHANGES = '[LIBRARY] Fetch changes to the library';
export const LIBRARY_MERGE_NEW_COMICS = '[LIBRARY] Merge newly retrieved comics';
export const LIBRARY_UPDATE_COMIC = '[LIBRARY] Update a single comic';
export const LIBRARY_REMOVE_COMIC = '[LIBRARY] Remove comic';
export const LIBRARY_UPDATE_COMICS_REMOVE_COMIC = '[LIBRARY] Update comics by removing a comic';
export const LIBRARY_RESET = '[LIBRARY] Reset the library settings';
export const LIBRARY_CLEAR_METADATA = '[LIBRARY] Clear comic metadata';
export const LIBRARY_METADATA_CHANGED = '[LIBRARY] Metadata cleared on comic';
export const LIBRARY_CLEAR_METADATA_FLAG = '[LIBRARY] Clear metadata flag';
export const LIBRARY_RESCAN_FILES = '[LIBRARY] Rescan the whole library';

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

export class LibraryScanTypeSet implements Action {
  readonly type = LIBRARY_SCAN_TYPE_SET;

  constructor(public payload: {
    comic: Comic,
    scan_type: ScanType,
  }) { }
}

export class LibraryGetFormats implements Action {
  readonly type = LIBRARY_GET_FORMATS;

  constructor() { }
}

export class LibrarySetFormats implements Action {
  readonly type = LIBRARY_SET_FORMATS;

  constructor(public payload: {
    formats: Array<ComicFormat>,
  }) { }
}

export class LibrarySetFormat implements Action {
  readonly type = LIBRARY_SET_FORMAT;

  constructor(public payload: {
    comic: Comic,
    format: ComicFormat,
  }) { }
}

export class LibraryFormatSet implements Action {
  readonly type = LIBRARY_FORMAT_SET;

  constructor(public payload: {
    comic: Comic,
    format: ComicFormat,
  }) { }
}

export class LibrarySetSortName implements Action {
  readonly type = LIBRARY_SET_SORT_NAME;

  constructor(public payload: {
    comic: Comic,
    sort_name: string,
  }) { }
}

export class LibrarySortNameSet implements Action {
  readonly type = LIBRARY_SORT_NAME_SET;

  constructor(public payload: {
    comic: Comic,
    sort_name: string,
  }) { }
}

export class LibraryFetchLibraryChanges implements Action {
  readonly type = LIBRARY_FETCH_LIBRARY_CHANGES;

  constructor(public payload: {
    last_comic_date: string,
    timeout: number,
  }) { }
}

export class LibraryMergeNewComics implements Action {
  readonly type = LIBRARY_MERGE_NEW_COMICS;

  constructor(public payload: {
    comics: Array<Comic>,
    rescan_count: number,
    import_count: number,
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

export class LibraryClearMetadata implements Action {
  readonly type = LIBRARY_CLEAR_METADATA;

  constructor(public payload: {
    comic: Comic,
  }) { }
}

export class LibraryMetadataChanged implements Action {
  readonly type = LIBRARY_METADATA_CHANGED;

  constructor(public payload: {
    comic: Comic,
  }) { }
}

export class LibraryClearMetadataFlag implements Action {
  readonly type = LIBRARY_CLEAR_METADATA_FLAG;

  constructor() { }
}

export class LibraryRescanFiles implements Action {
  readonly type = LIBRARY_RESCAN_FILES;

  constructor(public payload: {
    last_comic_date: string,
  }) { }
}

export type Actions =
  LibraryGetScanTypes |
  LibrarySetScanTypes |
  LibrarySetScanType |
  LibraryScanTypeSet |
  LibraryGetFormats |
  LibrarySetFormats |
  LibrarySetFormat |
  LibraryFormatSet |
  LibrarySetSortName |
  LibrarySortNameSet |
  LibraryFetchLibraryChanges |
  LibraryMergeNewComics |
  LibraryUpdateComic |
  LibraryRemoveComic |
  LibraryUpdateComicsRemoveComic |
  LibraryReset |
  LibraryClearMetadata |
  LibraryMetadataChanged |
  LibraryClearMetadataFlag |
  LibraryRescanFiles;
