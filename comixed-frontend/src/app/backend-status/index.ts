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

import * as fromRouter from '@ngrx/router-store';
import * as fromBuildDetails from './reducers/build-details.reducer';
import { BuildDetailsState } from './reducers/build-details.reducer';
import * as fromClearTaskAuditLog from './reducers/clear-task-audit-log.reducer';
import * as fromLoadTaskAuditLog from './reducers/load-task-audit-log.reducer';
import { LoadTaskAuditLogState } from './reducers/load-task-audit-log.reducer';
import { Params } from '@angular/router';

import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { ClearTaskAuditLogState } from 'app/backend-status/reducers/clear-task-audit-log.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AppState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  build_details_state: BuildDetailsState;
  load_task_audit_log_state: LoadTaskAuditLogState;
  clear_task_audit_log_state: ClearTaskAuditLogState;
}

export type State = AppState;

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  build_details_state: fromBuildDetails.reducer,
  load_task_audit_log_state: fromLoadTaskAuditLog.reducer,
  clear_task_audit_log_state: fromClearTaskAuditLog.reducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
