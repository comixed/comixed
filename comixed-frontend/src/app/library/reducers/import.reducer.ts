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
 * along with this program. If not, see <http:/www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { ImportState, initial_state } from 'app/library/models/import-state';
import {
  ImportActions,
  ImportActionTypes
} from 'app/library/actions/import.actions';
import {
  filterComicFiles,
  mergeComicFiles
} from 'app/library/utility.functions';

export const IMPORT_FEATURE_KEY = 'import_state';

export function reducer(
  state = initial_state,
  action: ImportActions
): ImportState {
  switch (action.type) {
    case ImportActionTypes.SetDirectory:
      return { ...state, directory: action.payload.directory };

    case ImportActionTypes.GetFiles:
      return {
        ...state,
        fetching_files: true,
        directory: action.payload.directory
      };

    case ImportActionTypes.FilesReceived:
      return {
        ...state,
        fetching_files: false,
        comic_files: action.payload.comic_files,
        selected_comic_files: []
      };

    case ImportActionTypes.GetFilesFailed:
      return { ...state, fetching_files: false };

    case ImportActionTypes.Start:
      return { ...state, starting_import: true };

    case ImportActionTypes.Started:
      return { ...state, starting_import: false, selected_comic_files: [] };

    case ImportActionTypes.FailedToStart:
      return { ...state, starting_import: false };

    case ImportActionTypes.AddComicFiles:
      return {
        ...state,
        selected_comic_files: mergeComicFiles(
          state.selected_comic_files,
          action.payload.comic_files
        )
      };

    case ImportActionTypes.RemoveComicFiles:
      return {
        ...state,
        selected_comic_files: filterComicFiles(
          state.selected_comic_files,
          action.payload.comic_files
        )
      };

    case ImportActionTypes.ClearSelections:
      return { ...state, selected_comic_files: [] };

    default:
      return state;
  }
}
