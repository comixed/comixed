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

import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { Params } from '@angular/router';
import { ActionReducerMap } from '@ngrx/store';
import {
  reducer as userReducer,
  USER_FEATURE_KEY,
  UserState
} from './reducers/user.reducer';

export { getUserPreference } from '@app/user/user.functions';
export { AdminGuard } from '@app/user/guards/admin.guard';
export { ReaderGuard } from '@app/user/guards/reader.guard';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface UserModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [USER_FEATURE_KEY]: UserState;
}

export type ModuleState = UserModuleState;

export const reducers: ActionReducerMap<UserModuleState> = {
  router: routerReducer,
  [USER_FEATURE_KEY]: userReducer
};
