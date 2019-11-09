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
import { Comic } from 'app/library';

export enum SelectionActionTypes {
  AddComic = '[SELECT] Add a comic',
  BulkAddComics = '[SELECT] Add comics in bulk',
  RemoveComic = '[SELECT] Remove a comic',
  BulkRemoveComics = '[SELECT] Remove comics in bulk',
  RemoveAllComics = '[SELECT] Remove all comics'
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

export type SelectionActions =
  | SelectAddComic
  | SelectBulkAddComics
  | SelectRemoveComic
  | SelectBulkRemoveComics
  | SelectRemoveAllComics;
