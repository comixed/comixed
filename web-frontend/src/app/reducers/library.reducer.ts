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
import { Library } from '../models/library';
import { Comic } from '../models/comics/comic';
import * as LibraryActions from '../actions/library.actions';

const initial_state: Library = {
  busy: false,
  last_comic_date: '0',
  rescan_count: 0,
  import_count: 0,
  scan_types: [],
  formats: [],
  comics: [],
};

export function libraryReducer(
  state: Library = initial_state,
  action: LibraryActions.Actions,
) {
  switch (action.type) {
    case LibraryActions.LIBRARY_GET_SCAN_TYPES:
      return {
        ...state,
        busy: true,
      };

    case LibraryActions.LIBRARY_SET_SCAN_TYPES:
      return {
        ...state,
        busy: false,
        scan_types: action.payload.scan_types,
      };

    case LibraryActions.LIBRARY_SET_SCAN_TYPE:
      return {
        ...state,
        busy: true,
      };

    case LibraryActions.LIBRARY_SCAN_TYPE_SET: {
      action.payload.comic.scan_type = action.payload.scan_type;

      return {
        ...state,
        busy: false,
      };
    }

    case LibraryActions.LIBRARY_GET_FORMATS:
      return {
        ...state,
        busy: true,
      };

    case LibraryActions.LIBRARY_SET_FORMATS:
      return {
        ...state,
        busy: false,
        formats: action.payload.formats,
      };

    case LibraryActions.LIBRARY_SET_FORMAT:
      return {
        ...state,
        busy: true,
      };

    case LibraryActions.LIBRARY_FORMAT_SET: {
      action.payload.comic.format = action.payload.format;

      return {
        ...state,
        busy: false,
      };
    }

    case LibraryActions.LIBRARY_SET_SORT_NAME:
      return {
        ...state,
        busy: true,
      };

    case LibraryActions.LIBRARY_SORT_NAME_SET: {
      action.payload.comic.sort_name = action.payload.sort_name;

      return {
        ...state,
        busy: false,
      };
    }

    case LibraryActions.LIBRARY_FETCH_LIBRARY_CHANGES:
      return {
        ...state,
        busy: true,
        latest_comic_update: action.payload.last_comic_date,
      };

    case LibraryActions.LIBRARY_MERGE_NEW_COMICS:
      const comics = state.comics;
      if (action.payload.comics.length > 0) {
        // merge the new comics into the existing comics
        action.payload.comics.forEach((comic: Comic) => {
          // if we already have the comic then merge their content, otherwise add it to the library
          const index = comics.findIndex((found: Comic) => {
            return found.id === comic.id;
          });
          if (index !== -1) {
            Object.assign(comics[index], comic);
          } else {
            comics.push(comic);
          }
        });
      }
      // find the latest comic date
      let last_comic = null;

      if (comics.length > 0) {
        last_comic = comics.reduce((last: Comic, current: Comic) => {
          const last_added_date = parseInt(last.added_date, 10);
          const curr_added_date = parseInt(current.added_date, 10);

          if (curr_added_date >= last_added_date) {
            return current;
          } else {
            return last;
          }
        }) || null;
      }
      const last_comic_date = last_comic === null ? '0' : last_comic.added_date;
      return {
        ...state,
        busy: false,
        rescan_count: action.payload.rescan_count,
        import_count: action.payload.import_count,
        last_comic_date: last_comic_date,
        comics: comics,
      };

    case LibraryActions.LIBRARY_UPDATE_COMIC: {
      const index = state.comics.findIndex((comic: Comic) => {
        return comic.id === action.payload.id;
      });

      if (index !== -1) {
        Object.assign(state.comics[index], action.payload);
      }

      return {
        ...state,
        comics: state.comics,
      };
    }

    case LibraryActions.LIBRARY_REMOVE_COMIC: {
      return {
        ...state,
        busy: true,
      };
    }

    case LibraryActions.LIBRARY_UPDATE_COMICS_REMOVE_COMIC: {
      const updated_comics = state.comics.filter(comic => comic.id !== action.payload.comic.id);
      return {
        ...state,
        busy: false,
        comics: updated_comics,
      };
    }

    case LibraryActions.LIBRARY_RESET:
      return {
        ...state,
        last_comic_date: '0',
        comics: [],
      };

    case LibraryActions.LIBRARY_CLEAR_METADATA:
      return {
        ...state,
        busy: true,
      };

    case LibraryActions.LIBRARY_METADATA_CHANGED:
      return {
        ...state,
        busy: false,
        comics: state.comics,
      };

    case LibraryActions.LIBRARY_RESCAN_FILES:
      return {
        ...state,
        busy: true,
      };

    case LibraryActions.LIBRARY_SET_BLOCKED_PAGE_STATE:
      return {
        ...state,
        busy: true,
      };

    case LibraryActions.LIBRARY_BLOCKED_PAGE_STATE_SET: {
      action.payload.page.blocked = action.payload.blocked_state;

      return {
        ...state,
        busy: false,
      };
    }

    default:
      return state;
  }
}
