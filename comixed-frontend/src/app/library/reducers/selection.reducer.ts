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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import {
  SelectionActions,
  SelectionActionTypes
} from '../actions/selection.actions';
import {
  SelectionState,
  initial_state
} from 'app/library/models/selection-state';
import { mergeComicFiles } from 'app/library/utility.functions';

export const SELECTION_FEATURE_KEY = 'selection_state';

export function reducer(
  state = initial_state,
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

    case SelectionActionTypes.AddComicFile:
      return {
        ...state,
        comic_files: mergeComicFiles(state.comic_files, [
          action.payload.comic_file
        ])
      };

    case SelectionActionTypes.BulkAddComicFiles:
      return {
        ...state,
        comic_files: mergeComicFiles(
          state.comic_files,
          action.payload.comic_files
        )
      };

    case SelectionActionTypes.RemoveComicFile:
      return {
        ...state,
        comic_files: state.comic_files.filter(
          comic_file => comic_file.id !== action.payload.comic_file.id
        )
      };

    case SelectionActionTypes.BulkRemoveComicFiles:
      return {
        ...state,
        comic_files: state.comic_files.filter(
          comic_file =>
            !action.payload.comic_files.some(
              entry => entry.id === comic_file.id
            )
        )
      };

    case SelectionActionTypes.RemoveAllComicFiles:
      return { ...state, comic_files: [] };

    default:
      return state;
  }
}
