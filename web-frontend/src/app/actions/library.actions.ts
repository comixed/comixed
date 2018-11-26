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

export const LIBRARY_START_UPDATING = '[LIBRARY] Start updating';
export const LIBRARY_UPDATE_COMIC = '[LIBRARY] Update a single comic';
export const LIBRARY_SET_COMICS = '[LIBRARY] Set the list of comics';
export const REMOVE_REMOVE_COMIC = '[LIBRARY] Remove comic';

export class LibraryStartUpdating implements Action {
  readonly type = LIBRARY_START_UPDATING;

  constructor(public payload: boolean) { }
}

export class LibraryUpdateComic implements Action {
  readonly type = LIBRARY_UPDATE_COMIC;

  constructor(public payload: Comic) { }
}

export class LIbrarySetComics implements Action {
  readonly type = LIBRARY_SET_COMICS;

  constructor(public payload: Array<Comic>) { }
}

export class LibraryRemoveComic implements Action {
  readonly type = REMOVE_REMOVE_COMIC;

  constructor(public payload: number) { }
}

export type Actions =
  LibraryStartUpdating |
  LibraryUpdateComic |
  LIbrarySetComics |
  LibraryRemoveComic;
