/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { RecreateComicFilesActions } from '../actions/recreate-comic-files.actions';

export const RECREATE_COMIC_FILES_FEATURE_KEY = 'recreate_comic_files_state';

export interface RecreateComicFilesState {
  busy: boolean;
}

export const initialRecreateComicFilesState: RecreateComicFilesState = {
  busy: false
};

export const recreateComicFilesReducer = createReducer(
  initialRecreateComicFilesState,
  on(RecreateComicFilesActions.recreateComic, state => ({
    ...state,
    busy: true
  })),
  on(RecreateComicFilesActions.recreateComicSuccess, state => ({
    ...state,
    busy: false
  })),
  on(RecreateComicFilesActions.recreateComicFailure, state => ({
    ...state,
    busy: false
  })),
  on(RecreateComicFilesActions.recreateSelectedComics, state => ({
    ...state,
    busy: true
  })),
  on(RecreateComicFilesActions.recreateSelectedComicsSuccess, state => ({
    ...state,
    busy: false
  })),
  on(RecreateComicFilesActions.recreateSelectedComicsFailure, state => ({
    ...state,
    busy: false
  }))
);

export const recreateComicFilesFeature = createFeature({
  name: RECREATE_COMIC_FILES_FEATURE_KEY,
  reducer: recreateComicFilesReducer
});
