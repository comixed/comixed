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
import { ReadingList } from 'app/comics/models/reading-list';
import { Comic } from 'app/comics';

export enum ReadingListActionTypes {
  Create = '[READING LIST] Create a new reading list',
  Edit = '[READING LIST] Edit a reading list',
  CancelEdit = '[READING LIST] Cancel editing a reading list',
  Save = '[READING LIST] Save a reading list',
  Saved = '[READING LIST] Saved the reading list',
  SaveFailed = '[READING LIST] Failed to save the reading list',
  AddComics = '[READING LIST] Add comics to a reading list',
  ComicsAdded = '[READING LIST] Comics added to a reading list',
  AddComicsFailed = '[READING LIST] Failed to add comics to a reading list',
  ToggleSelectDialog = '[READING LIST] Toggle showing the selection dialog',
  RemoveComics = '[READING LIST] Remove comics from a reading list',
  ComicsRemoved = '[READING LIST] Comics removed from a reading list',
  RemoveComicsFailed = '[READING LIST] Failed to remove comics from a reading list'
}

export class ReadingListCreate implements Action {
  readonly type = ReadingListActionTypes.Create;

  constructor() {}
}

export class ReadingListEdit implements Action {
  readonly type = ReadingListActionTypes.Edit;

  constructor(public payload: { readingList: ReadingList }) {}
}

export class ReadingListCancelEdit implements Action {
  readonly type = ReadingListActionTypes.CancelEdit;

  constructor() {}
}

export class ReadingListSave implements Action {
  readonly type = ReadingListActionTypes.Save;

  constructor(public payload: { id: number; name: string; summary: string }) {}
}

export class ReadingListSaved implements Action {
  readonly type = ReadingListActionTypes.Saved;

  constructor(public payload: { readingList: ReadingList }) {}
}

export class ReadingListSaveFailed implements Action {
  readonly type = ReadingListActionTypes.SaveFailed;

  constructor() {}
}

export class ReadingListAddComics implements Action {
  readonly type = ReadingListActionTypes.AddComics;

  constructor(public payload: { readingList: ReadingList; comics: Comic[] }) {}
}

export class ReadingListComicsAdded implements Action {
  readonly type = ReadingListActionTypes.ComicsAdded;

  constructor() {}
}

export class ReadingListAddComicsFailed implements Action {
  readonly type = ReadingListActionTypes.AddComicsFailed;

  constructor() {}
}

export class ReadingListToggleSelectDialog implements Action {
  readonly type = ReadingListActionTypes.ToggleSelectDialog;

  constructor(public payload: { show: boolean }) {}
}

export class ReadingListRemoveComics implements Action {
  readonly type = ReadingListActionTypes.RemoveComics;

  constructor(public payload: { readingList: ReadingList; comics: Comic[] }) {}
}

export class ReadingListComicsRemoved implements Action {
  readonly type = ReadingListActionTypes.ComicsRemoved;

  constructor() {}
}

export class ReadingListRemoveComicsFailed implements Action {
  readonly type = ReadingListActionTypes.RemoveComicsFailed;

  constructor() {}
}

export type ReadingListActions =
  | ReadingListCreate
  | ReadingListEdit
  | ReadingListCancelEdit
  | ReadingListSave
  | ReadingListSaved
  | ReadingListSaveFailed
  | ReadingListAddComics
  | ReadingListComicsAdded
  | ReadingListAddComicsFailed
  | ReadingListToggleSelectDialog
  | ReadingListRemoveComics
  | ReadingListComicsRemoved
  | ReadingListRemoveComicsFailed;
