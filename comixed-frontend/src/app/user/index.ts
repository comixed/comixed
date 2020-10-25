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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import {
  COMICVINE_API_KEY,
  IMPORT_COVER_SIZE,
  IMPORT_LAST_DIRECTORY,
  IMPORT_ROWS,
  IMPORT_SORT,
  LIBRARY_COVER_SIZE,
  LIBRARY_CURRENT_TAB,
  LIBRARY_ROWS,
  LIBRARY_SORT
} from './models/preferences.constants';
import * as fromRouter from '@ngrx/router-store';
import * as fromAuth from './reducers/authentication.reducer';
import * as fromUserAdmin from './reducers/user-admin.reducer';
import { UserAdminState } from './reducers/user-admin.reducer';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { Params } from '@angular/router';
import { AuthenticationState } from './models/authentication-state';

export { User } from './models/user';
export { Role } from './models/role';
export { Preference } from './models/preference';
export {
  LIBRARY_SORT,
  LIBRARY_ROWS,
  LIBRARY_COVER_SIZE,
  LIBRARY_CURRENT_TAB,
  IMPORT_SORT,
  IMPORT_ROWS,
  IMPORT_COVER_SIZE,
  IMPORT_LAST_DIRECTORY,
  COMICVINE_API_KEY
} from './models/preferences.constants';
export { ReaderGuard } from './guards/reader.guard';
export { AdminGuard } from './guards/admin.guard';
export { AuthenticationAdaptor } from './adaptors/authentication.adaptor';
export { TokenService } from './services/token.service';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface UserModuleState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  auth_state: AuthenticationState;
  user_admin_state: UserAdminState;
}

export type State = UserModuleState;

export const reducers: ActionReducerMap<UserModuleState> = {
  router: fromRouter.routerReducer,
  auth_state: fromAuth.reducer,
  user_admin_state: fromUserAdmin.reducer
};

export const metaReducers: MetaReducer<UserModuleState>[] = !environment.production
  ? []
  : [];

// testing fixtures
export * from './models/user.fixtures';
export * from './models/role.fixtures';
