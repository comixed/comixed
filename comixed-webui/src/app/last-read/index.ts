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
  LAST_READ_LIST_FEATURE_KEY,
  LastReadListState,
  reducer as lastReadDatesReducer
} from '@app/last-read/reducers/last-read-list.reducer';
import { ActionReducerMap } from '@ngrx/store';
import {
  reducer as updateReadStatusReducer,
  COMIC_BOOKS_READ_FEATURE_KEY,
  SetComicsReadState
} from './reducers/comic-books-read.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface LastReadModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [LAST_READ_LIST_FEATURE_KEY]: LastReadListState;
  [COMIC_BOOKS_READ_FEATURE_KEY]: SetComicsReadState;
}

export type ModuleState = LastReadModuleState;

export const reducers: ActionReducerMap<LastReadModuleState> = {
  router: routerReducer,
  [LAST_READ_LIST_FEATURE_KEY]: lastReadDatesReducer,
  [COMIC_BOOKS_READ_FEATURE_KEY]: updateReadStatusReducer
};
