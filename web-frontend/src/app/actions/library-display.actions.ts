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

import { Action } from '@ngrx/store';
import { LibraryDisplay } from '../models/library-display';

export const SET_LIBRARY_VIEW_CURRENT_TAB = '[LIBRARY VIEW] Set current tab';
export const SET_LIBRARY_VIEW_SORT = '[LIBRARY VIEW] Set sort';
export const SET_LIBRARY_VIEW_ROWS = '[LIBRARY VIEW] Set rows';
export const SET_LIBRARY_VIEW_COVER_SIZE = '[LIBRARY VIEW] Set cover size';

export class SetLibraryViewCurrentTab implements Action {
  readonly type = SET_LIBRARY_VIEW_CURRENT_TAB;

  constructor(public payload: number) { }
}

export class SetLibraryViewSort implements Action {
  readonly type = SET_LIBRARY_VIEW_SORT;

  constructor(public payload: string) { }
}

export class SetLibraryViewRows implements Action {
  readonly type = SET_LIBRARY_VIEW_ROWS;

  constructor(public payload: number) { }
}

export class SetLibraryViewCoverSize implements Action {
  readonly type = SET_LIBRARY_VIEW_COVER_SIZE;

  constructor(public payload: number) { }
}

export type Actions =
  SetLibraryViewCurrentTab |
  SetLibraryViewSort |
  SetLibraryViewRows |
  SetLibraryViewCoverSize;
