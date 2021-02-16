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
  BLOCKED_PAGE_FEATURE_KEY,
  BlockedPageState,
  reducer as blockedPageReducer
} from './reducers/blocked-page.reducer';
import { ActionReducerMap } from '@ngrx/store';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface BlockedPageModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [BLOCKED_PAGE_FEATURE_KEY]: BlockedPageState;
}

export type ModuleState = BlockedPageModuleState;

export const reducers: ActionReducerMap<BlockedPageModuleState> = {
  router: routerReducer,
  [BLOCKED_PAGE_FEATURE_KEY]: blockedPageReducer
};
