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
import { ReadingList } from 'app/library/models/reading-list/reading-list';

export enum ReadingListActionTypes {
  LoadReadingLists = '[READING LIST] Load reading lists',
  ReadingListsLoaded = '[READING LIST] All reading lists loaded',
  LoadReadingListsFailed = '[READING LIST] Failed to load reading lists',
  GetReadingList = '[READING LIST] Get a single reading list',
  ReadingListReceived = '[READING LIST] Received a single reading list',
  GetReadingListFailed = '[READING LIST] Failed get a single reading list',
  CreateReadingList = '[READING LIST] Create a new reading list',
  SaveReadingList = '[READING LIST] Save a reading list',
  ReadingListSaved = '[READING LIST] Saved the reading list',
  SaveReadingListFailed = '[READING LIST] Failed to save the reading list'
}

export class ReadingListsLoad implements Action {
  readonly type = ReadingListActionTypes.LoadReadingLists;

  constructor() {}
}

export class ReadingListsLoaded implements Action {
  readonly type = ReadingListActionTypes.ReadingListsLoaded;

  constructor(public payload: { reading_lists: ReadingList[] }) {}
}

export class ReadingListLoadFailed implements Action {
  readonly type = ReadingListActionTypes.LoadReadingListsFailed;

  constructor() {}
}

export class ReadingListGet implements Action {
  readonly type = ReadingListActionTypes.GetReadingList;

  constructor(public payload: { id: number }) {}
}

export class ReadingListReceived implements Action {
  readonly type = ReadingListActionTypes.ReadingListReceived;

  constructor(public payload: { reading_list: ReadingList }) {}
}

export class ReadingListGetFailed implements Action {
  readonly type = ReadingListActionTypes.GetReadingListFailed;

  constructor() {}
}

export class ReadingListCreate implements Action {
  readonly type = ReadingListActionTypes.CreateReadingList;

  constructor() {}
}

export class ReadingListSave implements Action {
  readonly type = ReadingListActionTypes.SaveReadingList;

  constructor(public payload: { reading_list: ReadingList }) {}
}

export class ReadingListSaved implements Action {
  readonly type = ReadingListActionTypes.ReadingListSaved;

  constructor(public payload: { reading_list: ReadingList }) {}
}

export class ReadingListSaveFailed implements Action {
  readonly type = ReadingListActionTypes.SaveReadingListFailed;

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
