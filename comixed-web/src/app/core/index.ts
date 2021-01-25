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
  BUSY_FEATURE_KEY,
  BusyState,
  reducer as busyReducer
} from '@app/core/reducers/busy.reducer';

export * from '@app/core/core.constants';
export * from '@app/core/core.functions';
export { SortableListItem } from '@app/core/models/ui/sortable-list-item';
export { TokenService } from '@app/core/services/token.service';
export { AlertService } from '@app/core/services/alert.service';
export { ConfirmationService } from '@app/core/services/confirmation.service';
export { TitleService } from '@app/core/services/title.service';

export {
  interpolate,
  compare,
  updateQueryParam
} from '@app/core/core.functions';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface CoreModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [BUSY_FEATURE_KEY]: BusyState;
}

export type ModuleState = CoreModuleState;

export const reducers: ActionReducerMap<CoreModuleState> = {
  router: routerReducer,
  [BUSY_FEATURE_KEY]: busyReducer
};
