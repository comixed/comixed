/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import {
  SelectionActions,
  SelectionActionTypes
} from '../actions/selection.actions';
import { Comic } from 'app/comics';

export const SELECTION_FEATURE_KEY = 'selection_state';

export interface SelectionState {
  comics: Comic[];
}

export const initialState: SelectionState = {
  comics: []
};

export function reducer(
  state = initialState,
  action: SelectionActions
): SelectionState {
  switch (action.type) {
    case SelectionActionTypes.AddComic: {
      const comics = state.comics.filter(
        comic => comic.id !== action.payload.comic.id
      );
      comics.push(action.payload.comic);

      return { ...state, comics: comics };
    }

    case SelectionActionTypes.BulkAddComics: {
      const comics = state.comics.filter(
        comic => !action.payload.comics.some(entry => entry.id === comic.id)
      );
      return { ...state, comics: comics.concat(action.payload.comics) };
    }

    case SelectionActionTypes.RemoveComic:
      return {
        ...state,
        comics: state.comics.filter(
          comic => comic.id !== action.payload.comic.id
        )
      };

    case SelectionActionTypes.BulkRemoveComics: {
      const comics = state.comics.filter(
        comic => !action.payload.comics.some(entry => entry.id === comic.id)
      );
      return { ...state, comics: comics };
    }

    case SelectionActionTypes.RemoveAllComics:
      return { ...state, comics: [] };

    default:
      return state;
  }
}
