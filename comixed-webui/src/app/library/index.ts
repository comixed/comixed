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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Params } from '@angular/router';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';
import {
  LIBRARY_FEATURE_KEY,
  LibraryState,
  reducer as libraryReducer
} from './reducers/library.reducer';
import {
  DUPLICATE_PAGE_LIST_FEATURE_KEY,
  DuplicatePageListState,
  reducer as comicsWithDuplicatePagesReducer
} from './reducers/duplicate-page-list.reducer';
import {
  DUPLICATE_PAGE_DETAIL_FEATURE_KEY,
  DuplicatePageDetailState,
  reducer as duplicatePageDetailReducer
} from './reducers/duplicate-page-detail.reducer';
import {
  reducer as rescanComicsReducer,
  RESCAN_COMICS_FEATURE_KEY,
  RescanComicsState
} from './reducers/rescan-comics.reducer';
import {
  reducer as updateMetadataReducer,
  UPDATE_METADATA_FEATURE_KEY,
  UpdateMetadataState
} from './reducers/update-metadata.reducer';
import {
  CONSOLIDATE_LIBRARY_FEATURE_KEY,
  ConsolidateLibraryState,
  reducer as consolidateLibraryReducer
} from './reducers/consolidate-library.reducer';
import {
  CONVERT_COMIC_BOOKS_FEATURE_KEY,
  ConvertComicBooksState,
  reducer as convertComicsReducer
} from './reducers/convert-comic-books.reducer';
import {
  PURGE_LIBRARY_FEATURE_KEY,
  PurgeLibraryState,
  reducer as purgeLibraryReducer
} from './reducers/purge-library.reducer';
import {
  LIBRARY_SELECTIONS_FEATURE_KEY,
  LibrarySelectionsState,
  reducer as librarySelectionsReducer
} from '@app/library/reducers/library-selections.reducer';
import {
  DUPLICATE_COMIC_FEATURE_KEY,
  DuplicateComicState,
  reducer as duplicateComicReducer
} from '@app/library/reducers/duplicate-comic.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface LibraryModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [LIBRARY_FEATURE_KEY]: LibraryState;
  [LIBRARY_SELECTIONS_FEATURE_KEY]: LibrarySelectionsState;
  [DUPLICATE_COMIC_FEATURE_KEY]: DuplicateComicState;
  [DUPLICATE_PAGE_LIST_FEATURE_KEY]: DuplicatePageListState;
  [DUPLICATE_PAGE_DETAIL_FEATURE_KEY]: DuplicatePageDetailState;
  [RESCAN_COMICS_FEATURE_KEY]: RescanComicsState;
  [UPDATE_METADATA_FEATURE_KEY]: UpdateMetadataState;
  [CONSOLIDATE_LIBRARY_FEATURE_KEY]: ConsolidateLibraryState;
  [CONVERT_COMIC_BOOKS_FEATURE_KEY]: ConvertComicBooksState;
  [PURGE_LIBRARY_FEATURE_KEY]: PurgeLibraryState;
}

export type ModuleState = LibraryModuleState;

export const reducers: ActionReducerMap<LibraryModuleState> = {
  router: routerReducer,
  [LIBRARY_FEATURE_KEY]: libraryReducer,
  [LIBRARY_SELECTIONS_FEATURE_KEY]: librarySelectionsReducer,
  [DUPLICATE_COMIC_FEATURE_KEY]: duplicateComicReducer,
  [DUPLICATE_PAGE_LIST_FEATURE_KEY]: comicsWithDuplicatePagesReducer,
  [DUPLICATE_PAGE_DETAIL_FEATURE_KEY]: duplicatePageDetailReducer,
  [RESCAN_COMICS_FEATURE_KEY]: rescanComicsReducer,
  [UPDATE_METADATA_FEATURE_KEY]: updateMetadataReducer,
  [CONSOLIDATE_LIBRARY_FEATURE_KEY]: consolidateLibraryReducer,
  [CONVERT_COMIC_BOOKS_FEATURE_KEY]: convertComicsReducer,
  [PURGE_LIBRARY_FEATURE_KEY]: purgeLibraryReducer
};
