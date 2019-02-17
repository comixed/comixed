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
import * as LibraryDisplayActions from "../actions/library-display.actions";

const initial_state: LibraryDisplay = {
  layout: "grid",
  sort_field: "added_date",
  rows: 10,
  cover_size: 225,
  same_height: true
};

export function libraryDisplayReducer(
  state: LibraryDisplay = initial_state,
  action: LibraryDisplayActions.Actions
) {
  switch (action.type) {
    case LibraryDisplayActions.SET_LIBRARY_VIEW_LAYOUT:
      return {
        ...state,
        layout: action.payload.layout
      };

    case LibraryDisplayActions.SET_LIBRARY_VIEW_SORT:
      return {
        ...state,
        sort: action.payload.sort
      };

    case LibraryDisplayActions.SET_LIBRARY_VIEW_ROWS:
      return {
        ...state,
        rows: action.payload.rows
      };

    case LibraryDisplayActions.SET_LIBRARY_VIEW_COVER_SIZE:
      return {
        ...state,
        cover_size: action.payload.cover_size
      };

    case LibraryDisplayActions.SET_LIBRARY_VIEW_USE_SAME_HEIGHT:
      return {
        ...state,
        same_height: action.payload.same_height
      };

    default:
      return state;
  }
}
