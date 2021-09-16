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
import {
  READING_LIST_ENTRIES_FEATURE_KEY,
  ReadingListEntriesState,
  reducer as readingListEntriesReducer
} from './reducers/reading-list-entries.reducer';
import {
  DOWNLOAD_READING_LIST_FEATURE_KEY,
  DownloadReadingListState,
  reducer as downloadReadingListReducer
} from './reducers/download-reading-list.reducer';
import {
  reducer as uploadReadingListReducer,
  UPLOAD_READING_LIST_FEATURE_KEY,
  UploadReadingListState
} from './reducers/upload-reading-list.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface ListsModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [READING_LISTS_FEATURE_KEY]: ReadingListsState;
  [READING_LIST_DETAIL_FEATURE_KEY]: ReadingListDetailState;
  [READING_LIST_ENTRIES_FEATURE_KEY]: ReadingListEntriesState;
  [DOWNLOAD_READING_LIST_FEATURE_KEY]: DownloadReadingListState;
  [UPLOAD_READING_LIST_FEATURE_KEY]: UploadReadingListState;
}

export type ModuleState = ListsModuleState;

export const reducers: ActionReducerMap<ListsModuleState> = {
  router: routerReducer,
  [READING_LISTS_FEATURE_KEY]: readingListListReducer,
  [READING_LIST_DETAIL_FEATURE_KEY]: readingListDetailReducer,
  [READING_LIST_ENTRIES_FEATURE_KEY]: readingListEntriesReducer,
  [DOWNLOAD_READING_LIST_FEATURE_KEY]: downloadReadingListReducer,
  [UPLOAD_READING_LIST_FEATURE_KEY]: uploadReadingListReducer
};
