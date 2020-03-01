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
import { ReadingList } from 'app/library/models/reading-list/reading-list';

export enum ReadingListActionTypes {
  GetAll = '[READING LIST] Load reading lists',
  AllReceived = '[READING LIST] All reading lists loaded',
  GetAllFailed = '[READING LIST] Failed to load reading lists',
  Get = '[READING LIST] Get a single reading list',
  Received = '[READING LIST] Received a single reading list',
  GetFailed = '[READING LIST] Failed get a single reading list',
  Create = '[READING LIST] Create a new reading list',
  Save = '[READING LIST] Save a reading list',
  Saved = '[READING LIST] Saved the reading list',
  SaveFailed = '[READING LIST] Failed to save the reading list'
}

export class ReadingListsLoad implements Action {
  readonly type = ReadingListActionTypes.GetAll;

  constructor() {}
}

export class ReadingListsLoaded implements Action {
  readonly type = ReadingListActionTypes.AllReceived;

  constructor(public payload: { reading_lists: ReadingList[] }) {}
}

export class ReadingListLoadFailed implements Action {
  readonly type = ReadingListActionTypes.GetAllFailed;

  constructor() {}
}

export class ReadingListGet implements Action {
  readonly type = ReadingListActionTypes.Get;

  constructor(public payload: { id: number }) {}
}

export class ReadingListReceived implements Action {
  readonly type = ReadingListActionTypes.Received;

  constructor(public payload: { reading_list: ReadingList }) {}
}

export class ReadingListGetFailed implements Action {
  readonly type = ReadingListActionTypes.GetFailed;

  constructor() {}
}

export class ReadingListCreate implements Action {
  readonly type = ReadingListActionTypes.Create;

  constructor() {}
}

export class ReadingListSave implements Action {
  readonly type = ReadingListActionTypes.Save;

  constructor(public payload: { reading_list: ReadingList }) {}
}

export class ReadingListSaved implements Action {
  readonly type = ReadingListActionTypes.Saved;

  constructor(public payload: { reading_list: ReadingList }) {}
}

export class ReadingListSaveFailed implements Action {
  readonly type = ReadingListActionTypes.SaveFailed;

  constructor() {}
}

export type ReadingListActions =
  | ReadingListsLoad
  | ReadingListsLoaded
  | ReadingListLoadFailed
  | ReadingListGet
  | ReadingListReceived
  | ReadingListGetFailed
  | ReadingListCreate
  | ReadingListSave
  | ReadingListSaved
  | ReadingListSaveFailed;
