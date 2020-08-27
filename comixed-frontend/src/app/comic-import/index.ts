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
import { Params } from '@angular/router';
import * as fromRouter from '@ngrx/router-store';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import {
  FIND_COMIC_FILES_FEATURE_KEY,
  FindComicFilesState
} from 'app/comic-import/reducers/find-comic-files.reducer';
import * as fromFindComicFiles from './reducers/find-comic-files.reducer';
import {
  SELECTED_COMIC_FILES_FEATURE_KEY,
  SelectedComicFilesState
} from 'app/comic-import/reducers/selected-comic-files.reducer';
import * as fromSelectedComicFiles from './reducers/selected-comic-files.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AppState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  [FIND_COMIC_FILES_FEATURE_KEY]: FindComicFilesState;
  [SELECTED_COMIC_FILES_FEATURE_KEY]: SelectedComicFilesState;
}

export type State = AppState;

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  [FIND_COMIC_FILES_FEATURE_KEY]: fromFindComicFiles.reducer,
  [SELECTED_COMIC_FILES_FEATURE_KEY]: fromSelectedComicFiles.reducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
