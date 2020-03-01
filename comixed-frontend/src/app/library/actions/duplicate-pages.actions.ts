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
import { DuplicatePage } from 'app/library/models/duplicate-page';

export enum DuplicatePagesActionTypes {
  GetAll = '[DUPLICATE PAGES] Get all duplicate pages',
  AllReceived = '[DUPLICATE PAGES] Received all duplicate pages',
  GetAllFailed = '[DUPLICATE PAGES] Failed to get all duplicate pages',
  Select = '[DUPLICATE PAGES] Select the given pages',
  Deselect = '[DUPLICATE PAGES] Deselect the given pages',
  SetBlocking = '[DUPLICATE PAGES] Set the blocking state for the given pages',
  BlockingSet = '[DUPLICATE PAGES] The block state for the given pages was set',
  SetBlockingFailed = '[DUPLICATE PAGES] Failed to set the blocking state',
  SetDeleted = '[DUPLICATE PAGES] Set duplicate pages deleted state',
  DeletedSet = '[DUPLICATE PAGES] Duplicate pages deleted state set',
  SetDeletedFailed = '[DUPLICATE PAGES] Set duplicate pages deleted state failed'
}

export class DuplicatePagesGetAll implements Action {
  readonly type = DuplicatePagesActionTypes.GetAll;

  constructor() {}
}

export class DuplicatePagesAllReceived implements Action {
  readonly type = DuplicatePagesActionTypes.AllReceived;

  constructor(public payload: { pages: DuplicatePage[] }) {}
}

export class DuplicatePagesGetAllFailed implements Action {
  readonly type = DuplicatePagesActionTypes.GetAllFailed;

  constructor() {}
}

export class DuplicatePagesSelect implements Action {
  readonly type = DuplicatePagesActionTypes.Select;

  constructor(public payload: { pages: DuplicatePage[] }) {}
}

export class DuplicatePagesDeselect implements Action {
  readonly type = DuplicatePagesActionTypes.Deselect;

  constructor(public payload: { pages: DuplicatePage[] }) {}
}

export class DuplicatePagesSetBlocking implements Action {
  readonly type = DuplicatePagesActionTypes.SetBlocking;

  constructor(public payload: { pages: DuplicatePage[]; blocking: boolean }) {}
}

export class DuplicatePagesBlockingSet implements Action {
  readonly type = DuplicatePagesActionTypes.BlockingSet;

  constructor(public payload: { pages: DuplicatePage[] }) {}
}

export class DuplicatePagesSetBlockingFailed implements Action {
  readonly type = DuplicatePagesActionTypes.SetBlockingFailed;

  constructor() {}
}

export class DuplicatePagesSetDeleted implements Action {
  readonly type = DuplicatePagesActionTypes.SetDeleted;

  constructor(public payload: { pages: DuplicatePage[]; deleted: boolean }) {}
}

export class DuplicatePagesDeletedSet implements Action {
  readonly type = DuplicatePagesActionTypes.DeletedSet;

  constructor(public payload: { pages: DuplicatePage[] }) {}
}

export class DuplicatePagesSetDeletedFailed implements Action {
  readonly type = DuplicatePagesActionTypes.SetDeletedFailed;

  constructor() {}
}

export type DuplicatePagesActions =
  | DuplicatePagesGetAll
  | DuplicatePagesAllReceived
  | DuplicatePagesGetAllFailed
  | DuplicatePagesSelect
  | DuplicatePagesDeselect
  | DuplicatePagesSetBlocking
  | DuplicatePagesBlockingSet
  | DuplicatePagesSetBlockingFailed
  | DuplicatePagesSetDeleted
  | DuplicatePagesDeletedSet
  | DuplicatePagesSetDeletedFailed;
