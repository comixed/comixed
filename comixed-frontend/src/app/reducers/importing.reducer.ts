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

import { ImportState } from 'app/models/state/import-state';
import * as ImportingActions from 'app/actions/importing.actions';
import { ComicFile } from 'app/models/import/comic-file';

export const initial_state: ImportState = {
  busy: false,
  selected_count: 0,
  updating_status: false,
  directory: '',
  files: []
};

export function importingReducer(
  state: ImportState = initial_state,
  action: ImportingActions.Actions
) {
  switch (action.type) {
    case ImportingActions.IMPORTING_GET_PENDING_IMPORTS:
      return {
        ...state,
        updating_status: true
      };

    case ImportingActions.IMPORTING_SET_DIRECTORY:
      return {
        ...state,
        directory: action.payload.directory
      };

    case ImportingActions.IMPORTING_FETCH_FILES:
      return {
        ...state,
        directory: action.payload.directory,
        busy: true
      };

    case ImportingActions.IMPORTING_FILES_FETCHED:
      return {
        ...state,
        busy: false,
        files: action.payload.files
      };

    case ImportingActions.IMPORTING_SELECT_FILES: {
      action.payload.files.forEach((file: ComicFile) => {
        file.selected = true;
      });
      const selected_count = state.files.filter((file: ComicFile) => {
        return file.selected;
      }).length;
      return {
        ...state,
        selected_count: selected_count
      };
    }

    case ImportingActions.IMPORTING_UNSELECT_FILES: {
      action.payload.files.forEach((file: ComicFile) => {
        file.selected = false;
      });
      const selected_count = state.files.filter((file: ComicFile) => {
        return file.selected;
      }).length;
      return {
        ...state,
        selected_count: selected_count
      };
    }

    case ImportingActions.IMPORTING_IMPORT_FILES:
      return {
        ...state,
        busy: true
      };

    case ImportingActions.IMPORTING_FILES_ARE_IMPORTING:
      return {
        ...state,
        busy: false,
        selected_count: 0,
        files: []
      };

    default:
      return state;
  }
}
