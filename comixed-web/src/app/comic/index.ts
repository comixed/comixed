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

import { Params } from '@angular/router';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import {
  COMIC_FORMAT_FEATURE_KEY,
  ComicFormatState,
  reducer as comicFormatReducer
} from './reducers/comic-format.reducer';
import { ActionReducerMap } from '@ngrx/store';
import {
  reducer as scanTypeReducer,
  SCAN_TYPE_FEATURE_KEY,
  ScanTypeState
} from './reducers/scan-type.reducer';
import {
  COMIC_FEATURE_KEY,
  ComicState,
  reducer as comicReducer
} from '@app/comic/reducers/comic.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface ComicModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [COMIC_FORMAT_FEATURE_KEY]: ComicFormatState;
  [SCAN_TYPE_FEATURE_KEY]: ScanTypeState;
  [COMIC_FEATURE_KEY]: ComicState;
}

export type ModuleState = ComicModuleState;

export const reducers: ActionReducerMap<ComicModuleState> = {
  router: routerReducer,
  [COMIC_FORMAT_FEATURE_KEY]: comicFormatReducer,
  [SCAN_TYPE_FEATURE_KEY]: scanTypeReducer,
  [COMIC_FEATURE_KEY]: comicReducer
};
