/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { createReducer, on } from '@ngrx/store';
import { ComicFile } from '@app/comic-files/models/comic-file';
import {
  clearComicFileSelections,
  comicFilesLoaded,
  loadComicFiles,
  loadComicFilesFailed,
  setComicFilesSelectedState
} from '@app/comic-files/actions/comic-file-list.actions';
import { ComicFileGroup } from '@app/comic-files/models/comic-file-group';

export const COMIC_FILE_LIST_FEATURE_KEY = 'comic_file_list';

export interface ComicFileListState {
  loading: boolean;
  groups: ComicFileGroup[];
  files: ComicFile[];
  selections: ComicFile[];
}

export const initialState: ComicFileListState = {
  loading: false,
  groups: [],
  files: [],
  selections: []
};

export const reducer = createReducer(
  initialState,

  on(loadComicFiles, state => ({ ...state, loading: true })),
  on(comicFilesLoaded, (state, action) => {
    const groups = action.groups;
    const files = action.groups
      .map(entry => entry.files)
      .reduce((accumulator, entries) => accumulator.concat(entries), []);
    return {
      ...state,
      loading: false,
      groups,
      files,
      selections: []
    };
  }),
  on(loadComicFilesFailed, state => ({
    ...state,
    loading: false,
    files: [],
    selections: []
  })),
  on(setComicFilesSelectedState, (state, action) => {
    let selections = state.selections.filter(file => {
      return action.files.every(entry => entry.id !== file.id);
    });
    if (action.selected) {
      selections = selections.concat(action.files);
    }
    return { ...state, selections };
  }),
  on(clearComicFileSelections, state => ({
    ...state,
    selections: []
  }))
);
