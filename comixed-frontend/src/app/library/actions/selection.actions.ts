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
import { Comic, ComicFile } from 'app/library';

export enum SelectionActionTypes {
  AddComic = '[SELECT] Add a comic',
  BulkAddComics = '[SELECT] Add comics in bulk',
  RemoveComic = '[SELECT] Remove a comic',
  BulkRemoveComics = '[SELECT] Remove comics in bulk',
  RemoveAllComics = '[SELECT] Remove all comics',
  AddComicFile = '[SELECT] Add a comic file',
  BulkAddComicFiles = '[SELECT] Add comic files in bulk',
  RemoveComicFile = '[SELECT] Remove a comic file',
  BulkRemoveComicFiles = '[SELECT] Remove comic files in bulk',
  RemoveAllComicFiles = '[SELECT] Remove all comic files'
}

export class SelectAddComic implements Action {
  readonly type = SelectionActionTypes.AddComic;

  constructor(public payload: { comic: Comic }) {}
}

export class SelectBulkAddComics implements Action {
  readonly type = SelectionActionTypes.BulkAddComics;

  constructor(public payload: { comics: Comic[] }) {}
}

export class SelectRemoveComic implements Action {
  readonly type = SelectionActionTypes.RemoveComic;

  constructor(public payload: { comic: Comic }) {}
}

export class SelectBulkRemoveComics implements Action {
  readonly type = SelectionActionTypes.BulkRemoveComics;

  constructor(public payload: { comics: Comic[] }) {}
}

export class SelectRemoveAllComics implements Action {
  readonly type = SelectionActionTypes.RemoveAllComics;

  constructor() {}
}

export class SelectAddComicFile implements Action {
  readonly type = SelectionActionTypes.AddComicFile;

  constructor(public payload: { comic_file: ComicFile }) {}
}

export class SelectBulkAddComicFiles implements Action {
  readonly type = SelectionActionTypes.BulkAddComicFiles;

  constructor(public payload: { comic_files: ComicFile[] }) {}
}

export class SelectRemoveComicFile implements Action {
  readonly type = SelectionActionTypes.RemoveComicFile;

  constructor(public payload: { comic_file: ComicFile }) {}
}

export class SelectBulkRemoveComicFiles implements Action {
  readonly type = SelectionActionTypes.BulkRemoveComicFiles;

  constructor(public payload: { comic_files: ComicFile[] }) {}
}

export class SelectRemoveAllComicFiles implements Action {
  readonly type = SelectionActionTypes.RemoveAllComicFiles;

  constructor() {}
}

export type SelectionActions =
  | SelectAddComic
  | SelectBulkAddComics
  | SelectRemoveComic
  | SelectBulkRemoveComics
  | SelectRemoveAllComics
  | SelectAddComicFile
  | SelectBulkAddComicFiles
  | SelectRemoveComicFile
  | SelectBulkRemoveComicFiles
  | SelectRemoveAllComicFiles;
