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
  READING_LISTS_FEATURE_KEY,
  ReadingListsState,
  reducer as readingListListReducer
} from './reducers/reading-lists.reducer';
import { ActionReducerMap } from '@ngrx/store';
import {
  READING_LIST_DETAIL_FEATURE_KEY,
  ReadingListDetailState,
  reducer as readingListDetailReducer
} from './reducers/reading-list-detail.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface ListsModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [READING_LISTS_FEATURE_KEY]: ReadingListsState;
  [READING_LIST_DETAIL_FEATURE_KEY]: ReadingListDetailState;
}

export type ModuleState = ListsModuleState;

export const reducers: ActionReducerMap<ListsModuleState> = {
  router: routerReducer,
  [READING_LISTS_FEATURE_KEY]: readingListListReducer,
  [READING_LIST_DETAIL_FEATURE_KEY]: readingListDetailReducer
};
