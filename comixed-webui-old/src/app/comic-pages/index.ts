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
import { ActionReducerMap } from '@ngrx/store';
import {
  BLOCKED_HASHES_FEATURE_KEY,
  BlockedHashesState,
  reducer as downloadBlockedPagesReducer
} from '@app/comic-pages/reducers/blocked-hashes.reducer';
import {
  DELETE_BLOCKED_PAGES_FEATURE_KEY,
  DeleteBlockedPagesState,
  reducer as deleteBlockedPagesReducer
} from '@app/comic-pages/reducers/delete-blocked-pages.reducer';
import {
  DELETED_PAGE_FEATURE_KEY,
  DeletedPagesState,
  reducer as deletedPageReducer
} from '@app/comic-pages/reducers/deleted-pages.reducer';
import {
  HASH_SELECTION_FEATURE_KEY,
  HashSelectionState,
  reducer as hashSelectionReducer
} from '@app/comic-pages/reducers/hash-selection.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface BlockedPagesModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [HASH_SELECTION_FEATURE_KEY]: HashSelectionState;
  [BLOCKED_HASHES_FEATURE_KEY]: BlockedHashesState;
  [DELETE_BLOCKED_PAGES_FEATURE_KEY]: DeleteBlockedPagesState;
  [DELETED_PAGE_FEATURE_KEY]: DeletedPagesState;
}

export type ModuleState = BlockedPagesModuleState;

export const reducers: ActionReducerMap<BlockedPagesModuleState> = {
  router: routerReducer,
  [HASH_SELECTION_FEATURE_KEY]: hashSelectionReducer,
  [BLOCKED_HASHES_FEATURE_KEY]: downloadBlockedPagesReducer,
  [DELETE_BLOCKED_PAGES_FEATURE_KEY]: deleteBlockedPagesReducer,
  [DELETED_PAGE_FEATURE_KEY]: deletedPageReducer
};
