import { Action } from '@ngrx/store';
import { Comic } from 'app/library';
import { ComicFile } from 'app/models/import/comic-file';

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

export const SELECTION_ADD_COMIC_FILES =
  '[SELECTION] Add comic files to the selection list';
export class SelectionAddComicFiles implements Action {
  readonly type = SELECTION_ADD_COMIC_FILES;

  constructor(public payload: { comic_files: ComicFile[] }) {}
}

export const SELECTION_REMOVE_COMIC_FILES =
  '[SELECTION] Remove comic files from the selection list';
export class SelectionRemoveComicFiles implements Action {
  readonly type = SELECTION_REMOVE_COMIC_FILES;

  constructor(public payload: { comic_files: ComicFile[] }) {}
}

export type Actions =
  | SelectionReset
  | SelectionAddComics
  | SelectionRemoveComics
  | SelectionAddComicFiles
  | SelectionRemoveComicFiles;
