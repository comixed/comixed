import { Action } from '@ngrx/store';
import { Comic } from 'app/library';

export const SELECTION_RESET = '[SELECTION] Reset selections';
export class SelectionReset implements Action {
  readonly type = SELECTION_RESET;

  constructor() {}
}

export const SELECTION_ADD_COMICS =
  '[SELECTION] Add comics to the selection list';
export class SelectionAddComics implements Action {
  readonly type = SELECTION_ADD_COMICS;

  constructor(public payload: { comics: Comic[] }) {}
}

export const SELECTION_REMOVE_COMICS =
  '[SELECTION] Remove comics from the selection list';
export class SelectionRemoveComics implements Action {
  readonly type = SELECTION_REMOVE_COMICS;

  constructor(public payload: { comics: Comic[] }) {}
}

export type Actions =
  | SelectionReset
  | SelectionAddComics
  | SelectionRemoveComics;
