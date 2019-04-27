import { Action } from '@ngrx/store';
import { ReadingList } from 'app/models/reading-list';

export const READING_LIST_CREATE = '[READING LIST] Create reading list';
export class ReadingListCreate implements Action {
  readonly type = READING_LIST_CREATE;

  constructor() {}
}

export const READING_LIST_GET_ALL = '[READING LIST] Gets all reading lists';
export class ReadingListGetAll implements Action {
  readonly type = READING_LIST_GET_ALL;

  constructor() {}
}

export const READING_LIST_GOT_LIST = '[READING LIST] Got all reading lists';
export class ReadingListGotList implements Action {
  readonly type = READING_LIST_GOT_LIST;

  constructor(public payload: { reading_lists: Array<ReadingList> }) {}
}

export const READING_LIST_GET_FAILED = '[READING LIST] Failed to get all lists';
export class ReadingListGetFailed implements Action {
  readonly type = READING_LIST_GET_FAILED;

  constructor() {}
}

export const READING_LIST_SET_CURRENT = '[READING LIST] Set current';
export class ReadingListSetCurrent implements Action {
  readonly type = READING_LIST_SET_CURRENT;

  constructor(public payload: { reading_list: ReadingList }) {}
}

export const READING_LIST_SAVE = '[READING LIST] Save a reading list';
export class ReadingListSave implements Action {
  readonly type = READING_LIST_SAVE;

  constructor(public payload: { reading_list: ReadingList }) {}
}

export const READING_LIST_SAVED = '[READING LIST] Reading list saved';
export class ReadingListSaved implements Action {
  readonly type = READING_LIST_SAVED;

  constructor(public payload: { reading_list: ReadingList }) {}
}

export const READING_LIST_SAVE_FAILED = '[READING LIST] Save failed';
export class ReadingListSaveFailed implements Action {
  readonly type = READING_LIST_SAVE_FAILED;

  constructor() {}
}

export type Actions =
  | ReadingListCreate
  | ReadingListGetAll
  | ReadingListGotList
  | ReadingListGetFailed
  | ReadingListSetCurrent
  | ReadingListSave
  | ReadingListSaved
  | ReadingListSaveFailed;
