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

export const LIBRARY_FETCH_LIBRARY_CHANGES = '[LIBRARY] Fetch changes to the library';
export const LIBRARY_MERGE_NEW_COMICS = '[LIBRARY] Merge newly retrieved comics';
export const LIBRARY_UPDATE_COMIC = '[LIBRARY] Update a single comic';
export const LIBRARY_REMOVE_COMIC = '[LIBRARY] Remove comic';
export const LIBRARY_UPDATE_COMICS_REMOVE_COMIC = '[LIBRARY] Update comics by removing a comic';

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

export type Actions =
  LibraryFetchLibraryChanges |
  LibraryMergeNewComics |
  LibraryUpdateComic |
  LibraryRemoveComic |
  LibraryUpdateComicsRemoveComic;
