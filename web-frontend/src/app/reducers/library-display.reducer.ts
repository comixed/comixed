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
import * as LibraryDisplayActions from '../actions/library-display.actions';

const initial_state: LibraryDisplay = {
  current_tab: 0,
  sort: 'series',
  rows: 10,
  cover_size: 200,
};

export function libraryDisplayReducer(
  state: LibraryDisplay = initial_state,
  action: LibraryDisplayActions.Actions,
) {
  switch (action.type) {
    case LibraryDisplayActions.SET_LIBRARY_VIEW_CURRENT_TAB:
      return {
        ...state,
        current_tab: action.payload,
      };

    case LibraryDisplayActions.SET_LIBRARY_VIEW_SORT:
      return {
        ...state,
        sort: action.payload,
      };

    case LibraryDisplayActions.SET_LIBRARY_VIEW_ROWS:
      return {
        ...state,
        rows: action.payload,
      };

    case LibraryDisplayActions.SET_LIBRARY_VIEW_COVER_SIZE:
      return {
        ...state,
        cover_size: action.payload,
      };

    default:
      return state;
  }
}
