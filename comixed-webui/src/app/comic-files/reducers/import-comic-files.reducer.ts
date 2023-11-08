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
import {
  sendComicFilesSuccess,
  sendComicFiles,
  sendComicFilesFailure
} from '@app/comic-files/actions/import-comic-files.actions';

export const IMPORT_COMIC_FILES_FEATURE_KEY = 'import_comic_files_state';

export interface ImportComicFilesState {
  sending: boolean;
}

export const initialState: ImportComicFilesState = {
  sending: false
};

export const reducer = createReducer(
  initialState,

  on(sendComicFiles, state => ({ ...state, sending: true })),
  on(sendComicFilesSuccess, state => ({ ...state, sending: false })),
  on(sendComicFilesFailure, state => ({ ...state, sending: false }))
);

export const comicFilesFeature = createFeature({
  name: IMPORT_COMIC_FILES_FEATURE_KEY,
  reducer
});
