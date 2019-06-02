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

import { LibraryDisplay } from 'app/models/state/library-display';
import * as LibraryDisplayActions from 'app/actions/library-display.actions';
import { Preference } from 'app/models/user/preference';

export const initial_state: LibraryDisplay = {
  layout: 'grid',
  sort_field: 'added_date',
  comic_file_sort_field: 'filename',
  rows: 10,
  cover_size: 225,
  same_height: true,
  show_selections: false
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
        sort_field: action.payload.sort_field
      };

    case LibraryDisplayActions.SET_LIBRARY_VIEW_COMIC_FILE_SORT:
      return {
        ...state,
        comic_file_sort_field: action.payload.comic_file_sort_field
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

    case LibraryDisplayActions.LIBRARY_VIEW_LOAD_USER_OPTIONS: {
      const user = action.payload.user;
      let layout = initial_state.layout;
      let sort = initial_state.sort_field;
      let comic_file_sort = initial_state.comic_file_sort_field;
      let rows = initial_state.rows;
      let cover_size = initial_state.cover_size;
      let same_height = initial_state.same_height;

      if (user) {
        user.preferences.forEach((pref: Preference) => {
          if (pref.name === 'library_display_layout') {
            layout = pref.value;
          } else if (pref.name === 'library_display_sort_field') {
            sort = pref.value;
          } else if (pref.name === 'library_display_comic_file_sort_field') {
            comic_file_sort = pref.value;
          } else if (pref.name === 'library_display_rows') {
            rows = parseInt(pref.value, 10);
          } else if (pref.name === 'library_display_cover_size') {
            cover_size = parseInt(pref.value, 10);
          } else if (pref.name === 'library_display_same_height') {
            same_height = parseInt(pref.value, 10) !== 0;
          }
        });
      }

      return {
        ...state,
        layout: layout,
        sort_field: sort,
        comic_file_sort_field: comic_file_sort,
        rows: rows,
        cover_size: cover_size,
        same_height: same_height
      };
    }

    case LibraryDisplayActions.LIBRARY_VIEW_TOGGLE_SIDEBAR: {
      return {
        ...state,
        show_selections: action.payload.show
      };
    }

    default:
      return state;
  }
}
