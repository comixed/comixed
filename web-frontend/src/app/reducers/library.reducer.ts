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
  is_updating: false,
  latest_comic_update: '0',
  comics: [],
};

export function libraryReducer(
  state: Library = initial_state,
  action: LibraryActions.Actions,
) {
  switch (action.type) {
    case LibraryActions.LIBRARY_START_UPDATING:
      return {
        ...state,
        is_updating: action.payload,
      };

    case LibraryActions.LIBRARY_UPDATE_COMIC: {
      const index = state.comics.findIndex((comic: Comic) => {
        return comic.id === action.payload.id;
      });

      if (index !== -1) {
        state.comics[index] = action.payload;
      } else {
        console.log(`*** ERROR: DID NOT FIND COMIC: id=${action.payload.id}`);
      }

      return {
        ...state,
        comics: state.comics,
      };
    }

    case LibraryActions.LIBRARY_SET_COMICS: {
      const comics = state.comics.concat(action.payload);
      let latest_comic_update = state.latest_comic_update;
      let latest_date = parseInt(latest_comic_update, 10);

      comics.forEach((comic: Comic) => {
        if (parseInt(comic.added_date, 10) > latest_date) {
          latest_comic_update = comic.added_date;
          latest_date = parseInt(latest_comic_update, 10);
        }
      });

      return {
        ...state,
        is_updating: false,
        latest_comic_update: latest_comic_update,
        comics: comics,
      };
    }

    case LibraryActions.REMOVE_REMOVE_COMIC: {
      const comics = state.comics.filter(comic => comic.id !== action.payload);
      return {
        ...state,
        comics: comics,
      };
    }

    default:
      return state;
  }
}
