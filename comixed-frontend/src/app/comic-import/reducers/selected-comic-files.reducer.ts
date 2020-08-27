/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { Action, createReducer, on } from '@ngrx/store';
import {
  clearComicFileSelections,
  deselectComicFile,
  selectComicFile
} from '../actions/selected-comic-files.actions';
import { ComicFile } from 'app/comic-import/models/comic-file';

export const SELECTED_COMIC_FILES_FEATURE_KEY = 'selected_comic_files_state';

export interface SelectedComicFilesState {
  files: ComicFile[];
}

export const initialState: SelectedComicFilesState = {
  files: []
};

const selectedComicFilesReducer = createReducer(
  initialState,

  on(clearComicFileSelections, state => ({ ...state, files: [] })),
  on(selectComicFile, (state, action) => ({
    ...state,
    files: state.files
      .filter(file => file.id !== action.file.id)
      .concat(action.file)
  })),
  on(deselectComicFile, (state, action) => ({
    ...state,
    files: state.files.filter(file => file.id !== action.file.id)
  }))
);

export function reducer(
  state: SelectedComicFilesState | undefined,
  action: Action
) {
  return selectedComicFilesReducer(state, action);
}
