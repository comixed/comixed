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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import {
  ComicImportActions,
  ComicImportActionTypes
} from '../actions/comic-import.actions';
import { ComicFile } from 'app/comic-import/models/comic-file';

export const COMIC_IMPORT_FEATURE_KEY = 'comicImport';

export interface ComicImportState {
  directory: string;
  fetchingFiles: boolean;
  comicFiles: ComicFile[];
  selectedComicFiles: ComicFile[];
  startingImport: boolean;
}

export const initialState: ComicImportState = {
  directory: '',
  fetchingFiles: false,
  comicFiles: [],
  selectedComicFiles: [],
  startingImport: false
};

export function reducer(
  state = initialState,
  action: ComicImportActions
): ComicImportState {
  switch (action.type) {
    case ComicImportActionTypes.SetDirectory:
      return { ...state, directory: action.payload.directory };

    case ComicImportActionTypes.GetFiles:
      return { ...state, fetchingFiles: true };

    case ComicImportActionTypes.FilesReceived:
      return {
        ...state,
        fetchingFiles: false,
        comicFiles: action.payload.comicFiles,
        selectedComicFiles: []
      };

    case ComicImportActionTypes.GetFilesFailed:
      return { ...state, fetchingFiles: false };

    case ComicImportActionTypes.SelectFiles: {
      const selected = state.selectedComicFiles.filter(entry =>
        action.payload.comicFiles.every(file => file.id !== entry.id)
      );
      return {
        ...state,
        selectedComicFiles: selected.concat(action.payload.comicFiles)
      };
    }

    case ComicImportActionTypes.DeselectFiles: {
      const selected = state.selectedComicFiles.filter(entry =>
        action.payload.comicFiles.every(file => file.id !== entry.id)
      );
      return { ...state, selectedComicFiles: selected };
    }

    case ComicImportActionTypes.Reset:
      return { ...state, selectedComicFiles: [] };

    case ComicImportActionTypes.Start:
      return {
        ...state,
        startingImport: true,
        comicFiles: [],
        selectedComicFiles: []
      };

    case ComicImportActionTypes.Started:
      return { ...state, startingImport: false, selectedComicFiles: [] };

    case ComicImportActionTypes.StartFailed:
      return { ...state, startingImport: false };

    default:
      return state;
  }
}
