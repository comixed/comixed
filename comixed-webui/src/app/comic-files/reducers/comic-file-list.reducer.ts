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

import { createFeature, createReducer, on } from '@ngrx/store';
import { ComicFile } from '@app/comic-files/models/comic-file';
import {
  loadComicFileListFailure,
  loadComicFileLists,
  loadComicFileListSuccess,
  loadComicFilesFromSession,
  toggleComicFileSelections,
  toggleComicFileSelectionsFailure,
  toggleComicFileSelectionsSuccess
} from '@app/comic-files/actions/comic-file-list.actions';
import { ComicFileGroup } from '@app/comic-files/models/comic-file-group';

export const COMIC_FILE_LIST_FEATURE_KEY = 'comic_file_list';

export interface ComicFileListState {
  busy: boolean;
  groups: ComicFileGroup[];
  files: ComicFile[];
}

export const initialState: ComicFileListState = {
  busy: false,
  groups: [],
  files: []
};

export const reducer = createReducer(
  initialState,

  on(loadComicFilesFromSession, state => ({ ...state, busy: true })),
  on(loadComicFileLists, state => ({ ...state, busy: true })),
  on(loadComicFileListSuccess, (state, action) => {
    const groups = action.groups;
    const files = action.groups
      .map(entry => entry.files)
      .reduce((accumulator, entries) => accumulator.concat(entries), []);
    return {
      ...state,
      busy: false,
      groups,
      files
    };
  }),
  on(loadComicFileListFailure, state => ({
    ...state,
    busy: false,
    files: []
  })),
  on(toggleComicFileSelections, state => ({ ...state, busy: true })),
  on(toggleComicFileSelectionsSuccess, (state, action) => {
    const groups = action.groups;
    const files = action.groups
      .map(entry => entry.files)
      .reduce((accumulator, entries) => accumulator.concat(entries), []);
    return {
      ...state,
      busy: false,
      groups,
      files
    };
  }),
  on(toggleComicFileSelectionsFailure, state => ({ ...state, busy: false }))
);

export const comicFileListFeature = createFeature({
  name: COMIC_FILE_LIST_FEATURE_KEY,
  reducer
});
