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

import { Action } from "@ngrx/store";
import { LibraryDisplay } from "../models/actions/library-display";

export const SET_LIBRARY_VIEW_LAYOUT = "[LIBRARY VIEW] Set layout";
export class SetLibraryViewLayout implements Action {
  readonly type = SET_LIBRARY_VIEW_LAYOUT;

  constructor(public payload: { layout: string }) {}
}

export const SET_LIBRARY_VIEW_SORT = "[LIBRARY VIEW] Set sort";
export class SetLibraryViewSort implements Action {
  readonly type = SET_LIBRARY_VIEW_SORT;

  constructor(public payload: { sort_field: string }) {}
}

export const SET_LIBRARY_VIEW_ROWS = "[LIBRARY VIEW] Set rows";
export class SetLibraryViewRows implements Action {
  readonly type = SET_LIBRARY_VIEW_ROWS;

  constructor(public payload: { rows: number }) {}
}

export const SET_LIBRARY_VIEW_COVER_SIZE = "[LIBRARY VIEW] Set cover size";
export class SetLibraryViewCoverSize implements Action {
  readonly type = SET_LIBRARY_VIEW_COVER_SIZE;

  constructor(public payload: { cover_size: number }) {}
}

export const SET_LIBRARY_VIEW_USE_SAME_HEIGHT =
  "[LIBRARY VIEW] Use same height";
export class SetLibraryViewUseSameHeight implements Action {
  readonly type = SET_LIBRARY_VIEW_USE_SAME_HEIGHT;

  constructor(public payload: { same_height: boolean }) {}
}
export type Actions =
  | SetLibraryViewLayout
  | SetLibraryViewSort
  | SetLibraryViewRows
  | SetLibraryViewCoverSize
  | SetLibraryViewUseSameHeight;
