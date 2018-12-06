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
import { Importing } from '../models/import/importing';
import * as ImportingActions from '../actions/importing.actions';
import { ComicFile } from '../models/import/comic-file';

const initial_state: Importing = {
  busy: false,
  importing: false,
  pending: 0,
  updating_status: false,
  directory: '',
  files: [],
};

export function importingReducer(
  state: Importing = initial_state,
  action: ImportingActions.Actions,
) {
  switch (action.type) {
    case ImportingActions.IMPORTING_GET_PENDING_IMPORTS:
      return {
        ...state,
        updating_status: true,
      };

    case ImportingActions.IMPORTING_SET_PENDING_IMPORTS:
      return {
        ...state,
        pending: action.payload.count,
        updating_status: false,
        importing: action.payload.count > 0,
      };

    case ImportingActions.IMPORTING_SET_DIRECTORY:
      return {
        ...state,
        directory: action.payload.directory,
      };

    case ImportingActions.IMPORTING_FETCH_FILES:
      return {
        ...state,
        directory: action.payload.directory,
        busy: true,
      };

    case ImportingActions.IMPORTING_FILES_FETCHED:
      return {
        ...state,
        busy: false,
        files: action.payload.files,
      };

    case ImportingActions.IMPORTING_SELECT_FILES:
      action.payload.files.forEach((file: ComicFile) => {
        file.selected = true;
      });
      return {
        ...state,
      };

    case ImportingActions.IMPORTING_UNSELECT_FILES:
      action.payload.files.forEach((file: ComicFile) => {
        file.selected = false;
      });
      return {
        ...state,
      };

    case ImportingActions.IMPORTING_IMPORT_FILES:
      return {
        ...state,
        busy: true,
      };

    default:
      return state;
  }
}
